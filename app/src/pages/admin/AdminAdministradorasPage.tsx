import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
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
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Administradoras</h1>
        <Button onClick={openNew} className="gap-2 bg-[var(--color-navy)]"><Plus size={16} /> Nova</Button>
      </div>

      <div className="space-y-2">
        {admins.map((a) => (
          <Card key={a.id} className={`flex items-center gap-4 p-4 ${!a.is_active ? 'opacity-50' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-navy)] text-sm font-bold text-[var(--color-lime)]">
              {a.nome.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-navy)]">{a.nome}</p>
              <p className="text-xs text-[var(--color-muted)]">
                Adm {a.taxa_adm_padrao}% · FR {a.fundo_reserva_padrao}% · Emb {a.lance_embutido_padrao}%
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {a.planos_disponiveis.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">{planoLabel[p] ?? p}</Badge>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleAtivo(a)}>
                <Database size={14} className={a.is_active ? 'text-green-600' : 'text-red-500'} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Administradora</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Taxa Adm %</Label><Input type="number" value={taxaAdm} onChange={(e) => setTaxaAdm(e.target.value)} step="0.1" /></div>
              <div><Label>FR %</Label><Input type="number" value={fr} onChange={(e) => setFr(e.target.value)} step="0.1" /></div>
              <div><Label>Embutido %</Label><Input type="number" value={embutido} onChange={(e) => setEmbutido(e.target.value)} step="0.1" /></div>
            </div>
            <Button onClick={handleSalvar} className="w-full bg-[var(--color-navy)]">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
