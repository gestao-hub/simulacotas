import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const admins = ['Itaú', 'Banco do Brasil', 'Santander', 'Magalu', 'Reconomia', 'Breitkopf', 'Âncora']

export default function LogoCloudSection() {
  return (
    <section className="bg-white pb-16 md:pb-24">
      <div className="group relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm text-gray-500 font-medium">Administradoras suportadas</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider duration={30} durationOnHover={60} gap={48}>
              {admins.map((name) => (
                <div key={name} className="flex items-center gap-2 px-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0D1B4B] text-xs font-bold text-[#CCEE00]">
                    {name.charAt(0)}
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-600">{name}</span>
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
