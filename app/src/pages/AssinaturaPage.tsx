import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CreditCard, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Assinatura {
  id: string
  status: string
  valor_mensal: number
  ciclo: string
  data_proximo_pagamento: string | null
  tentativas_falha: number
  created_at: string
  asaas_subscription_id: string | null
}

interface Pagamento {
  id: string
  valor: number
  status: string
  metodo: string | null
  data_pagamento: string | null
  data_vencimento: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-800', icon: Clock },
  inadimplente: { label: 'Inadimplente', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  suspenso: { label: 'Suspenso', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
}

const cicloLabel: Record<string, string> = {
  mensal: 'Mensal',
  anual: 'Anual (12 parcelas)',
  anual_vista: 'Anual à Vista',
}

const metodoLabel: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão',
  boleto: 'Boleto',
}

const pagamentoStatusColor: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
  in_process: 'bg-blue-100 text-blue-800',
}

export default function AssinaturaPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    if (!user) return

    supabase
      .from('assinaturas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setAssinatura(data as Assinatura | null)
      })

    supabase
      .from('pagamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setPagamentos((data as Pagamento[]) ?? [])
        setLoading(false)
      })
  }, [user])

  const handleCancelar = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso às funcionalidades Pro.')) return
    setCancelando(true)

    try {
      // Buscar Asaas key para cancelar via API
      // Atualizar local
      if (assinatura) {
        await supabase
          .from('assinaturas')
          .update({ status: 'cancelado', data_cancelamento: new Date().toISOString() })
          .eq('id', assinatura.id)

        await supabase
          .from('profiles')
          .update({ status: 'cancelado' })
          .eq('id', user!.id)

        setAssinatura({ ...assinatura, status: 'cancelado' })
      }

      alert('Assinatura cancelada. Seus dados ficam preservados por 90 dias.')
    } catch (err) {
      alert('Erro ao cancelar. Entre em contato com o suporte.')
    } finally {
      setCancelando(false)
    }
  }

  const status = statusConfig[profile?.status ?? 'trial'] ?? statusConfig.trial
  const StatusIcon = status.icon

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
        <div className="animate-pulse space-y-3">
          <div className="h-32 rounded-xl bg-gray-100" />
          <div className="h-48 rounded-xl bg-gray-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>

      {/* Status Card */}
      <Card className="shadow-xl rounded-2xl overflow-hidden">
        <div className={`px-6 py-4 ${profile?.status === 'ativo' ? 'bg-gradient-to-r from-[#0D1B4B] to-[#152260]' : profile?.status === 'trial' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Plano atual</p>
              <p className="text-xl font-bold text-white">
                {profile?.status === 'ativo' ? 'SimulaCotas Pro' : profile?.status === 'trial' ? 'Trial Gratuito' : 'Sem plano ativo'}
              </p>
            </div>
            <Badge className={`${status.color} text-xs`}>
              <StatusIcon size={12} className="mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6 space-y-4">
          {assinatura ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <DollarSign size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Valor mensal</p>
                    <p className="text-sm font-bold text-gray-900">R$ {Number(assinatura.valor_mensal).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Ciclo</p>
                    <p className="text-sm font-bold text-gray-900">{cicloLabel[assinatura.ciclo] ?? assinatura.ciclo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Próximo pagamento</p>
                    <p className="text-sm font-bold text-gray-900">
                      {assinatura.data_proximo_pagamento
                        ? new Date(assinatura.data_proximo_pagamento).toLocaleDateString('pt-BR')
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Membro desde</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(assinatura.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {assinatura.status === 'ativo' && (
                <>
                  <Separator />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/app/checkout')}>
                      Trocar plano
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleCancelar}
                      disabled={cancelando}
                    >
                      {cancelando ? 'Cancelando...' : 'Cancelar'}
                    </Button>
                  </div>
                </>
              )}

              {(assinatura.status === 'cancelado' || assinatura.status === 'inadimplente') && (
                <>
                  <Separator />
                  <Button className="w-full bg-[var(--color-navy)]" onClick={() => navigate('/app/checkout')}>
                    Reativar assinatura
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">Você ainda não tem uma assinatura.</p>
              <Button className="bg-[var(--color-navy)]" onClick={() => navigate('/app/checkout')}>
                Ver planos e assinar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de pagamentos */}
      {pagamentos.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-gray-900 mb-4">Histórico de pagamentos</p>
            <div className="space-y-3">
              {pagamentos.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {Number(p.valor).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.data_pagamento
                        ? new Date(p.data_pagamento).toLocaleDateString('pt-BR')
                        : p.data_vencimento
                        ? `Vence ${new Date(p.data_vencimento).toLocaleDateString('pt-BR')}`
                        : new Date(p.created_at).toLocaleDateString('pt-BR')}
                      {p.metodo && ` · ${metodoLabel[p.metodo] ?? p.metodo}`}
                    </p>
                  </div>
                  <Badge className={pagamentoStatusColor[p.status] ?? 'bg-gray-100'}>
                    {p.status === 'approved' ? 'Pago' : p.status === 'pending' ? 'Pendente' : p.status === 'refunded' ? 'Estornado' : p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
