import { useNavigate, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function TrialExpiredModal() {
  const { showExpiredGate } = useTrialStatus()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isCheckoutPage = location.pathname.includes('/checkout')

  if (!showExpiredGate || isCheckoutPage) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Lock size={28} className="text-red-500" />
          </div>
          <DialogTitle className="text-center text-lg">
            Seu período de teste acabou
          </DialogTitle>
          <DialogDescription className="text-center">
            Seu trial de 3 dias expirou. Assine para continuar usando o SimulaCotas.
          </DialogDescription>
        </DialogHeader>

        {(profile?.simulacoes_count || profile?.propostas_count) ? (
          <div className="rounded-lg border bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
            Durante o trial você fez{' '}
            <strong>{profile.simulacoes_count ?? 0} simulações</strong> e{' '}
            <strong>{profile.propostas_count ?? 0} propostas</strong>.
            Não perca esse progresso!
          </div>
        ) : null}

        <div className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]"
            onClick={() => navigate('/app/checkout')}
          >
            Ver planos e assinar
          </Button>
          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-600"
            onClick={handleSignOut}
          >
            Sair
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
