import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const admins = [
  { nome: 'Banco do Brasil', logo: '/assets/banco-do-brasil.png', h: 'h-8' },
  { nome: 'Itaú', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banco_Ita%C3%BA_logo.svg/200px-Banco_Ita%C3%BA_logo.svg.png', h: 'h-8' },
  { nome: 'Santander', logo: '/assets/santander.png', h: 'h-8' },
  { nome: 'Breitkopf', logo: '/assets/bkf.png', h: 'h-8' },
  { nome: 'Âncora', logo: '/assets/ancora.webp', h: 'h-10' },
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
                  <img src={admin.logo} alt={admin.nome} className={`${admin.h} w-auto object-contain`} />
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
