import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const PROFILE_FIELDS = "id, email, full_name, phone, propostas_count, simulacoes_count"

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

  const results = { processed: 0, sent: 0, skipped: 0, errors: 0, whatsapp_sent: 0, email_sent: 0 }

  try {
    // Buscar config UAZAPI do platform_settings
    const uazapi = await getUazapiConfig(supabase)

    // Buscar campanhas ativas com trigger automático
    const { data: campanhas } = await supabase
      .from("campanhas")
      .select("*")
      .eq("status", "ativa")
      .neq("tipo_trigger", "manual")

    if (!campanhas || campanhas.length === 0) {
      return jsonResponse({ message: "Nenhuma campanha ativa", ...results })
    }

    for (const campanha of campanhas) {
      const eligibleUsers = await getEligibleUsers(supabase, campanha.tipo_trigger)

      for (const user of eligibleUsers) {
        results.processed++

        // Verificar se já recebeu essa campanha
        const { count } = await supabase
          .from("envios_campanha")
          .select("id", { count: "exact", head: true })
          .eq("campanha_id", campanha.id)
          .eq("user_id", user.id)

        if (count && count > 0) {
          results.skipped++
          continue
        }

        // Verificar opt-in
        const { data: prefs } = await supabase
          .from("preferencias_comunicacao")
          .select("email_opt_in, whatsapp_opt_in")
          .eq("user_id", user.id)
          .single()

        const canal = campanha.canal
        if (canal === "email" && prefs && !prefs.email_opt_in) { results.skipped++; continue }
        if (canal === "whatsapp" && prefs && !prefs.whatsapp_opt_in) { results.skipped++; continue }

        // Preparar variáveis
        const appUrl = "https://simulacotas.com.br"
        const variables: Record<string, string> = {
          nome: user.full_name || "Corretor",
          email: user.email || "",
          propostas_count: String(user.propostas_count || 0),
          simulacoes_count: String(user.simulacoes_count || 0),
          link_checkout: `${appUrl}/app/checkout`,
          link_app: `${appUrl}/app`,
        }

        // Adicionar cupom se existir
        if (campanha.cupom_id) {
          const { data: cupom } = await supabase
            .from("cupons")
            .select("codigo")
            .eq("id", campanha.cupom_id)
            .single()
          if (cupom) variables.cupom = cupom.codigo
        }

        try {
          // Enviar email
          if ((canal === "email" || canal === "ambos") && campanha.template_email_id) {
            const { data: template } = await supabase
              .from("templates_email")
              .select("nome")
              .eq("id", campanha.template_email_id)
              .single()

            if (template && user.email) {
              await supabase.functions.invoke("send-email", {
                body: {
                  to: user.email,
                  template_name: template.nome,
                  variables,
                },
              })
              results.email_sent++
            }
          }

          // Enviar WhatsApp via UAZAPI
          if ((canal === "whatsapp" || canal === "ambos") && campanha.template_whatsapp && user.phone) {
            const message = replaceVariables(campanha.template_whatsapp, variables)
            const sent = await sendWhatsApp(uazapi, user.phone, message)
            if (sent) results.whatsapp_sent++
          }

          // Registrar envio
          await supabase.from("envios_campanha").insert({
            campanha_id: campanha.id,
            user_id: user.id,
            canal,
            status: "enviado",
          })

          // Incrementar contador
          await supabase
            .from("campanhas")
            .update({ enviados_count: (campanha.enviados_count || 0) + 1 })
            .eq("id", campanha.id)

          results.sent++
        } catch (err) {
          console.error(`Erro ao enviar para ${user.email}:`, err)
          results.errors++
        }
      }
    }

    return jsonResponse(results)
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

// ─── UAZAPI Integration ───

interface UazapiConfig {
  url: string
  token: string
}

async function getUazapiConfig(supabase: ReturnType<typeof createClient>): Promise<UazapiConfig> {
  const { data: urlSetting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "UAZAPI_URL")
    .eq("is_active", true)
    .single()

  const { data: tokenSetting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "UAZAPI_TOKEN")
    .eq("is_active", true)
    .single()

  return {
    url: urlSetting?.value || "https://free.uazapi.com",
    token: tokenSetting?.value || "",
  }
}

async function sendWhatsApp(config: UazapiConfig, phone: string, text: string): Promise<boolean> {
  if (!config.token) {
    console.log(`[WA] Token UAZAPI não configurado. Mensagem para ${phone}: ${text.substring(0, 50)}...`)
    return false
  }

  // Limpar telefone: remover +, espaços, parênteses, hífens
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "")
  if (!cleanPhone || cleanPhone.length < 10) {
    console.log(`[WA] Telefone inválido: ${phone}`)
    return false
  }

  try {
    const response = await fetch(`${config.url}/send/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": config.token,
      },
      body: JSON.stringify({
        number: cleanPhone,
        text,
        delay: 2000, // 2s delay para simular digitação
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[WA] Erro UAZAPI ${response.status}: ${error}`)
      return false
    }

    console.log(`[WA] Enviado para ${cleanPhone}`)
    return true
  } catch (err) {
    console.error(`[WA] Falha ao enviar para ${cleanPhone}:`, err)
    return false
  }
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`)
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

// ─── Eligible Users Queries ───

async function getEligibleUsers(supabase: ReturnType<typeof createClient>, trigger: string) {
  const now = new Date()

  switch (trigger) {
    case "boas_vindas": {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .gte("created_at", twoHoursAgo)
        .eq("status", "trial")
      return data ?? []
    }

    case "trial_expirando": {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .eq("status", "trial")
        .gt("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", tomorrow)
      return data ?? []
    }

    case "trial_expirou": {
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .eq("status", "trial")
        .lt("trial_ends_at", now.toISOString())
      return data ?? []
    }

    case "inadimplente_3d": {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const { data: subs } = await supabase
        .from("assinaturas")
        .select(`user_id, profiles(${PROFILE_FIELDS})`)
        .eq("status", "inadimplente")
        .lt("data_proximo_pagamento", threeDaysAgo)

      return (subs ?? [])
        .map((s: { profiles: Record<string, unknown> | null }) => s.profiles)
        .filter(Boolean) as Array<{ id: string; email: string; full_name: string; phone: string | null; propostas_count: number; simulacoes_count: number }>
    }

    case "inativo_7d": {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .in("status", ["ativo", "trial"])
        .lt("updated_at", sevenDaysAgo)
      return data ?? []
    }

    case "inativo_30d": {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .eq("status", "ativo")
        .lt("updated_at", thirtyDaysAgo)
      return data ?? []
    }

    default:
      return []
  }
}
