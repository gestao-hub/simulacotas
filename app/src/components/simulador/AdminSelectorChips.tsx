import type { Administradora } from '@/hooks/useSimulador'
import { cn } from '@/lib/utils'

interface Props {
  administradoras: Administradora[]
  selectedId: string | null
  onSelect: (admin: Administradora) => void
}

const logoMap: Record<string, string> = {
  'Itaú': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banco_Ita%C3%BA_logo.svg/200px-Banco_Ita%C3%BA_logo.svg.png',
  'Banco do Brasil': '/assets/banco-do-brasil.png',
  'Santander': '/assets/santander.png',
  'Breitkopf': '/assets/bkf.png',
  'Âncora': '/assets/ancora.webp',
}

export default function AdminSelectorChips({ administradoras, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {administradoras.map((admin) => {
        const logo = admin.logo_url || logoMap[admin.nome]
        return (
          <button
            key={admin.id}
            onClick={() => onSelect(admin)}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-2xl border-2 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-md',
              selectedId === admin.id
                ? 'border-[var(--color-navy)] bg-white text-[var(--color-navy)] shadow-md'
                : 'border-transparent bg-white text-gray-500 shadow-sm hover:border-gray-200'
            )}
          >
            {logo ? (
              <img src={logo} alt={admin.nome} className="h-6 w-auto max-w-[80px] object-contain" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                {admin.nome.charAt(0)}
              </span>
            )}
            {admin.nome}
          </button>
        )
      })}
    </div>
  )
}
