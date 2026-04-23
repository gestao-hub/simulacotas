import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Reconcilia status local com Asaas API
// Roda via cron diário para corrigir divergências causadas por webhooks perdidos

function getAsaasBaseUrl(apiKey: string): string {
  return apiKey.startsWith("$aact_hmlg_")
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3"
}

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Buscar Asaas API Key
    const { data: asaasSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ASAAS_API_KEY")
      .eq("is_active", true)
      .single()

    if (!asaasSetting?.value) {
      return new Response(JSON.stringify({ error: "ASAAS_API_KEY não configurada" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      })
    }

    const asaasKey = asaasSetting.value
    const baseUrl = getAsaasBaseUrl(asaasKey)
    const headers = { access_token: asaasKey, "User-Agent": "SimulaCotas" }

    // Buscar assinaturas ativas/trial/inadimplentes com asaas_subscription_id
    const { data: assinaturas } = await supabase
      .from("assinaturas")
      .select("id, user_id, asaas_subscription_id, status")
      .in("status", ["ativo", "trial", "inadimplente"])
      .not("asaas_subscription_id", "is", null)

    if (!assinaturas?.length) {
      return new Response(JSON.stringify({ ok: true, msg: "Nenhuma assinatura para reconciliar", count: 0 }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    let reconciled = 0
    let errors = 0

    const statusMap: Record<string, string> = {
      ACTIVE: "ativo",
      INACTIVE: "cancelado",
      EXPIRED: "cancelado",
    }

    for (const sub of assinaturas) {
      try {
        // Consultar status no Asaas
        const res = await fetch(`${baseUrl}/subscriptions/${sub.asaas_subscription_id}`, { headers })
        if (!res.ok) { errors++; continue }

        const asaasSub = await res.json()
        const asaasStatus = statusMap[asaasSub.status]

        if (!asaasStatus || asaasStatus === sub.status) continue // já sincronizado

        // Status divergiu — atualizar local
        await supabase
          .from("assinaturas")
          .update({ status: asaasStatus as "ativo" | "cancelado" })
          .eq("id", sub.id)

        await supabase
          .from("profiles")
          .update({ status: asaasStatus })
          .eq("id", sub.user_id)

        console.log(`Reconciliado: user=${sub.user_id} local=${sub.status} → asaas=${asaasStatus}`)
        reconciled++

        // Buscar pagamentos pendentes desta assinatura
        const paymentsRes = await fetch(
          `${baseUrl}/subscriptions/${sub.asaas_subscription_id}/payments?status=RECEIVED&limit=5`,
          { headers }
        )
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          for (const p of paymentsData.data || []) {
            // Upsert pagamentos que talvez não chegaram via webhook
            await supabase.from("pagamentos").upsert({
              asaas_payment_id: p.id,
              user_id: sub.user_id,
              valor: p.value,
              status: "approved",
              metodo: p.billingType === "PIX" ? "pix" : p.billingType === "BOLETO" ? "boleto" : "credit_card",
              data_pagamento: p.paymentDate || p.clientPaymentDate,
              data_vencimento: p.dueDate,
              asaas_response: p,
            }, { onConflict: "asaas_payment_id" })
          }
        }
      } catch (e) {
        console.error(`Erro ao reconciliar sub ${sub.id}:`, e)
        errors++
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      total: assinaturas.length,
      reconciled,
      errors,
    }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    console.error("Reconcile error:", err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    })
  }
})
