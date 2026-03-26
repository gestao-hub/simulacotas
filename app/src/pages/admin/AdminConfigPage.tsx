import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Save, CreditCard, Mail, MessageSquare, BarChart3 } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  category: string
  is_active: boolean
}

const categoryIcon: Record<string, typeof CreditCard> = {
  payment: CreditCard,
  email: Mail,
  whatsapp: MessageSquare,
  analytics: BarChart3,
}

const categoryLabel: Record<string, string> = {
  payment: 'Pagamento',
  email: 'Email',
  whatsapp: 'WhatsApp',
  analytics: 'Analytics',
}

export default function AdminConfigPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('*')
      .order('category')
      .then(({ data }) => {
        setSettings(data ?? [])
        const vals: Record<string, string> = {}
        ;(data ?? []).forEach((s) => { vals[s.id] = s.value })
        setEditValues(vals)
      })
  }, [])

  const handleSave = async (s: Setting) => {
    setSaving(s.id)
    await supabase.from('platform_settings').update({
      value: editValues[s.id] ?? s.value,
    }).eq('id', s.id)
    setSaving(null)
  }

  const handleToggle = async (s: Setting) => {
    await supabase.from('platform_settings').update({ is_active: !s.is_active }).eq('id', s.id)
    setSettings((prev) => prev.map((p) => p.id === s.id ? { ...p, is_active: !p.is_active } : p))
  }

  const categories = [...new Set(settings.map((s) => s.category))]

  const handleAddKey = async (category: string) => {
    const key = prompt('Nome da chave (ex: MP_ACCESS_TOKEN):')
    if (!key) return
    const value = prompt('Valor:')
    if (value === null) return
    await supabase.from('platform_settings').insert({ key, value, category, is_active: true })
    const { data } = await supabase.from('platform_settings').select('*').order('category')
    setSettings(data ?? [])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-navy)]">API Keys & Configurações</h1>

      {categories.map((cat) => {
        const Icon = categoryIcon[cat] ?? BarChart3
        const items = settings.filter((s) => s.category === cat)

        return (
          <Card key={cat}>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon size={16} /> {categoryLabel[cat] ?? cat}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleAddKey(cat)}>+ Chave</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="w-40 shrink-0">
                    <p className="text-xs font-bold text-[var(--color-navy)]">{s.key}</p>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type={visible[s.id] ? 'text' : 'password'}
                      value={editValues[s.id] ?? ''}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      className="pr-10 font-mono text-xs"
                    />
                    <button
                      onClick={() => setVisible((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                    >
                      {visible[s.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <Badge
                    className={`cursor-pointer ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => handleToggle(s)}
                  >
                    {s.is_active ? 'ON' : 'OFF'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleSave(s)}
                    disabled={saving === s.id}
                  >
                    <Save size={14} />
                  </Button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-sm text-[var(--color-muted)]">Nenhuma chave configurada.</p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--color-muted)]">Nenhuma configuração cadastrada. Adicione suas API keys.</p>
          <div className="mt-4 flex justify-center gap-2">
            {['payment', 'email', 'whatsapp', 'analytics'].map((cat) => (
              <Button key={cat} variant="outline" size="sm" onClick={() => handleAddKey(cat)}>
                + {categoryLabel[cat]}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
