import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'
import { formatBRL, formatPct } from '@/hooks/useSimulador'

interface CampoEditavelProps {
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  max?: number
  hint?: string
}

export function CampoEditavel({ label, value, onChange, prefix, suffix, step = 1, min, max, hint }: CampoEditavelProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500">
        {label}
        {hint && <span className="ml-1 text-gray-400">{hint}</span>}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className={`h-10 border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:border-[var(--color-navy)] focus:ring-[var(--color-navy)]/20 ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

interface CampoCalculadoProps {
  label: string
  value: number
  formato?: 'moeda' | 'percentual'
  destaque?: boolean
}

export function CampoCalculado({ label, value, formato = 'moeda', destaque = false }: CampoCalculadoProps) {
  const formatted = formato === 'moeda' ? formatBRL(value) : formatPct(value)

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-xs font-medium text-gray-500">
        <Lock size={11} className="text-gray-400" />
        {label}
      </Label>
      <div
        className={`flex h-10 items-center rounded-md px-3 text-sm font-semibold ${
          destaque
            ? 'border border-[var(--color-navy)] bg-[var(--color-navy)] text-white'
            : 'border border-gray-200 bg-white text-gray-900'
        }`}
      >
        {formatted}
      </div>
    </div>
  )
}

interface CampoTextoProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function CampoTexto({ label, value, onChange, placeholder }: CampoTextoProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 border border-gray-200 bg-gray-50 font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:border-[var(--color-navy)]"
      />
    </div>
  )
}
