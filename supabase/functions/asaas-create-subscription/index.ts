import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RequestBody {
  ciclo: "mensal" | "anual" | "anual_vista"
  billing_type: "PIX" | "CREDIT_CARD" | "BOLETO"
  coupon_code?: string
  credit_card?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  credit_card_holder_info?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    phone: string
  }
}

const PRECOS = {
  mensal: 189.90,
  anual: 159.90,
  anual_vista: 1798.80,
}

// Detectar ambiente pela chave: $aact_hmlg_ = sandbox, $aact_prod_ = produção
function getAsaasBaseUrl(apiKey: string): string {
  return apiKey.startsWith("$aact_hmlg_")
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3"
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
    if (authError || !user) throw new Error("Sessão expirada. Faça login novamente.")

    const body: RequestBody = await req.json()
    const { ciclo, billing_type, coupon_code, credit_card, credit_card_holder_info } = body

    // Buscar Asaas API Key
    const { data: asaasSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "ASAAS_API_KEY")
      .eq("is_active", true)
      .single()

    if (!asaasSetting?.value) throw new Error("ASAAS_API_KEY não configurada")
    const asaasKey = asaasSetting.value
    const ASAAS_BASE_URL = getAsaasBaseUrl(asaasKey)
    console.log("Asaas env:", asaasKey.startsWith("$aact_hmlg_") ? "SANDBOX" : "PRODUCTION", "URL:", ASAAS_BASE_URL)

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa_id, full_name, asaas_customer_id")
      .eq("id", user.id)
      .single()

    // Calcular valor com descontos
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

    valor = Math.round(valor * 100) / 100

    // 1. Criar/buscar customer no Asaas
    let customerId = profile?.asaas_customer_id

    if (!customerId) {
      // Verificar se já existe pelo email
      const searchRes = await fetch(`${ASAAS_BASE_URL}/customers?email=${user.email}`, {
        headers: { access_token: asaasKey, "User-Agent": "SimulaCotas" },
      })
      const searchData = await searchRes.json()

      if (searchData.data?.length > 0) {
        customerId = searchData.data[0].id
      } else {
        // Criar novo customer
        const customerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: "POST",
          headers: {
            access_token: asaasKey,
            "Content-Type": "application/json",
            "User-Agent": "SimulaCotas",
          },
          body: JSON.stringify({
            name: profile?.full_name || user.email?.split("@")[0] || "Cliente",
            email: user.email,
            cpfCnpj: credit_card_holder_info?.cpfCnpj || undefined,
            mobilePhone: credit_card_holder_info?.phone || undefined,
          }),
        })
        const customerData = await customerRes.json()
        if (!customerRes.ok) {
          const errMsg = customerData.errors?.map((e: { description: string }) => e.description).join(". ") || "Erro ao criar cliente no Asaas"
          console.error("Asaas customer error:", JSON.stringify(customerData))
          throw new Error(errMsg)
        }
        customerId = customerData.id
      }

      // Salvar no profile
      await supabase
        .from("profiles")
        .update({ asaas_customer_id: customerId })
        .eq("id", user.id)
    }

    // 2. Criar assinatura no Asaas
    const nextDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias de trial
    const dueDateStr = nextDueDate.toISOString().split("T")[0] // YYYY-MM-DD

    // PIX e Boleto usam UNDEFINED — o Asaas gera link onde o cliente escolhe o método
    // CREDIT_CARD envia direto com dados do cartão
    const asaasBillingType = billing_type === "CREDIT_CARD" ? "CREDIT_CARD" : "UNDEFINED"

    const subscriptionBody: Record<string, unknown> = {
      customer: customerId,
      billingType: asaasBillingType,
      value: ciclo === "anual_vista" ? valor : valor,
      nextDueDate: dueDateStr,
      cycle: ciclo === "anual_vista" ? "YEARLY" : "MONTHLY",
      description: ciclo === "mensal"
        ? "SimulaCotas Pro — Mensal"
        : ciclo === "anual"
        ? "SimulaCotas Pro — Mensal (Plano Anual)"
        : "SimulaCotas Pro — Anual à Vista",
      externalReference: user.id,
    }

    // Cartão de crédito: incluir dados do cartão
    if (billing_type === "CREDIT_CARD" && credit_card && credit_card_holder_info) {
      subscriptionBody.creditCard = credit_card
      subscriptionBody.creditCardHolderInfo = {
        name: credit_card_holder_info.name,
        email: credit_card_holder_info.email,
        cpfCnpj: credit_card_holder_info.cpfCnpj,
        postalCode: credit_card_holder_info.postalCode,
        phone: credit_card_holder_info.phone,
      }
    }

    const subRes = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
      method: "POST",
      headers: {
        access_token: asaasKey,
        "Content-Type": "application/json",
        "User-Agent": "SimulaCotas",
      },
      body: JSON.stringify(subscriptionBody),
    })

    const subData = await subRes.json()
    if (!subRes.ok) {
      const errMsg = subData.errors?.map((e: { description: string }) => e.description).join(". ") || "Erro ao criar assinatura no Asaas"
      console.error("Asaas subscription error:", JSON.stringify(subData))
      throw new Error(errMsg)
    }

    // 3. Salvar assinatura no banco
    await supabase.from("assinaturas").insert({
      user_id: user.id,
      empresa_id: profile?.empresa_id ?? null,
      tipo: profile?.empresa_id ? "empresa" : "individual",
      status: "trial",
      asaas_subscription_id: subData.id,
      asaas_customer_id: customerId,
      valor_mensal: ciclo === "anual_vista" ? valor / 12 : valor,
      desconto_aplicado: desconto,
      ciclo,
      cupom_usado: coupon_code ?? null,
      data_proximo_pagamento: dueDateStr,
    })

    // Salvar subscription_id no profile
    await supabase
      .from("profiles")
      .update({ asaas_subscription_id: subData.id })
      .eq("id", user.id)

    // 4. Buscar link de pagamento da primeira cobrança
    // Para PIX/boleto, o Asaas gera automaticamente uma cobrança na nextDueDate
    // Vamos buscar a URL de pagamento
    let paymentUrl = null

    if (billing_type !== "CREDIT_CARD") {
      // Buscar a cobrança criada pela assinatura
      const paymentsRes = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subData.id}/payments`, {
        headers: { access_token: asaasKey, "User-Agent": "SimulaCotas" },
      })
      const paymentsData = await paymentsRes.json()

      if (paymentsData.data?.length > 0) {
        paymentUrl = paymentsData.data[0].invoiceUrl
      }
    }

    return new Response(JSON.stringify({
      subscription_id: subData.id,
      payment_url: paymentUrl,
      billing_type,
      valor_mensal: ciclo === "anual_vista" ? valor / 12 : valor,
      valor_total: ciclo === "anual_vista" ? valor : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (err) {
    const msg = (err as Error).message || String(err)
    const stack = (err as Error).stack || ""
    console.error("Erro asaas-create-subscription:", msg, stack)
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
