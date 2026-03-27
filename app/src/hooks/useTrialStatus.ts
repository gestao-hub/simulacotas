import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface TrialStatus {
  isTrialActive: boolean
  isTrialExpired: boolean
  isPaidUser: boolean
  isBlocked: boolean
  hasAccess: boolean
  daysRemaining: number
  hoursRemaining: number
  showExpiringWarning: boolean
  showExpiredGate: boolean
}

export function useTrialStatus(): TrialStatus {
  const { profile, isAdmin, loading } = useAuth()

  return useMemo(() => {
    if (loading || !profile) {
      return {
        isTrialActive: false,
        isTrialExpired: false,
        isPaidUser: false,
        isBlocked: false,
        hasAccess: true, // evita flash enquanto carrega
        daysRemaining: 0,
        hoursRemaining: 0,
        showExpiringWarning: false,
        showExpiredGate: false,
      }
    }

    const now = Date.now()
    const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0
    const msRemaining = Math.max(0, trialEnd - now)

    const isPaidUser = profile.status === 'ativo'
    const isBlocked = ['inadimplente', 'cancelado', 'suspenso'].includes(profile.status)
    const isTrialActive = profile.status === 'trial' && msRemaining > 0
    const isTrialExpired = profile.status === 'trial' && msRemaining <= 0

    const daysRemaining = Math.min(3, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
    const hoursRemaining = Math.ceil(msRemaining / (1000 * 60 * 60))

    const hasAccess = isAdmin || isPaidUser || isTrialActive

    return {
      isTrialActive,
      isTrialExpired,
      isPaidUser,
      isBlocked,
      hasAccess,
      daysRemaining,
      hoursRemaining,
      showExpiringWarning: isTrialActive && daysRemaining <= 1,
      showExpiredGate: isTrialExpired,
    }
  }, [profile, isAdmin, loading])
}
