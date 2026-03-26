import { type ReactNode, useState, type MouseEvent, type CSSProperties } from 'react'

interface RippleState {
  key: number
  x: number
  y: number
  size: number
  color: string
}

interface RippleButtonProps {
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
  rippleColor?: string
  rippleDuration?: number
}

export function RippleButton({
  children,
  onClick,
  className = '',
  disabled = false,
  rippleColor = 'rgba(255,255,255,0.3)',
  rippleDuration = 600,
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleState[]>([])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    const newRipple = { key: Date.now(), x, y, size, color: rippleColor }
    setRipples((prev) => [...prev, newRipple])
    setTimeout(() => setRipples((c) => c.filter((r) => r.key !== newRipple.key)), rippleDuration)
    onClick?.(event)
  }

  return (
    <button className={`relative overflow-hidden isolate cursor-pointer ${className}`} onClick={handleClick} disabled={disabled}>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {ripples.map((r) => (
          <span
            key={r.key}
            className="absolute rounded-full"
            style={{
              left: r.x, top: r.y, width: r.size, height: r.size,
              backgroundColor: r.color,
              animation: `ripple-anim ${rippleDuration}ms ease-out forwards`,
            } as CSSProperties}
          />
        ))}
      </div>
      <style>{`@keyframes ripple-anim { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }`}</style>
    </button>
  )
}
