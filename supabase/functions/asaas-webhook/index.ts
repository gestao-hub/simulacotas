import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Helper: enviar email transacional (fire-and-forget, não bloqueia o webhook)
async function sendTransactionalEmail(
  baseUrl: string, serviceKey: string,
  to: string, templateName: string, variables: Record<string, string>
) {
  try {
    await fetch(`${baseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
      },
      body: JSON.stringify({ to, template_name: templateName, variables }),
    })
  } catch (e) {
    console.error("Erro ao enviar email transacional:", e)
  }
}

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    // Validar token do webhook
    const webhookToken = req.headers.get("asaas-access-token")
    const { data: tokenSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ASAAS_WEBHOOK_TOKEN")
      .eq("is_active", true)
      .single()

    if (tokenSetting?.value && webhookToken !== tokenSetting.value) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await req.json()
    const { event, payment, subscription } = body

    // ── Eventos de ASSINATURA ──
    if (event?.startsWith("SUBSCRIPTION_") && subscription) {
      const subId = subscription.id
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("user_id")
        .eq("asaas_subscription_id", subId)
        .single()

      if (assinatura?.user_id) {
        const userId = assinatura.user_id

        if (event === "SUBSCRIPTION_INACTIVATED" || event === "SUBSCRIPTION_DELETED") {
          await supabase
            .from("assinaturas")
            .update({
              status: "cancelado",
              data_cancelamento: new Date().toISOString(),
            })
            .eq("asaas_subscription_id", subId)

          await supabase
            .from("profiles")
            .update({ status: "cancelado" })
            .eq("id", userId)

          await supabase.from("user_events").insert({
            user_id: userId,
            event_type: "assinatura_cancelada",
            metadata: { subscription_id: subId, event },
          })

          // Email: assinatura cancelada
          const { data: subProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", userId)
            .single()
          if (subProfile?.email) {
            sendTransactionalEmail(SUPABASE_URL, SERVICE_KEY, subProfile.email, "Assinatura cancelada", {
              nome: subProfile.full_name || "Cliente",
            })
          }
        } else if (event === "SUBSCRIPTION_UPDATED") {
          await supabase.from("user_events").insert({
            user_id: userId,
            event_type: "assinatura_atualizada",
            metadata: { subscription_id: subId },
          })
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // ── Eventos de PAGAMENTO ──
    if (!payment) {
      return new Response(JSON.stringify({ ok: true, msg: "Evento sem payment, ignorado" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Buscar userId pela assinatura ou externalReference
    let userId: string | null = payment.externalReference || null

    if (!userId && payment.subscription) {
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("user_id")
        .eq("asaas_subscription_id", payment.subscription)
        .single()
      userId = assinatura?.user_id ?? null
    }

    if (!userId) {
      // Tentar buscar pelo customer_id no profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("asaas_customer_id", payment.customer)
        .single()
      userId = prof?.id ?? null
    }

    if (!userId) {
      console.error("Webhook: userId não encontrado para payment", payment.id)
      return new Response(JSON.stringify({ ok: true, msg: "userId não encontrado" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Buscar dados do usuário para emails transacionais
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single()
    const userName = userProfile?.full_name || "Cliente"
    const userEmail = userProfile?.email

    // Mapear método de pagamento
    const metodoMap: Record<string, string> = {
      BOLETO: "boleto",
      PIX: "pix",
      CREDIT_CARD: "credit_card",
      DEBIT_CARD: "debit_card",
      UNDEFINED: "pix",
    }

    // Mapear status do pagamento para nosso enum
    const statusMap: Record<string, string> = {
      PENDING: "pending",
      RECEIVED: "approved",
      CONFIRMED: "approved",
      OVERDUE: "pending",
      REFUNDED: "refunded",
      RECEIVED_IN_CASH: "approved",
      REFUND_REQUESTED: "in_process",
      REFUND_IN_PROGRESS: "in_process",
      CHARGEBACK_REQUESTED: "rejected",
      CHARGEBACK_DISPUTE: "rejected",
      AWAITING_CHARGEBACK_REVERSAL: "in_process",
      DUNNING_REQUESTED: "pending",
      DUNNING_RECEIVED: "approved",
      AWAITING_RISK_ANALYSIS: "in_process",
    }

    const paymentStatus = statusMap[payment.status] || "pending"
    const paymentMetodo = metodoMap[payment.billingType] || "pix"

    // Eventos de pagamento
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      // Registrar pagamento
      await supabase.from("pagamentos").upsert({
        asaas_payment_id: payment.id,
        user_id: userId,
        valor: payment.value,
        status: "approved",
        metodo: paymentMetodo,
        data_pagamento: new Date().toISOString(),
        data_vencimento: payment.dueDate,
        asaas_response: payment,
      }, { onConflict: "asaas_payment_id" })

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

      // Evento
      await supabase.from("user_events").insert({
        user_id: userId,
        event_type: "pagamento_aprovado",
        metadata: { payment_id: payment.id, valor: payment.value, metodo: paymentMetodo },
      })

      // Email: pagamento aprovado
      if (userEmail) {
        const metodoLabel: Record<string, string> = { pix: "PIX", credit_card: "Cartão de Crédito", boleto: "Boleto" }
        sendTransactionalEmail(SUPABASE_URL, SERVICE_KEY, userEmail, "Pagamento aprovado", {
          nome: userName,
          valor: Number(payment.value).toFixed(2),
          metodo: metodoLabel[paymentMetodo] || paymentMetodo,
          data: new Date().toLocaleDateString("pt-BR"),
        })
      }

    } else if (event === "PAYMENT_OVERDUE") {
      // Pagamento vencido
      await supabase.from("pagamentos").upsert({
        asaas_payment_id: payment.id,
        user_id: userId,
        valor: payment.value,
        status: "pending",
        metodo: paymentMetodo,
        data_vencimento: payment.dueDate,
        asaas_response: payment,
      }, { onConflict: "asaas_payment_id" })

      // Incrementar falhas
      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("tentativas_falha")
        .eq("user_id", userId)
        .in("status", ["ativo", "trial", "inadimplente"])
        .single()

      const falhas = (assinatura?.tentativas_falha ?? 0) + 1

      await supabase
        .from("assinaturas")
        .update({
          tentativas_falha: falhas,
          ...(falhas >= 3 ? { status: "inadimplente" as const } : {}),
        })
        .eq("user_id", userId)
        .in("status", ["ativo", "trial", "inadimplente"])

      if (falhas >= 3) {
        await supabase
          .from("profiles")
          .update({ status: "inadimplente" })
          .eq("id", userId)
      }

      await supabase.from("user_events").insert({
        user_id: userId,
        event_type: "pagamento_falhou",
        metadata: { payment_id: payment.id, tentativas: falhas },
      })

      // Email: pagamento falhou
      if (userEmail) {
        sendTransactionalEmail(SUPABASE_URL, SERVICE_KEY, userEmail, "Pagamento falhou", {
          nome: userName,
          valor: Number(payment.value).toFixed(2),
          tentativas: String(falhas),
        })
      }

    } else if (event === "PAYMENT_REFUNDED" || event === "PAYMENT_PARTIALLY_REFUNDED") {
      await supabase.from("pagamentos").upsert({
        asaas_payment_id: payment.id,
        user_id: userId,
        valor: payment.value,
        status: "refunded",
        metodo: paymentMetodo,
        asaas_response: payment,
      }, { onConflict: "asaas_payment_id" })

    } else if (event === "PAYMENT_CREATED") {
      // Apenas registrar, sem mudar status
      await supabase.from("pagamentos").upsert({
        asaas_payment_id: payment.id,
        user_id: userId,
        valor: payment.value,
        status: paymentStatus,
        metodo: paymentMetodo,
        data_vencimento: payment.dueDate,
        asaas_response: payment,
      }, { onConflict: "asaas_payment_id" })
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
