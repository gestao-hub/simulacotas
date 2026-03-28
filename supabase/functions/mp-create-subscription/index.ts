import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RequestBody {
  ciclo: "mensal" | "anual" | "anual_vista"
  coupon_code?: string
}

const PRECOS = {
  mensal: 189.90,
  anual: 159.90,      // por mês, cobrado mensalmente
  anual_vista: 1798.80, // pagamento único
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Não autenticado")

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    )
    if (authError || !user) {
      console.error("Auth error:", authError?.message)
      throw new Error("Sessão expirada. Faça login novamente.")
    }

    const { ciclo, coupon_code }: RequestBody = await req.json()

    // Buscar MP access token das configurações
    const { data: mpSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "MP_ACCESS_TOKEN")
      .eq("is_active", true)
      .single()

    if (!mpSetting?.value) throw new Error("MP_ACCESS_TOKEN não configurado")
    const mpToken = mpSetting.value

    // Calcular valor com desconto
    let valor = PRECOS[ciclo]
    let desconto = 0

    if (coupon_code) {
      const { data: cupomResult } = await supabase.rpc("validate_coupon", { coupon_code })
      if (cupomResult?.[0]?.valid) {
        desconto = cupomResult[0].desconto
        valor = valor * (1 - desconto / 100)
        await supabase.rpc("increment_coupon_uses", { coupon_code })
      }
    }

    // Verificar se é empresa (10+ corretores = 10% desconto)
    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id")
      .eq("id", user.id)
      .single()

    if (profile?.empresa_id) {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("desconto_percentual")
        .eq("id", profile.empresa_id)
        .single()
      if (empresa?.desconto_percentual) {
        valor = valor * (1 - Number(empresa.desconto_percentual) / 100)
      }
    }

    // Criar assinatura no Mercado Pago (Preapproval)
    if (ciclo === "anual_vista") {
      // Pagamento único via Preference
      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mpToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{
            title: "SimulaCotas Pro — Anual",
            quantity: 1,
            unit_price: valor,
            currency_id: "BRL",
          }],
          payer: { email: user.email },
          back_urls: {
            success: `https://simulacotas.com.br/app?payment=success`,
            failure: `https://simulacotas.com.br/app?payment=failure`,
          },
          auto_return: "approved",
          external_reference: user.id,
          notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
          metadata: { user_id: user.id, ciclo, desconto },
        }),
      })

      const mpData = await mpResponse.json()
      if (!mpResponse.ok) throw new Error(mpData.message || "Erro no Mercado Pago")

      // Criar assinatura no banco
      await supabase.from("assinaturas").insert({
        user_id: user.id,
        empresa_id: profile?.empresa_id ?? null,
        tipo: profile?.empresa_id ? "empresa" : "individual",
        status: "trial", // muda para "ativo" no webhook
        mp_preapproval_id: mpData.id,
        valor_mensal: valor / 12,
        desconto_aplicado: desconto,
        ciclo,
        cupom_usado: coupon_code ?? null,
        data_proximo_pagamento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias trial
      })

      return new Response(JSON.stringify({
        checkout_url: mpData.init_point,
        valor_total: valor,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } else {
      // Assinatura recorrente via Preapproval
      const frequency = ciclo === "mensal" ? 1 : 1
      const frequencyType = "months"

      const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mpToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: `SimulaCotas Pro — ${ciclo === "mensal" ? "Mensal" : "Anual"}`,
          auto_recurring: {
            frequency,
            frequency_type: frequencyType,
            transaction_amount: valor,
            currency_id: "BRL",
            free_trial: {
              frequency: 3,
              frequency_type: "days",
            },
          },
          payer_email: user.email,
          back_url: `https://simulacotas.com.br/app`,
          external_reference: user.id,
          notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
          status: "pending",
        }),
      })

      const mpData = await mpResponse.json()
      if (!mpResponse.ok) throw new Error(mpData.message || "Erro no Mercado Pago")

      // Criar assinatura no banco
      await supabase.from("assinaturas").insert({
        user_id: user.id,
        empresa_id: profile?.empresa_id ?? null,
        tipo: profile?.empresa_id ? "empresa" : "individual",
        status: "trial",
        mp_preapproval_id: mpData.id,
        valor_mensal: valor,
        desconto_aplicado: desconto,
        ciclo,
        cupom_usado: coupon_code ?? null,
        data_proximo_pagamento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      })

      return new Response(JSON.stringify({
        checkout_url: mpData.init_point,
        preapproval_id: mpData.id,
        valor_mensal: valor,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
