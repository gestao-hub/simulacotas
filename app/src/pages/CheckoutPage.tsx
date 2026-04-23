import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/trackEvent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Zap, Building2, Tag, QrCode, CreditCard, FileText, MapPin, User } from 'lucide-react'
import { LumaSpin } from '@/components/ui/luma-spin'

type Ciclo = 'mensal' | 'anual' | 'anual_vista'
type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

const planos: { ciclo: Ciclo; label: string; preco: string; detalhe: string; precoCheio?: string; badge?: string; destaque: boolean }[] = [
  { ciclo: 'mensal', label: 'Mensal', preco: 'R$ 189,90/mês', detalhe: 'Sem compromisso', destaque: false },
  { ciclo: 'anual', label: 'Anual', preco: 'R$ 159,90/mês', detalhe: '12 parcelas mensais', precoCheio: 'R$ 189,90', badge: '16% OFF', destaque: true },
  { ciclo: 'anual_vista', label: 'Anual à vista', preco: 'R$ 1.798,80', detalhe: 'Pagamento único', precoCheio: 'R$ 2.278,80', badge: '21% OFF', destaque: false },
]

const metodos: { type: BillingType; label: string; icon: typeof QrCode; desc: string }[] = [
  { type: 'PIX', label: 'PIX', icon: QrCode, desc: 'Aprovação instantânea' },
  { type: 'CREDIT_CARD', label: 'Cartão', icon: CreditCard, desc: 'Débito automático' },
  { type: 'BOLETO', label: 'Boleto', icon: FileText, desc: 'Vence em 3 dias' },
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
  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [cupom, setCupom] = useState('')
  const [cupomValido, setCupomValido] = useState<{ valid: boolean; desconto: number; mensagem: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Campos de cartão
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardCpf, setCardCpf] = useState('')
  const [cardCep, setCardCep] = useState('')
  const [cardPhone, setCardPhone] = useState('')

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
      const body: Record<string, unknown> = {
        ciclo,
        billing_type: billingType,
        coupon_code: cupomValido?.valid ? cupom.trim().toUpperCase() : undefined,
      }

      if (billingType === 'CREDIT_CARD') {
        const cleanCard = cardNumber.replace(/\s/g, '')
        const cleanCpf = cardCpf.replace(/\D/g, '')
        const cleanCep = cardCep.replace(/\D/g, '')

        if (!cardName || !cleanCard || !cardExpiry || !cardCvv || !cleanCpf || !cleanCep) {
          alert('Preencha todos os dados do cartão.')
          setLoading(false)
          return
        }
        if (cleanCard.length < 13 || cleanCard.length > 19) {
          alert('Número do cartão inválido.')
          setLoading(false)
          return
        }
        if (!/^\d{2}\/\d{2,4}$/.test(cardExpiry.trim())) {
          alert('Validade deve estar no formato MM/AA.')
          setLoading(false)
          return
        }
        if (cardCvv.length < 3 || cardCvv.length > 4) {
          alert('CVV inválido.')
          setLoading(false)
          return
        }
        if (cleanCpf.length !== 11 && cleanCpf.length !== 14) {
          alert('CPF/CNPJ inválido.')
          setLoading(false)
          return
        }
        if (cleanCep.length !== 8) {
          alert('CEP inválido.')
          setLoading(false)
          return
        }
        const [expiryMonth, expiryYear] = cardExpiry.split('/')
        body.credit_card = {
          holderName: cardName,
          number: cardNumber.replace(/\s/g, ''),
          expiryMonth: expiryMonth.trim(),
          expiryYear: expiryYear?.trim().length === 2 ? `20${expiryYear.trim()}` : expiryYear?.trim(),
          ccv: cardCvv,
        }
        body.credit_card_holder_info = {
          name: cardName,
          email: user.email,
          cpfCnpj: cardCpf.replace(/\D/g, ''),
          postalCode: cardCep.replace(/\D/g, ''),
          phone: cardPhone.replace(/\D/g, ''),
        }
      }

      const { data, error } = await supabase.functions.invoke('asaas-create-subscription', { body })
      if (error) {
        // Tentar extrair mensagem de erro do body da resposta
        const errMsg = typeof data === 'object' && data?.error ? data.error : error.message || String(error)
        throw new Error(errMsg)
      }
      if (data?.error) throw new Error(data.error)

      await trackEvent('checkout_iniciado', { ciclo, metodo: billingType, cupom: cupom || null })

      if (billingType === 'CREDIT_CARD') {
        // Cartão cobra automaticamente, redirecionar direto
        window.location.href = '/app?payment=success'
      } else if (data?.payment_url) {
        // PIX ou Boleto: redirecionar para página de pagamento Asaas
        window.location.href = data.payment_url
      } else {
        // Fallback
        alert('Assinatura criada! Verifique seu e-mail para instruções de pagamento.')
        window.location.href = '/app?payment=pending'
      }
    } catch (err) {
      console.error('Erro no checkout:', err)
      alert(`Erro ao processar: ${(err as Error).message || 'Tente novamente.'}`)
    } finally {
      setLoading(false)
    }
  }

  const trialDias = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
          <LumaSpin />
          <p className="mt-6 text-sm font-semibold text-[var(--color-navy)]">
            {billingType === 'CREDIT_CARD' ? 'Processando pagamento...' : 'Gerando sua cobrança...'}
          </p>
          <p className="mt-1 text-xs text-gray-400">Você será redirecionado em instantes</p>
        </div>
      )}
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Assine o SimulaCotas Pro</h1>
        {trialDias > 0 ? (
          <p className="text-amber-600 font-medium">
            Seu trial expira em {trialDias} dia{trialDias > 1 ? 's' : ''}. Assine para não perder acesso.
          </p>
        ) : profile?.status === 'trial' ? (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              Seu trial expirou. Assine agora para continuar gerando propostas profissionais.
            </p>
            {(profile.simulacoes_count > 0 || profile.propostas_count > 0) && (
              <p className="mt-1 text-xs text-red-500">
                Você já fez {profile.simulacoes_count} simulações e {profile.propostas_count} propostas — não perca esse progresso!
              </p>
            )}
          </div>
        ) : (
          <p className="text-[var(--color-muted)]">Tudo ilimitado. Sem surpresas. Cancele quando quiser.</p>
        )}
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
              <p className="mt-0.5 text-[10px] text-gray-400">{p.detalhe}</p>
              {ciclo === p.ciclo && (
                <div className="mt-2 flex justify-center">
                  <Check size={20} className="text-[var(--color-lime-dark)]" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Método de pagamento */}
      <div>
        <p className="mb-2 text-sm font-bold text-[var(--color-navy)]">Forma de pagamento</p>
        <div className="grid grid-cols-3 gap-3">
          {metodos.map((m) => (
            <button
              key={m.type}
              onClick={() => setBillingType(m.type)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                billingType === m.type
                  ? 'border-[var(--color-lime)] bg-[#F5FFCC] shadow-md'
                  : 'border-gray-200 hover:border-[var(--color-lime-dark)]'
              }`}
            >
              <m.icon size={22} className={billingType === m.type ? 'text-[var(--color-navy)]' : 'text-gray-400'} />
              <span className={`text-sm font-bold ${billingType === m.type ? 'text-[var(--color-navy)]' : 'text-gray-500'}`}>{m.label}</span>
              <span className="text-[10px] text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de cartão */}
      {billingType === 'CREDIT_CARD' && (
        <Card className="shadow-xl rounded-2xl">
          <CardContent className="space-y-5 p-6">
            {/* Dados do cartão */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-[var(--color-muted)]" />
                <span className="text-sm font-medium">Dados do Cartão</span>
              </div>
              <div className="space-y-3">
                <Input placeholder="Nome impresso no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <Input placeholder="Número do cartão" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} inputMode="numeric" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  <Input placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} inputMode="numeric" maxLength={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dados do titular */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-[var(--color-muted)]" />
                <span className="text-sm font-medium">Titular do Cartão</span>
              </div>
              <div className="space-y-3">
                <Input placeholder="CPF ou CNPJ" value={cardCpf} onChange={(e) => setCardCpf(e.target.value)} inputMode="numeric" />
                <Input placeholder="Telefone com DDD" value={cardPhone} onChange={(e) => setCardPhone(e.target.value)} inputMode="numeric" />
              </div>
            </div>

            <Separator />

            {/* Endereço de cobrança */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[var(--color-muted)]" />
                <span className="text-sm font-medium">Endereço de Cobrança</span>
              </div>
              <Input placeholder="CEP" value={cardCep} onChange={(e) => setCardCep(e.target.value)} inputMode="numeric" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empresa */}
      {profile?.empresa_id && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Building2 size={20} className="text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-800">
              Desconto de empresa aplicado automaticamente (10% por consultor)
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
        {loading
          ? billingType === 'CREDIT_CARD' ? 'Processando...' : 'Gerando cobrança...'
          : 'Assinar agora'
        }
      </Button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        Pagamento seguro via Asaas. Cancele quando quiser.
      </p>
    </div>
    </>
  )
}
