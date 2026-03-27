import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// Executado via cron diário (Supabase Cron Jobs ou externo)
// Verifica assinaturas com pagamento vencido e executa ações da régua de cobrança

serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Buscar regras de cobrança ativas
    const { data: regras } = await supabase
      .from("regras_cobranca")
      .select("*")
      .eq("is_active", true)
      .order("dias_apos_vencimento")

    if (!regras || regras.length === 0) {
      return new Response(JSON.stringify({ message: "Sem regras ativas" }))
    }

    // Buscar assinaturas com pagamento vencido
    const { data: assinaturas } = await supabase
      .from("assinaturas")
      .select("*, profiles(id, full_name, email, phone)")
      .in("status", ["ativo", "inadimplente"])
      .lt("data_proximo_pagamento", new Date().toISOString())

    if (!assinaturas || assinaturas.length === 0) {
      return new Response(JSON.stringify({ message: "Sem assinaturas vencidas" }))
    }

    let acoes = 0

    for (const assinatura of assinaturas) {
      const vencimento = new Date(assinatura.data_proximo_pagamento)
      const diasVencido = Math.floor((Date.now() - vencimento.getTime()) / (1000 * 60 * 60 * 24))

      // Encontrar a regra aplicável (maior dias_apos_vencimento que se encaixa)
      const regraAplicavel = regras
        .filter((r: { dias_apos_vencimento: number }) => r.dias_apos_vencimento <= diasVencido)
        .pop()

      if (!regraAplicavel) continue

      // Verificar se já executou esta regra para esta assinatura
      const { data: jaExecutou } = await supabase
        .from("log_cobranca")
        .select("id")
        .eq("assinatura_id", assinatura.id)
        .eq("regra_id", regraAplicavel.id)
        .limit(1)

      if (jaExecutou && jaExecutou.length > 0) continue

      const profile = assinatura.profiles as { id: string; full_name: string; email: string; phone: string }
      const appUrl = "https://simulacotas.com.br"
      const mensagem = (regraAplicavel.template_mensagem ?? "")
        .replace("{{nome}}", profile?.full_name ?? "")
        .replace("{{link_pagamento}}", `${appUrl}/app/checkout`)
        .replace("{{link_reativacao}}", `${appUrl}/app/checkout`)

      let resultado = "pendente"

      // Executar ação
      switch (regraAplicavel.acao) {
        case "whatsapp": {
          if (profile?.phone) {
            const { data: uazapiUrl } = await supabase.from("platform_settings").select("value").eq("key", "UAZAPI_URL").eq("is_active", true).single()
            const { data: uazapiToken } = await supabase.from("platform_settings").select("value").eq("key", "UAZAPI_TOKEN").eq("is_active", true).single()
            if (uazapiUrl?.value && uazapiToken?.value) {
              const cleanPhone = profile.phone.replace(/[\s\-\(\)\+]/g, "")
              try {
                await fetch(`${uazapiUrl.value}/send/text`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "token": uazapiToken.value },
                  body: JSON.stringify({ number: cleanPhone, text: mensagem, delay: 2000 }),
                })
                resultado = "whatsapp_enviado"
              } catch { resultado = "whatsapp_falhou" }
            } else { resultado = "whatsapp_sem_config" }
          } else { resultado = "whatsapp_sem_telefone" }
          break
        }

        case "email":
          try {
            await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: profile?.email,
                subject: "Seu pagamento do SimulaCotas está pendente",
                html: `<p>${mensagem}</p>`,
              }),
            })
            resultado = "email_enviado"
          } catch {
            resultado = "email_falhou"
          }
          break

        case "bloquear":
          await supabase
            .from("profiles")
            .update({ status: "suspenso" })
            .eq("id", profile?.id)
          await supabase
            .from("assinaturas")
            .update({ status: "suspenso" })
            .eq("id", assinatura.id)
          resultado = "bloqueado"
          break

        case "cancelar":
          await supabase
            .from("profiles")
            .update({ status: "cancelado" })
            .eq("id", profile?.id)
          await supabase
            .from("assinaturas")
            .update({
              status: "cancelado",
              data_cancelamento: new Date().toISOString(),
              motivo_cancelamento: "Inadimplência — cancelamento automático após 30 dias",
            })
            .eq("id", assinatura.id)
          resultado = "cancelado"
          break
      }

      // Registrar log
      await supabase.from("log_cobranca").insert({
        assinatura_id: assinatura.id,
        regra_id: regraAplicavel.id,
        acao_executada: regraAplicavel.acao,
        resultado,
      })

      acoes++
    }

    return new Response(JSON.stringify({
      message: `Processado. ${acoes} ações executadas de ${assinaturas.length} assinaturas vencidas.`,
    }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    console.error("billing-collection error:", err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
