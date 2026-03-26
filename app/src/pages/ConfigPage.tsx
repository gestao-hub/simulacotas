import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, User, Palette } from 'lucide-react'
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
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-navy)]">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User size={18} /> Perfil</CardTitle>
          <CardDescription>Dados que aparecem nas suas propostas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nome completo</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div><Label>WhatsApp</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" /></div>
          <div><Label>Instagram</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuperfil" /></div>
          <div><Label>Email</Label><Input value={profile?.email ?? ''} disabled className="opacity-60" /></div>
          <UploadLogo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette size={18} /> Branding</CardTitle>
          <CardDescription>Cores das suas propostas em PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cor primária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
                <Input value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
            <div>
              <Label>Cor secundária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
                <Input value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: corPrimaria }}>
            <span className="text-sm font-bold" style={{ color: corSecundaria }}>Preview do card de resultado</span>
          </div>
        </CardContent>
      </Card>

      {msg && <p className={`text-center text-sm font-semibold ${msg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSalvar} disabled={saving} className="flex-1 gap-2 bg-[var(--color-navy)]">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button variant="outline" onClick={signOut} className="text-red-500 hover:text-red-700">
          Sair
        </Button>
      </div>
    </div>
  )
}
