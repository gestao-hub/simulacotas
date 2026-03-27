import { useSearchParams, useNavigate } from 'react-router-dom'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import AuthForm from './AuthForm'

export default function AuthModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const authParam = searchParams.get('auth')
  const isOpen = authParam === 'login' || authParam === 'register'
  const defaultMode = authParam === 'login' ? 'login' : 'register'

  const handleClose = () => {
    searchParams.delete('auth')
    setSearchParams(searchParams, { replace: true })
  }

  const handleSuccess = () => {
    handleClose()
    navigate('/app')
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay glassmorphism */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-[#0D1B4B]/30 backdrop-blur-md transition-all duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />

        {/* Modal glassmorphism */}
        <DialogPrimitive.Popup
          className="fixed top-4 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/50 bg-white/75 p-6 shadow-2xl shadow-[#0D1B4B]/10 outline-none transition-all duration-300 backdrop-blur-[40px] sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:p-8 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          style={{ backdropFilter: 'blur(40px) saturate(1.6)' }}
        >
          {/* Close button */}
          <DialogPrimitive.Close
            className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600"
          >
            <X size={18} />
          </DialogPrimitive.Close>

          <AuthForm defaultMode={defaultMode} onSuccess={handleSuccess} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
