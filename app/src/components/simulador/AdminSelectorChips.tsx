import type { Administradora } from '@/hooks/useSimulador'
import { cn } from '@/lib/utils'

interface Props {
  administradoras: Administradora[]
  selectedId: string | null
  onSelect: (admin: Administradora) => void
}

export default function AdminSelectorChips({ administradoras, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {administradoras.map((admin) => (
        <button
          key={admin.id}
          onClick={() => onSelect(admin)}
          title={admin.nome}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-2xl border-2 px-4 py-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-md',
            selectedId === admin.id
              ? 'border-[var(--color-navy)] bg-white shadow-md'
              : 'border-transparent bg-white shadow-sm hover:border-gray-200'
          )}
        >
          {admin.logo_url ? (
            <img src={admin.logo_url} alt={admin.nome} className="h-7 w-auto max-w-[100px] object-contain" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
              {admin.nome.charAt(0)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
