import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Megaphone, Tag, Users, Plus, Play, Pause, Pencil, Trash2, Zap, Mail, MessageSquare } from 'lucide-react'

interface Campanha {
  id: string
  nome: string
  status: string
  canal: string
  tipo_trigger: string | null
  template_whatsapp: string | null
  template_email_id: string | null
  segmento_id: string | null
  cupom_id: string | null
  enviados_count: number
  created_at: string
}

interface Cupom { id: string; codigo: string; desconto_percentual: string; max_usos: number; usos_atuais: number; is_active: boolean; valido_ate: string | null }
interface Segmento { id: string; nome: string; descricao: string | null; is_active: boolean }
interface TemplateEmail { id: string; nome: string; assunto: string }

const statusColor: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  ativa: 'bg-green-100 text-green-800',
  pausada: 'bg-amber-100 text-amber-800',
  concluida: 'bg-blue-100 text-blue-800',
}

const triggerLabels: Record<string, string> = {
  manual: 'Manual',
  boas_vindas: 'Boas-vindas (ao criar conta)',
  trial_expirando: 'Trial expirando (último dia)',
  trial_expirou: 'Trial expirou',
  inadimplente_3d: 'Inadimplente (3 dias)',
  inativo_7d: 'Inativo (7 dias) — check-in',
  inativo_30d: 'Inativo (30 dias)',
}

const canalIcon: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageSquare,
  ambos: Zap,
}

