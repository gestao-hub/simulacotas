import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  to: string
  template_name?: string
  subject?: string
  html?: string
  variables?: Record<string, string>
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { to, template_name, subject, html, variables }: EmailRequest = await req.json()

    // Buscar API key do Resend
    const { data: resendSetting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "RESEND_API_KEY")
      .eq("is_active", true)
      .single()

    if (!resendSetting?.value) throw new Error("RESEND_API_KEY não configurada")

    let finalSubject = subject ?? ""
    let finalHtml = html ?? ""

    // Se template_name, buscar do banco
    if (template_name) {
      const { data: template } = await supabase
        .from("templates_email")
        .select("assunto, html_content")
        .eq("nome", template_name)
        .eq("is_active", true)
        .single()

      if (template) {
        finalSubject = template.assunto
        finalHtml = template.html_content
      }
    }

    // Substituir variáveis
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        finalSubject = finalSubject.replaceAll(`{{${key}}}`, value)
        finalHtml = finalHtml.replaceAll(`{{${key}}}`, value)
      }
    }

    // Enviar via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendSetting.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SimulaCotas <noreply@piperhub.com.br>",
        to: [to],
        subject: finalSubject,
        html: finalHtml,
      }),
    })

    const resendData = await resendResponse.json()
    if (!resendResponse.ok) throw new Error(resendData.message || "Erro ao enviar email")

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
