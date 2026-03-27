import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, User, Palette, LogOut } from 'lucide-react'
import UploadLogo from '@/components/UploadLogo'

export default function ConfigPage() {
  const { profile, user, refreshProfile, signOut } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [instagram, setInstagram] = useState(profile?.instagram ?? '')
  const [corPrimaria, setCorPrimaria] = useState(profile?.cor_primaria ?? '#0D1B4B')
  const [corSecundaria, setCorSecundaria] = useState(profile?.cor_secundaria ?? '#CCEE00')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSalvar = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() || null,
        cor_primaria: corPrimaria,
        cor_secundaria: corSecundaria,
      })
      .eq('id', user.id)

    if (error) {
      setMsg('Erro ao salvar: ' + error.message)
    } else {
      setMsg('Salvo com sucesso!')
      await refreshProfile()
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <p className="mt-1 text-sm text-gray-400">Gerencie seu perfil e branding</p>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-sm ring-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-gray-50 p-2.5">
              <User size={18} className="text-gray-900" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Perfil</CardTitle>
              <CardDescription className="text-sm text-gray-400">Dados que aparecem nas suas propostas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-900">Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 rounded-xl border-gray-200 bg-gray-50 px-3.5 text-gray-900 placeholder:text-gray-400 focus-visible:border-[var(--color-navy)] focus-visible:ring-[var(--color-navy)]/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-900">WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" className="h-10 rounded-xl border-gray-200 bg-gray-50 px-3.5 text-gray-900 placeholder:text-gray-400 focus-visible:border-[var(--color-navy)] focus-visible:ring-[var(--color-navy)]/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-900">Instagram</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuperfil" className="h-10 rounded-xl border-gray-200 bg-gray-50 px-3.5 text-gray-900 placeholder:text-gray-400 focus-visible:border-[var(--color-navy)] focus-visible:ring-[var(--color-navy)]/10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-400">Email</Label>
            <Input value={profile?.email ?? ''} disabled className="h-10 rounded-xl border-gray-200 bg-gray-100 px-3.5 text-gray-400 opacity-60" />
          </div>
          <UploadLogo />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 bg-white shadow-sm ring-0">
        <CardHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-gray-50 p-2.5">
              <Palette size={18} className="text-gray-900" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Branding</CardTitle>
              <CardDescription className="text-sm text-gray-400">Cores das suas propostas em PDF</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-900">Cor primaria</Label>
              <div className="flex items-center gap-2.5">
                <input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-0.5" />
                <Input value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="h-10 flex-1 rounded-xl border-gray-200 bg-gray-50 px-3.5 font-mono text-sm text-gray-900 focus-visible:border-[var(--color-navy)] focus-visible:ring-[var(--color-navy)]/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-900">Cor secundaria</Label>
              <div className="flex items-center gap-2.5">
                <input type="color" value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-0.5" />
                <Input value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} className="h-10 flex-1 rounded-xl border-gray-200 bg-gray-50 px-3.5 font-mono text-sm text-gray-900 focus-visible:border-[var(--color-navy)] focus-visible:ring-[var(--color-navy)]/10" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: corPrimaria }}>
            <span className="text-sm font-semibold" style={{ color: corSecundaria }}>Preview do card de resultado</span>
          </div>
        </CardContent>
      </Card>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${msg.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSalvar} disabled={saving} className="h-11 flex-1 gap-2 rounded-xl bg-[var(--color-navy)] text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-navy-light)]">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
        <Button variant="outline" onClick={signOut} className="h-11 gap-2 rounded-xl border-gray-200 bg-white text-sm font-medium text-gray-400 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-500">
          <LogOut size={16} /> Sair
        </Button>
      </div>
    </div>
  )
}
