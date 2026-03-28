import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        navigate('/app', { replace: true })
      } else if (event === 'SIGNED_OUT') {
        navigate('/?auth=login', { replace: true })
      }
    })

    // Fallback: se nada acontecer em 3s, manda pro login
    const timeout = setTimeout(() => {
      navigate('/?auth=login', { replace: true })
    }, 3000)

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="text-center">
        <img src="/assets/logo.png" alt="SimulaCotas" className="mx-auto mb-4 h-14" />
        <p className="text-sm text-gray-500">Verificando sua conta...</p>
      </div>
    </div>
  )
}
