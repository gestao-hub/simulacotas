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
            'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
            selectedId === admin.id
              ? 'border-[var(--color-lime)] bg-[var(--color-navy)] text-[var(--color-lime)]'
              : 'border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-lime-dark)] hover:bg-[var(--color-lime-faint)]'
          )}
        >
          {admin.logo_url ? (
            <img src={admin.logo_url} alt={admin.nome} className="h-5 w-5 rounded-full object-contain" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-navy-light)] text-[10px] font-bold text-white">
              {admin.nome.charAt(0)}
            </span>
          )}
          {admin.nome}
        </button>
      ))}
    </div>
  )
}
