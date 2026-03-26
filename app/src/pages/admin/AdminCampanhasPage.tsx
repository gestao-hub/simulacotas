import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Megaphone, Tag, Users, Plus } from 'lucide-react'

interface Campanha {
  id: string
  nome: string
  status: string
  canal: string
  tipo_trigger: string | null
  enviados_count: number
  created_at: string
}

interface Cupom {
  id: string
  codigo: string
  desconto_percentual: string
  max_usos: number
  usos_atuais: number
  is_active: boolean
  valido_ate: string | null
}

interface Segmento {
  id: string
  nome: string
  descricao: string | null
  is_active: boolean
}

const statusColor: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  ativa: 'bg-green-100 text-green-800',
  pausada: 'bg-amber-100 text-amber-800',
  concluida: 'bg-blue-100 text-blue-800',
}

export default function AdminCampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])

  useEffect(() => {
    supabase.from('campanhas').select('*').order('created_at', { ascending: false }).then(({ data }) => setCampanhas(data ?? []))
    supabase.from('cupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCupons(data ?? []))
    supabase.from('segmentos_usuarios').select('*').order('created_at', { ascending: false }).then(({ data }) => setSegmentos(data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Campanhas</h1>
        <Button className="gap-2 bg-[var(--color-navy)]"><Plus size={16} /> Nova Campanha</Button>
      </div>

      <Tabs defaultValue="campanhas">
        <TabsList>
          <TabsTrigger value="campanhas"><Megaphone size={14} className="mr-1" /> Campanhas</TabsTrigger>
          <TabsTrigger value="cupons"><Tag size={14} className="mr-1" /> Cupons</TabsTrigger>
          <TabsTrigger value="segmentos"><Users size={14} className="mr-1" /> Segmentos</TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas" className="mt-4 space-y-2">
          {campanhas.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <Megaphone size={18} className="shrink-0 text-[var(--color-navy)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{c.nome}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {c.tipo_trigger ?? 'manual'} · {c.canal} · {c.enviados_count} envios
                </p>
              </div>
              <Badge className={statusColor[c.status] ?? 'bg-gray-100'}>{c.status}</Badge>
            </Card>
          ))}
          {campanhas.length === 0 && <p className="py-8 text-center text-[var(--color-muted)]">Nenhuma campanha criada.</p>}
        </TabsContent>

        <TabsContent value="cupons" className="mt-4 space-y-2">
          {cupons.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <Tag size={18} className={c.is_active ? 'text-green-600' : 'text-gray-400'} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold font-mono">{c.codigo}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {c.desconto_percentual}% off · {c.usos_atuais}/{c.max_usos} usos
                  {c.valido_ate && ` · até ${new Date(c.valido_ate).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <Badge className={c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                {c.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="segmentos" className="mt-4 space-y-2">
          {segmentos.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-4">
              <Users size={18} className="shrink-0 text-indigo-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{s.nome}</p>
                {s.descricao && <p className="text-xs text-[var(--color-muted)]">{s.descricao}</p>}
              </div>
              <Badge className={s.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100'}>
                {s.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
