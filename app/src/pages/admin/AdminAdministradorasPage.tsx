import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Database } from 'lucide-react'

interface Admin {
  id: string
  nome: string
  taxa_adm_padrao: string
  fundo_reserva_padrao: string
  lance_embutido_padrao: string
  categorias: string[]
  planos_disponiveis: string[]
  is_active: boolean
  ordem: number
}

const planoLabel: Record<string, string> = {
  linear: 'Linear',
  reduzida_70_30: '70/30',
  reduzida_50_50: '50/50',
}

export default function AdminAdministradorasPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Admin | null>(null)
  const [nome, setNome] = useState('')
  const [taxaAdm, setTaxaAdm] = useState('20')
  const [fr, setFr] = useState('3')
  const [embutido, setEmbutido] = useState('0.3')

  const fetchAdmins = async () => {
    const { data } = await supabase.from('administradoras').select('*').order('ordem')
    setAdmins(data ?? [])
  }

  useEffect(() => { fetchAdmins() }, [])

  const openNew = () => {
    setEditing(null)
    setNome(''); setTaxaAdm('20'); setFr('3'); setEmbutido('0.3')
    setDialogOpen(true)
  }

  const openEdit = (a: Admin) => {
    setEditing(a)
    setNome(a.nome)
    setTaxaAdm(a.taxa_adm_padrao)
    setFr(a.fundo_reserva_padrao)
    setEmbutido(a.lance_embutido_padrao)
    setDialogOpen(true)
  }

  const handleSalvar = async () => {
    const payload = {
      nome,
      taxa_adm_padrao: Number(taxaAdm),
      fundo_reserva_padrao: Number(fr),
      lance_embutido_padrao: Number(embutido),
    }
    if (editing) {
      await supabase.from('administradoras').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('administradoras').insert({ ...payload, ordem: admins.length + 1 })
    }
    setDialogOpen(false)
    fetchAdmins()
  }

  const toggleAtivo = async (a: Admin) => {
    await supabase.from('administradoras').update({ is_active: !a.is_active }).eq('id', a.id)
    fetchAdmins()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Administradoras</h1>
        <Button onClick={openNew} className="gap-2 rounded-xl bg-gray-900"><Plus size={16} /> Nova</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {admins.map((a) => (
          <div key={a.id} className={`rounded-xl bg-white p-4 shadow-sm ${!a.is_active ? 'opacity-50' : ''}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
                {a.nome.charAt(0)}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-50 hover:text-gray-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => toggleAtivo(a)} className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-50 hover:text-gray-600">
                  <Database size={14} className={a.is_active ? 'text-green-500' : 'text-red-400'} />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900">{a.nome}</p>
            <p className="mt-1 text-xs text-gray-400">
              Adm {a.taxa_adm_padrao}% · FR {a.fundo_reserva_padrao}%
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {a.planos_disponiveis.map((p) => (
                <Badge key={p} variant="outline" className="text-[10px]">{planoLabel[p] ?? p}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-gray-900">{editing ? 'Editar' : 'Nova'} Administradora</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-gray-700">Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-xl bg-gray-50 border-gray-200" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-gray-700">Taxa Adm %</Label><Input type="number" value={taxaAdm} onChange={(e) => setTaxaAdm(e.target.value)} step="0.1" className="rounded-xl bg-gray-50 border-gray-200" /></div>
              <div><Label className="text-gray-700">FR %</Label><Input type="number" value={fr} onChange={(e) => setFr(e.target.value)} step="0.1" className="rounded-xl bg-gray-50 border-gray-200" /></div>
              <div><Label className="text-gray-700">Embutido %</Label><Input type="number" value={embutido} onChange={(e) => setEmbutido(e.target.value)} step="0.1" className="rounded-xl bg-gray-50 border-gray-200" /></div>
            </div>
            <Button onClick={handleSalvar} className="w-full rounded-xl bg-gray-900">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