export default function AdminCampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [templates, setTemplates] = useState<TemplateEmail[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Campanha | null>(null)

  // Form state
  const [nome, setNome] = useState('')
  const [trigger, setTrigger] = useState('manual')
  const [canal, setCanal] = useState('email')
  const [templateEmailId, setTemplateEmailId] = useState<string>('')
  const [templateWhatsapp, setTemplateWhatsapp] = useState('')
  const [segmentoId, setSegmentoId] = useState<string>('')
  const [cupomId, setCupomId] = useState<string>('')

  const fetchAll = () => {
    supabase.from('campanhas').select('*').order('created_at', { ascending: false }).then(({ data }) => setCampanhas(data ?? []))
    supabase.from('cupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCupons(data ?? []))
    supabase.from('segmentos_usuarios').select('*').order('created_at', { ascending: false }).then(({ data }) => setSegmentos(data ?? []))
    supabase.from('templates_email').select('id, nome, assunto').eq('is_active', true).then(({ data }) => setTemplates(data ?? []))
  }

  useEffect(() => { fetchAll() }, [])

  const openNew = () => {
    setEditing(null)
    setNome(''); setTrigger('manual'); setCanal('email')
    setTemplateEmailId(''); setTemplateWhatsapp(''); setSegmentoId(''); setCupomId('')
    setDialogOpen(true)
  }

  const openEdit = (c: Campanha) => {
    setEditing(c)
    setNome(c.nome)
    setTrigger(c.tipo_trigger ?? 'manual')
    setCanal(c.canal)
    setTemplateEmailId(c.template_email_id ?? '')
    setTemplateWhatsapp(c.template_whatsapp ?? '')
    setSegmentoId(c.segmento_id ?? '')
    setCupomId(c.cupom_id ?? '')
    setDialogOpen(true)
  }

  const handleSalvar = async () => {
    const payload = {
      nome,
      tipo_trigger: trigger,
      canal,
      template_email_id: templateEmailId || null,
      template_whatsapp: templateWhatsapp || null,
      segmento_id: segmentoId || null,
      cupom_id: cupomId || null,
    }
    if (editing) {
      await supabase.from('campanhas').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('campanhas').insert({ ...payload, status: 'rascunho' })
    }
    setDialogOpen(false)
    fetchAll()
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('campanhas').update({ status }).eq('id', id)
    fetchAll()
  }

  const deleteCampanha = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return
    await supabase.from('campanhas').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
        <Button onClick={openNew} className="gap-2 rounded-xl bg-gray-900"><Plus size={16} /> Nova Campanha</Button>
      </div>

      <Tabs defaultValue="campanhas">
        <TabsList>
          <TabsTrigger value="campanhas"><Megaphone size={14} className="mr-1" /> Campanhas</TabsTrigger>
          <TabsTrigger value="cupons"><Tag size={14} className="mr-1" /> Cupons</TabsTrigger>
          <TabsTrigger value="segmentos"><Users size={14} className="mr-1" /> Segmentos</TabsTrigger>
        </TabsList>

        {/* Campanhas */}
        <TabsContent value="campanhas" className="mt-4 space-y-3">
          {campanhas.map((c) => {
            const CanalIcon = canalIcon[c.canal] ?? Zap
            return (
              <div key={c.id} className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                    <CanalIcon size={18} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{c.nome}</p>
                      <Badge className={statusColor[c.status] ?? 'bg-gray-100'}>{c.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {triggerLabels[c.tipo_trigger ?? ''] ?? c.tipo_trigger ?? 'manual'} · {c.canal} · {c.enviados_count} envios
                    </p>
                    {c.template_whatsapp && (
                      <p className="mt-1 text-xs text-gray-400 italic line-clamp-1">WA: {c.template_whatsapp}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {c.status === 'rascunho' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => updateStatus(c.id, 'ativa')} title="Ativar">
                        <Play size={14} />
                      </Button>
                    )}
                    {c.status === 'ativa' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={() => updateStatus(c.id, 'pausada')} title="Pausar">
                        <Pause size={14} />
                      </Button>
                    )}
                    {c.status === 'pausada' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => updateStatus(c.id, 'ativa')} title="Reativar">
                        <Play size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => openEdit(c)} title="Editar">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => deleteCampanha(c.id)} title="Excluir">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          {campanhas.length === 0 && <p className="py-8 text-center text-gray-400">Nenhuma campanha criada.</p>}
        </TabsContent>

        {/* Cupons */}
        <TabsContent value="cupons" className="mt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cupons.map((c) => (
              <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <Tag size={16} className={c.is_active ? 'text-green-500' : 'text-gray-300'} />
                  <Badge className={c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {c.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-lg font-bold font-mono text-gray-900">{c.codigo}</p>
                <p className="mt-1 text-sm text-gray-500">{c.desconto_percentual}% off</p>
                <p className="text-xs text-gray-400">
                  {c.usos_atuais}/{c.max_usos} usos
                  {c.valido_ate && ` · até ${new Date(c.valido_ate).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Segmentos */}
        <TabsContent value="segmentos" className="mt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {segmentos.map((s) => (
              <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <Users size={16} className="text-indigo-500" />
                  <Badge className={s.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}>
                    {s.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-gray-900">{s.nome}</p>
                {s.descricao && <p className="mt-1 text-xs text-gray-400">{s.descricao}</p>}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nova/Editar Campanha */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editing ? 'Editar' : 'Nova'} Campanha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">Nome da campanha</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Boas-vindas novos consultores" className="rounded-xl bg-gray-50 border-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700">Trigger</Label>
                <Select value={trigger} onValueChange={(v) => setTrigger(v ?? 'manual')}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(triggerLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Canal</Label>
                <Select value={canal} onValueChange={(v) => setCanal(v ?? 'email')}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(canal === 'email' || canal === 'ambos') && (
              <div>
                <Label className="text-gray-700">Template de email</Label>
                <Select value={templateEmailId} onValueChange={(v) => setTemplateEmailId(v ?? '')}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome} — {t.assunto}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(canal === 'whatsapp' || canal === 'ambos') && (
              <div>
                <Label className="text-gray-700">Template WhatsApp</Label>
                <textarea
                  value={templateWhatsapp}
                  onChange={(e) => setTemplateWhatsapp(e.target.value)}
                  placeholder="Olá {{nome}}! Seu trial do SimulaCotas..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/10"
                />
                <p className="mt-1 text-[11px] text-gray-400">Variáveis: {'{{nome}}'}, {'{{email}}'}, {'{{link_checkout}}'}, {'{{cupom}}'}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700">Segmento (opcional)</Label>
                <Select value={segmentoId} onValueChange={(v) => setSegmentoId(v ?? '')}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    {segmentos.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Cupom (opcional)</Label>
                <Select value={cupomId} onValueChange={(v) => setCupomId(v ?? '')}>
                  <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    {cupons.filter((c) => c.is_active).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.codigo} ({c.desconto_percentual}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSalvar} className="w-full rounded-xl bg-gray-900" disabled={!nome.trim()}>
              {editing ? 'Salvar alterações' : 'Criar campanha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
