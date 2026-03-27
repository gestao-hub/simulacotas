import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTrialStatus } from '@/hooks/useTrialStatus'

export default function TrialBanner() {
  const { showExpiringWarning, hoursRemaining } = useTrialStatus()
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  if (!showExpiringWarning || dismissed) return null

  const timeText = hoursRemaining <= 1
    ? 'menos de 1 hora'
    : `${hoursRemaining} horas`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
        className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 lg:mx-0"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-sm font-medium text-amber-800">
            Seu trial expira em <strong>{timeText}</strong>. Assine para não perder acesso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => navigate('/app/checkout')}
          >
            Assinar agora
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
