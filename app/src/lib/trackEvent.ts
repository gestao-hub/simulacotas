import { supabase } from '@/lib/supabase'

export async function trackEvent(eventType: string, metadata?: Record<string, unknown>) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('user_events').insert({
      user_id: session?.user?.id ?? null,
      event_type: eventType,
      metadata: metadata ?? {},
    })
  } catch {
    // Silently fail — tracking should never block UX
  }
}
