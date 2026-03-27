import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/trackEvent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthFormProps {
  defaultMode?: 'login' | 'register'
  onSuccess?: () => void
}

export default function AuthForm({ defaultMode = 'login', onSuccess }: AuthFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(defaultMode === 'register')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    await trackEvent(isRegister ? 'registro' : 'login', { email })
    setLoading(false)

    if (onSuccess) {
      onSuccess()
    } else {
      navigate('/app')
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <img src="/assets/logo.png" alt="SimulaCotas" className="mx-auto mb-4 h-10" />
        <h2 className="text-xl font-bold text-[var(--color-navy)]">
          {isRegister ? 'Criar conta' : 'Entrar'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isRegister
            ? 'Comece seu trial gratuito de 3 dias'
            : 'Acesse sua conta SimulaCotas'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="auth-fullName">Nome completo</Label>
            <Input
              id="auth-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">Senha</Label>
          <Input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]" disabled={loading}>
          {loading ? 'Aguarde...' : isRegister ? 'Criar conta grátis' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        {isRegister ? (
          <p>Já tem conta?{' '}
            <button onClick={() => setIsRegister(false)} className="font-semibold text-[var(--color-navy)] underline">
              Entrar
            </button>
          </p>
        ) : (
          <p>Não tem conta?{' '}
            <button onClick={() => setIsRegister(true)} className="font-semibold text-[var(--color-navy)] underline">
              Criar conta grátis
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
