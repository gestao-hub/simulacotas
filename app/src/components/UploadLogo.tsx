import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

export default function UploadLogo() {
  const { user, profile, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `logos/${user.id}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('corretor-assets')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('corretor-assets')
      .getPublicUrl(path)

    // Update profile
    await supabase
      .from('profiles')
      .update({ logo_corretor_url: publicUrl })
      .eq('id', user.id)

    await refreshProfile()
    setUploading(false)
  }

  const handleRemove = async () => {
    if (!user) return
    await supabase
      .from('profiles')
      .update({ logo_corretor_url: null })
      .eq('id', user.id)
    await refreshProfile()
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)]">Logo</p>
      {profile?.logo_corretor_url ? (
        <div className="flex items-center gap-3">
          <img
            src={profile.logo_corretor_url}
            alt="Logo"
            className="h-12 w-12 rounded-lg border object-contain"
          />
          <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500">
            <X size={14} className="mr-1" /> Remover
          </Button>
        </div>
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload size={14} />
            {uploading ? 'Enviando...' : 'Enviar logo'}
          </Button>
          <p className="mt-1 text-xs text-[var(--color-muted)]">PNG ou JPG, máx 2MB</p>
        </div>
      )}
    </div>
  )
}
