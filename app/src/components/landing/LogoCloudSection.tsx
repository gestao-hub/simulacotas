import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const admins = [
  { nome: 'Itaú', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banco_Ita%C3%BA_logo.svg/200px-Banco_Ita%C3%BA_logo.svg.png' },
  { nome: 'Banco do Brasil', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Banco_do_Brasil_logo.svg/200px-Banco_do_Brasil_logo.svg.png' },
  { nome: 'Santander', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png' },
  { nome: 'Magalu', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Magazine_Luiza_logo_%282019%29.svg/200px-Magazine_Luiza_logo_%282019%29.svg.png' },
  { nome: 'Reconomia', initials: 'R' },
  { nome: 'Breitkopf', initials: 'B' },
  { nome: 'Âncora', initials: 'Â' },
]

export default function LogoCloudSection() {
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
                <div key={admin.nome} className="flex items-center gap-3 px-2">
                  {admin.logo ? (
                    <img src={admin.logo} alt={admin.nome} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D1B4B] text-xs font-bold text-[#CCEE00]">
                      {admin.initials}
                    </span>
                  )}
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-600">{admin.nome}</span>
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
