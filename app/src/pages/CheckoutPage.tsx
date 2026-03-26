import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/trackEvent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Building2, Tag } from 'lucide-react'

type Ciclo = 'mensal' | 'anual' | 'anual_vista'

const planos: { ciclo: Ciclo; label: string; preco: string; precoCheio?: string; badge?: string; destaque: boolean }[] = [
  { ciclo: 'mensal', label: 'Mensal', preco: 'R$ 189,90/mês', destaque: false },
  { ciclo: 'anual', label: 'Anual', preco: 'R$ 159,90/mês', precoCheio: 'R$ 189,90', badge: '16% OFF', destaque: true },
  { ciclo: 'anual_vista', label: 'Anual à vista', preco: 'R$ 1.798,80', precoCheio: 'R$ 2.278,80', badge: '21% OFF', destaque: false },
]

const features = [
  'Simulações ilimitadas',
  'Todas as administradoras',
  'Propostas em PDF com seu branding',
  'Compartilhamento via WhatsApp',
  'Histórico completo',
  'Cadastro de clientes',
  'PWA — use como app no celular',
  'Suporte via WhatsApp',
]

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const [ciclo, setCiclo] = useState<Ciclo>('anual')
  const [cupom, setCupom] = useState('')
  const [cupomValido, setCupomValido] = useState<{ valid: boolean; desconto: number; mensagem: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const validarCupom = async () => {
    if (!cupom.trim()) return
    const { data } = await supabase.functions.invoke('validate-coupon', {
      body: { code: cupom.trim().toUpperCase() },
    })
    setCupomValido(data)
  }

  const handleAssinar = async () => {
    if (!user) return
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('mp-create-subscription', {
        body: {
          ciclo,
          coupon_code: cupomValido?.valid ? cupom.trim().toUpperCase() : undefined,
        },
      })

      if (error) throw error

      await trackEvent('checkout_iniciado', { ciclo, cupom: cupom || null })

      // Redirecionar para checkout do Mercado Pago
      if (data?.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (err) {
      console.error('Erro no checkout:', err)
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const trialDias = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Assine o SimulaCotas Pro</h1>
        <p className="text-[var(--color-muted)]">
          {trialDias > 0
            ? `Seu trial expira em ${trialDias} dia${trialDias > 1 ? 's' : ''}. Assine para não perder acesso.`
            : 'Tudo ilimitado. Sem surpresas. Cancele quando quiser.'}
        </p>
      </div>

      {/* Planos */}
      <div className="grid gap-3 sm:grid-cols-3">
        {planos.map((p) => (
          <Card
            key={p.ciclo}
            className={`cursor-pointer transition-all ${
              ciclo === p.ciclo
                ? 'border-2 border-[var(--color-lime)] shadow-lg'
                : 'border hover:border-[var(--color-lime-dark)]'
            } ${p.destaque ? 'ring-2 ring-[var(--color-lime)]/30' : ''}`}
            onClick={() => setCiclo(p.ciclo)}
          >
            <CardContent className="p-4 text-center">
              {p.badge && (
                <Badge className="mb-2 bg-[var(--color-lime)] text-[var(--color-navy)]">{p.badge}</Badge>
              )}
              <p className="text-sm font-bold text-[var(--color-navy)]">{p.label}</p>
              <p className="mt-1 text-xl font-extrabold text-[var(--color-navy)]">{p.preco}</p>
              {p.precoCheio && (
                <p className="text-xs text-[var(--color-muted)] line-through">{p.precoCheio}</p>
              )}
              {ciclo === p.ciclo && (
                <div className="mt-2 flex justify-center">
                  <Check size={20} className="text-[var(--color-lime-dark)]" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empresa */}
      {profile?.empresa_id && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 size={20} className="text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-800">
              Desconto de empresa aplicado automaticamente (10% por corretor)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cupom */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Tag size={18} className="shrink-0 text-[var(--color-muted)]" />
          <Input
            value={cupom}
            onChange={(e) => { setCupom(e.target.value); setCupomValido(null) }}
            placeholder="Código de cupom"
            className="flex-1 font-mono uppercase"
          />
          <Button variant="outline" onClick={validarCupom} disabled={!cupom.trim()}>Aplicar</Button>
        </CardContent>
        {cupomValido && (
          <div className={`border-t px-4 py-2 text-sm font-semibold ${cupomValido.valid ? 'text-green-600' : 'text-red-500'}`}>
            {cupomValido.mensagem} {cupomValido.valid && `— ${cupomValido.desconto}% de desconto`}
          </div>
        )}
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap size={16} className="text-[var(--color-lime-dark)]" /> Tudo incluso no Pro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check size={14} className="shrink-0 text-[var(--color-lime-dark)]" />
                {f}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button
        onClick={handleAssinar}
        disabled={loading}
        className="w-full gap-2 bg-[var(--color-navy)] py-6 text-lg font-bold"
        size="lg"
      >
        {loading ? 'Redirecionando ao Mercado Pago...' : 'Assinar agora'}
      </Button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        Pagamento seguro via Mercado Pago. Cancele quando quiser.
      </p>
    </div>
  )
}
