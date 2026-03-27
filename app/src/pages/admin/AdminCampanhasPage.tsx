import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
        <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
        <Button className="gap-2 rounded-xl bg-gray-900"><Plus size={16} /> Nova Campanha</Button>
      </div>

      <Tabs defaultValue="campanhas">
        <TabsList>
          <TabsTrigger value="campanhas"><Megaphone size={14} className="mr-1" /> Campanhas</TabsTrigger>
          <TabsTrigger value="cupons"><Tag size={14} className="mr-1" /> Cupons</TabsTrigger>
          <TabsTrigger value="segmentos"><Users size={14} className="mr-1" /> Segmentos</TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas" className="mt-4 space-y-2">
          {campanhas.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Megaphone size={16} className="text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{c.nome}</p>
                <p className="text-xs text-gray-400">
                  {c.tipo_trigger ?? 'manual'} · {c.canal} · {c.enviados_count} envios
                </p>
              </div>
              <Badge className={statusColor[c.status] ?? 'bg-gray-100'}>{c.status}</Badge>
            </div>
          ))}
          {campanhas.length === 0 && <p className="py-8 text-center text-gray-400">Nenhuma campanha criada.</p>}
        </TabsContent>

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
    </div>
  )
}
