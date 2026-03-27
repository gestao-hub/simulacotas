import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

  const results = { processed: 0, sent: 0, skipped: 0, errors: 0 }

  try {
    // Buscar campanhas ativas com trigger automático
    const { data: campanhas } = await supabase
      .from("campanhas")
      .select("*")
      .eq("status", "ativa")
      .neq("tipo_trigger", "manual")

    if (!campanhas || campanhas.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhuma campanha ativa", ...results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
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
        const variables: Record<string, string> = {
          nome: user.full_name || "Corretor",
          email: user.email || "",
          propostas_count: String(user.propostas_count || 0),
          simulacoes_count: String(user.simulacoes_count || 0),
          link_checkout: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".vercel.app")}/app/checkout`,
          link_app: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".vercel.app")}/app`,
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
            }
          }

          // Registrar envio WhatsApp (TODO: integrar UAZAPI)
          if ((canal === "whatsapp" || canal === "ambos") && campanha.template_whatsapp) {
            // Por enquanto só loga — integrar com UAZAPI depois
            console.log(`[WA] ${user.full_name}: ${campanha.template_whatsapp.substring(0, 50)}...`)
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

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function getEligibleUsers(supabase: ReturnType<typeof createClient>, trigger: string) {
  const now = new Date()

  switch (trigger) {
    case "boas_vindas": {
      // Profiles criados nas últimas 2 horas
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, propostas_count, simulacoes_count")
        .gte("created_at", twoHoursAgo)
        .eq("status", "trial")
      return data ?? []
    }

    case "trial_expirando": {
      // Trial expira nas próximas 24h
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, propostas_count, simulacoes_count")
        .eq("status", "trial")
        .gt("trial_ends_at", now.toISOString())
        .lte("trial_ends_at", tomorrow)
      return data ?? []
    }

    case "trial_expirou": {
      // Trial expirou (status ainda trial mas trial_ends_at no passado)
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, propostas_count, simulacoes_count")
        .eq("status", "trial")
        .lt("trial_ends_at", now.toISOString())
      return data ?? []
    }

    case "inadimplente_3d": {
      // Assinaturas com pagamento atrasado > 3 dias
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const { data: subs } = await supabase
        .from("assinaturas")
        .select("user_id, profiles(id, email, full_name, propostas_count, simulacoes_count)")
        .eq("status", "inadimplente")
        .lt("data_proximo_pagamento", threeDaysAgo)

      return (subs ?? [])
        .map((s: { profiles: Record<string, unknown> | null }) => s.profiles)
        .filter(Boolean) as Array<{ id: string; email: string; full_name: string; propostas_count: number; simulacoes_count: number }>
    }

    case "inativo_7d": {
      // Usuários ativos que não atualizaram em 7 dias (sensor de inatividade)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, propostas_count, simulacoes_count")
        .in("status", ["ativo", "trial"])
        .lt("updated_at", sevenDaysAgo)
      return data ?? []
    }

    case "inativo_30d": {
      // Usuários ativos que não atualizaram em 30 dias
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, propostas_count, simulacoes_count")
        .eq("status", "ativo")
        .lt("updated_at", thirtyDaysAgo)
      return data ?? []
    }

    default:
      return []
  }
}
