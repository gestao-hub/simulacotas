import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Phone, Mail, Users } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  notas: string | null
  created_at: string
}

export default function ClientesPage() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [notas, setNotas] = useState('')

  const fetchClientes = async () => {
    if (!user) return
    const { data } = await supabase
      .from('clientes_corretor')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchClientes() }, [user])

  const handleSalvar = async () => {
    if (!user || !nome.trim()) return
    await supabase.from('clientes_corretor').insert({
      user_id: user.id,
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      notas: notas.trim() || null,
    })
    setNome(''); setTelefone(''); setEmail(''); setNotas('')
    setDialogOpen(false)
    fetchClientes()
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este cliente?')) return
    await supabase.from('clientes_corretor').delete().eq('id', id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-navy)]">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2 bg-[var(--color-navy)]"><Plus size={16} /> Novo cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" /></div>
              <div><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" /></div>
              <div><Label>Notas</Label><Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observações..." /></div>
              <Button onClick={handleSalvar} className="w-full bg-[var(--color-navy)]">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-[var(--color-muted)]">Carregando...</p>
      ) : clientes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Users size={40} className="text-[var(--color-muted)]" />
          <p className="text-[var(--color-muted)]">Nenhum cliente cadastrado.</p>
        </Card>
      ) : (
        clientes.map((c) => (
          <Card key={c.id} className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime-faint)] text-sm font-bold text-[var(--color-navy)]">
              {c.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[var(--color-navy)]">{c.nome}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                {c.telefone && <span className="flex items-center gap-1"><Phone size={10} /> {c.telefone}</span>}
                {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
              </div>
              {c.notas && <p className="mt-0.5 truncate text-xs text-[var(--color-muted)] italic">{c.notas}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-red-500" onClick={() => handleExcluir(c.id)}>
              <Trash2 size={14} />
            </Button>
          </Card>
        ))
      )}
    </div>
  )
}
