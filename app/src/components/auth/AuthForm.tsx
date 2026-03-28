import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/trackEvent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  defaultMode?: 'login' | 'register'
  onSuccess?: () => void
}

const inputClassName = 'border-gray-300 bg-white/60 focus:border-[var(--color-navy)] focus:ring-[var(--color-navy)]/20'

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' }
  if (score <= 2) return { level: 2, label: 'Razoável', color: 'bg-orange-400' }
  if (score <= 3) return { level: 3, label: 'Boa', color: 'bg-yellow-400' }
  if (score <= 4) return { level: 4, label: 'Forte', color: 'bg-lime-500' }
  return { level: 5, label: 'Excelente', color: 'bg-green-500' }
}

export default function AuthForm({ defaultMode = 'login', onSuccess }: AuthFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(defaultMode === 'register')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Carregar login salvo do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sc_remember_login')
    if (saved) {
      try {
        const { email: e, password: p } = JSON.parse(atob(saved))
        setEmail(e)
        setPassword(p)
        setRememberMe(true)
      } catch { /* ignore */ }
    }
  }, [])

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/config`,
      })
      if (error) { setError(error.message); setLoading(false); return }
      setResetSent(true)
      setLoading(false)
      return
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false); return }

      // Se não retornou sessão, precisa confirmar email
      if (!data.session) {
        await trackEvent('registro', { email })
        setConfirmationSent(true)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    // Salvar ou limpar login no localStorage
    if (!isRegister) {
      if (rememberMe) {
        localStorage.setItem('sc_remember_login', btoa(JSON.stringify({ email, password })))
      } else {
        localStorage.removeItem('sc_remember_login')
      }
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
        <img src="/assets/logo.png" alt="SimulaCotas" className="mx-auto mb-4 h-14" />
        <h2 className="text-xl font-bold text-[var(--color-navy)]">
          {isForgotPassword ? 'Recuperar senha' : isRegister ? 'Criar conta' : 'Entrar'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isForgotPassword
            ? 'Digite seu email para receber o link de redefinição'
            : isRegister
              ? 'Comece seu trial gratuito de 3 dias'
              : 'Acesse sua conta SimulaCotas'}
        </p>
      </div>

      {confirmationSent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-sm font-semibold text-gray-900">Conta criada com sucesso!</p>
          <p className="text-sm text-gray-600">
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra seu email e clique no link para ativar sua conta.
          </p>
          <p className="text-xs text-gray-400">Não recebeu? Verifique a pasta de spam.</p>
          <button
            onClick={() => { setConfirmationSent(false); setIsRegister(false); setError('') }}
            className="text-sm font-semibold text-[var(--color-navy)] underline transition-colors hover:text-[var(--color-lime-dark)]"
          >
            Ir para o login
          </button>
        </div>
      ) : resetSent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm text-gray-600">
            Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada.
          </p>
          <button
            onClick={() => { setIsForgotPassword(false); setResetSent(false); setError('') }}
            className="text-sm font-semibold text-[var(--color-navy)] underline transition-colors hover:text-[var(--color-lime-dark)]"
          >
            Voltar ao login
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && !isForgotPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="auth-fullName">Nome completo</Label>
                  <Input
                    id="auth-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-phone">WhatsApp</Label>
                  <Input
                    id="auth-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputClassName}
                  />
                </div>
              </>
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
                className={inputClassName}
              />
            </div>
            {!isForgotPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                      className={`${inputClassName} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Medidor de força — só no cadastro */}
                  {isRegister && password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              i <= strength.level ? strength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Força: <span className="font-medium">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmação de senha — só no cadastro */}
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Input
                        id="auth-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        required
                        className={`${inputClassName} pr-10 ${confirmPassword && !passwordsMatch ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-[11px] text-red-500">As senhas não coincidem</p>
                    )}
                  </div>
                )}

                {/* Lembrar-me — só no login */}
                {!isRegister && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]/20"
                    />
                    <span className="text-sm text-gray-500">Lembrar meu login</span>
                  </label>
                )}
              </>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--color-navy)] text-white transition-all duration-200 hover:bg-[var(--color-navy-light)] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              disabled={loading || (isRegister && !passwordsMatch)}
            >
              {loading ? 'Aguarde...' : isForgotPassword ? 'Enviar link' : isRegister ? 'Criar conta grátis' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            {isForgotPassword ? (
              <button
                onClick={() => { setIsForgotPassword(false); setError('') }}
                className="font-semibold text-[var(--color-navy)] underline transition-colors hover:text-[var(--color-lime-dark)]"
              >
                Voltar ao login
              </button>
            ) : isRegister ? (
              <p>Já tem conta?{' '}
                <button onClick={() => setIsRegister(false)} className="font-semibold text-[var(--color-navy)] underline transition-colors hover:text-[var(--color-lime-dark)]">
                  Entrar
                </button>
              </p>
            ) : (
              <>
                <p>Não tem conta?{' '}
                  <button onClick={() => setIsRegister(true)} className="font-semibold text-[var(--color-navy)] underline transition-colors hover:text-[var(--color-lime-dark)]">
                    Criar conta grátis
                  </button>
                </p>
                <p>
                  <button onClick={() => { setIsForgotPassword(true); setError('') }} className="text-gray-400 transition-colors hover:text-[var(--color-navy)]">
                    Esqueceu a senha?
                  </button>
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
