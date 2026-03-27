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
    <div className="min-h-screen bg-[#F5F5F7] space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2 rounded-xl bg-[var(--color-navy)] transition-all duration-200 hover:opacity-90"><Plus size={16} /> Novo cliente</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="text-lg font-semibold text-gray-900">Novo Cliente</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label className="text-sm font-medium text-gray-700">Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className="rounded-xl border-gray-200 bg-gray-50 transition-colors duration-150 focus:bg-white" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium text-gray-700">Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="rounded-xl border-gray-200 bg-gray-50 transition-colors duration-150 focus:bg-white" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium text-gray-700">Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" className="rounded-xl border-gray-200 bg-gray-50 transition-colors duration-150 focus:bg-white" /></div>
              <div className="space-y-1.5"><Label className="text-sm font-medium text-gray-700">Notas</Label><Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observações..." className="rounded-xl border-gray-200 bg-gray-50 transition-colors duration-150 focus:bg-white" /></div>
              <Button onClick={handleSalvar} className="w-full rounded-xl bg-[var(--color-navy)] transition-all duration-200 hover:opacity-90">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : clientes.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50">
            <Users size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-400">Nenhum cliente cadastrado.</p>
        </Card>
      ) : (
        clientes.map((c) => (
          <Card key={c.id} className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-500">
              {c.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{c.nome}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {c.telefone && <span className="flex items-center gap-1"><Phone size={10} className="text-gray-300" /> {c.telefone}</span>}
                {c.email && <span className="flex items-center gap-1"><Mail size={10} className="text-gray-300" /> {c.email}</span>}
              </div>
              {c.notas && <p className="mt-0.5 truncate text-xs text-gray-400 italic">{c.notas}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-red-400 opacity-0 transition-all duration-200 hover:text-red-600 group-hover:opacity-100" onClick={() => handleExcluir(c.id)}>
              <Trash2 size={14} />
            </Button>
          </Card>
        ))
      )}
    </div>
  )
}
