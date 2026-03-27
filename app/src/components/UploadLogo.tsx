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
    <div className="space-y-2 pt-1">
      <p className="text-sm font-medium text-gray-900">Logo</p>
      {profile?.logo_corretor_url ? (
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <img
            src={profile.logo_corretor_url}
            alt="Logo"
            className="h-14 w-14 rounded-xl border border-gray-200 bg-white object-contain p-1"
          />
          <Button variant="ghost" size="sm" onClick={handleRemove} className="rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500">
            <X size={14} className="mr-1.5" /> Remover
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <div className="flex items-center justify-center rounded-xl bg-white p-2.5 shadow-sm">
            <Upload size={18} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Enviando...' : 'Enviar logo'}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">PNG ou JPG, max 2MB</p>
          </div>
        </div>
      )}
    </div>
  )
}
