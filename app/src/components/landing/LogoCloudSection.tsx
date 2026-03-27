import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

interface Admin {
  id: string
  nome: string
  logo_url: string | null
}

export default function LogoCloudSection() {
  const [admins, setAdmins] = useState<Admin[]>([])

  useEffect(() => {
    supabase
      .from('administradoras')
      .select('id, nome, logo_url')
      .eq('is_active', true)
      .order('ordem')
      .then(({ data }) => setAdmins((data ?? []).filter((a) => a.logo_url)))
  }, [])

  if (admins.length === 0) return null

  return (
    <section className="pb-16 md:pb-24">
      <div className="group relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm text-gray-500 font-medium">Administradoras suportadas</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider duration={30} durationOnHover={60} gap={56}>
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center gap-3 px-2">
                  <img src={admin.logo_url!} alt={admin.nome} className="h-8 w-auto object-contain" />
                </div>
              ))}
            </InfiniteSlider>
            <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1} />
            <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-20" direction="right" blurIntensity={1} />
          </div>
        </div>
      </div>
    </section>
  )
}
