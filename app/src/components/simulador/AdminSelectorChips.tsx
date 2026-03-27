import type { Administradora } from '@/hooks/useSimulador'
import { cn } from '@/lib/utils'

interface Props {
  administradoras: Administradora[]
  selectedId: string | null
  onSelect: (admin: Administradora) => void
}

export default function AdminSelectorChips({ administradoras, selectedId, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {administradoras.map((admin) => (
        <button
          key={admin.id}
          onClick={() => onSelect(admin)}
          className={cn(
            'flex shrink-0 items-center gap-2.5 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all',
            selectedId === admin.id
              ? 'border-[var(--color-navy)] bg-white text-[var(--color-navy)] shadow-sm'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
          )}
        >
          {admin.logo_url ? (
            <img src={admin.logo_url} alt={admin.nome} className="h-5 w-5 rounded-full object-contain" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
              {admin.nome.charAt(0)}
            </span>
          )}
          {admin.nome}
        </button>
      ))}
    </div>
  )
}
