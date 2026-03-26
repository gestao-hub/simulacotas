import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const body = await req.json()
    const { type, data } = body

    // Mercado Pago envia notificações de diferentes tipos
    if (type === "payment") {
      // Buscar detalhes do pagamento no MP
      const { data: mpSetting } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "MP_ACCESS_TOKEN")
        .eq("is_active", true)
        .single()

      if (!mpSetting?.value) throw new Error("MP_ACCESS_TOKEN não configurado")

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        { headers: { "Authorization": `Bearer ${mpSetting.value}` } },
      )
      const payment = await paymentResponse.json()

      const userId = payment.external_reference || payment.metadata?.user_id
      if (!userId) throw new Error("user_id não encontrado no pagamento")

      // Registrar pagamento
      await supabase.from("pagamentos").insert({
        user_id: userId,
        mp_payment_id: String(data.id),
        valor: payment.transaction_amount,
        status: payment.status, // approved, rejected, pending, in_process
        metodo: mapPaymentMethod(payment.payment_type_id),
        data_pagamento: payment.status === "approved" ? new Date().toISOString() : null,
        data_vencimento: payment.date_of_expiration ?? null,
        mp_response: payment,
      })

      // Atualizar assinatura baseado no status
      if (payment.status === "approved") {
        // Ativar assinatura
        await supabase
          .from("assinaturas")
          .update({
            status: "ativo",
            tentativas_falha: 0,
            data_proximo_pagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("user_id", userId)
          .in("status", ["trial", "inadimplente"])

        // Ativar profile
        await supabase
          .from("profiles")
          .update({ status: "ativo" })
          .eq("id", userId)

        // Registrar evento
        await supabase.from("user_events").insert({
          user_id: userId,
          event_type: "pagamento_aprovado",
          metadata: { payment_id: data.id, valor: payment.transaction_amount },
        })

      } else if (payment.status === "rejected") {
        // Incrementar falhas
        const { data: assinatura } = await supabase
          .from("assinaturas")
          .select("tentativas_falha")
          .eq("user_id", userId)
          .single()

        const falhas = (assinatura?.tentativas_falha ?? 0) + 1

        await supabase
          .from("assinaturas")
          .update({
            tentativas_falha: falhas,
            status: falhas >= 3 ? "inadimplente" : undefined,
          })
          .eq("user_id", userId)

        if (falhas >= 3) {
          await supabase
            .from("profiles")
            .update({ status: "inadimplente" })
            .eq("id", userId)
        }

        await supabase.from("user_events").insert({
          user_id: userId,
          event_type: "pagamento_falhou",
          metadata: { payment_id: data.id, tentativas: falhas },
        })
      }

    } else if (type === "subscription_preapproval") {
      // Atualização de status da assinatura recorrente
      const { data: mpSetting } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "MP_ACCESS_TOKEN")
        .eq("is_active", true)
        .single()

      const subResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        { headers: { "Authorization": `Bearer ${mpSetting!.value}` } },
      )
      const sub = await subResponse.json()

      const statusMap: Record<string, string> = {
        authorized: "ativo",
        paused: "suspenso",
        cancelled: "cancelado",
        pending: "trial",
      }

      const newStatus = statusMap[sub.status]
      if (newStatus) {
        await supabase
          .from("assinaturas")
          .update({ status: newStatus as "ativo" | "suspenso" | "cancelado" | "trial" })
          .eq("mp_preapproval_id", String(data.id))

        // Buscar user_id da assinatura
        const { data: assinatura } = await supabase
          .from("assinaturas")
          .select("user_id")
          .eq("mp_preapproval_id", String(data.id))
          .single()

        if (assinatura?.user_id && newStatus) {
          await supabase
            .from("profiles")
            .update({ status: newStatus })
            .eq("id", assinatura.user_id)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("Webhook error:", err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

function mapPaymentMethod(type: string): string {
  const map: Record<string, string> = {
    credit_card: "credit_card",
    debit_card: "debit_card",
    bank_transfer: "pix",
    ticket: "boleto",
    pix: "pix",
  }
  return map[type] ?? "credit_card"
}
