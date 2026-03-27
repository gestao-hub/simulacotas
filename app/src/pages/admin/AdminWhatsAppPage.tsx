import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Wifi, WifiOff, RefreshCw, Trash2, QrCode, Phone, Loader2 } from 'lucide-react'

interface InstanceStatus {
  status?: {
    connected: boolean
    loggedIn: boolean
  }
  instance?: {
    id: string
    name: string
    status: string
    profileName?: string
    profilePicUrl?: string
    qrcode?: string
    paircode?: string
  }
}

export default function AdminWhatsAppPage() {
  const [uazapiUrl, setUazapiUrl] = useState('')
  const [adminToken, setAdminToken] = useState('')
  const [instanceToken, setInstanceToken] = useState('')
  const [instanceName, setInstanceName] = useState('simulacotas')
  const [status, setStatus] = useState<InstanceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Carregar configurações salvas
  useEffect(() => {
    const load = async () => {
      const keys = ['UAZAPI_URL', 'UAZAPI_ADMIN_TOKEN', 'UAZAPI_TOKEN']
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', keys)
        .eq('is_active', true)

      for (const s of data ?? []) {
        if (s.key === 'UAZAPI_URL') setUazapiUrl(s.value)
        if (s.key === 'UAZAPI_ADMIN_TOKEN') setAdminToken(s.value)
        if (s.key === 'UAZAPI_TOKEN') setInstanceToken(s.value)
      }
    }
    load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Verificar status quando temos URL e token
  useEffect(() => {
    if (uazapiUrl && instanceToken) checkStatus()
  }, [uazapiUrl, instanceToken])

  const saveSetting = async (key: string, value: string, category = 'whatsapp') => {
    const { data: existing } = await supabase
      .from('platform_settings')
      .select('id')
      .eq('key', key)
      .single()

    if (existing) {
      await supabase.from('platform_settings').update({ value }).eq('id', existing.id)
    } else {
      await supabase.from('platform_settings').insert({ key, value, category, is_active: true })
    }
  }

  const api = async (path: string, method = 'GET', body?: unknown, useAdmin = false) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (useAdmin) headers['admintoken'] = adminToken
    else headers['token'] = instanceToken

    const res = await fetch(`${uazapiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }

  const checkStatus = async () => {
    if (!uazapiUrl || !instanceToken) return
    try {
      const data = await api('/instance/status')
      setStatus(data)
      setQrCode(data?.instance?.qrcode || null)
    } catch {
      setStatus(null)
    }
  }

  const handleCreateInstance = async () => {
    if (!uazapiUrl || !adminToken || !instanceName.trim()) {
      setError('Preencha URL, Admin Token e nome da instância')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await api('/instance/init', 'POST', { name: instanceName }, true)

      if (data.token) {
        setInstanceToken(data.token)
        await saveSetting('UAZAPI_URL', uazapiUrl)
        await saveSetting('UAZAPI_ADMIN_TOKEN', adminToken)
        await saveSetting('UAZAPI_TOKEN', data.token)
        setSuccess(`Instância "${instanceName}" criada! Token salvo automaticamente.`)

        // Conectar automaticamente
        setTimeout(() => handleConnect(data.token), 1000)
      } else {
        setError(data.error || data.message || 'Erro ao criar instância')
      }
    } catch (err) {
      setError(`Erro de conexão: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (token?: string) => {
    setLoading(true)
    setError('')
    setQrCode(null)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'token': token || instanceToken,
      }
      const res = await fetch(`${uazapiUrl}/instance/connect`, { method: 'POST', headers })
      const data = await res.json()

      if (data?.instance?.qrcode) {
        setQrCode(data.instance.qrcode)
        startPolling(token)
      } else if (data?.instance?.status === 'connected') {
        setSuccess('Já conectado!')
        await checkStatus()
      } else {
        startPolling(token)
      }
    } catch (err) {
      setError(`Erro ao conectar: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const startPolling = (token?: string) => {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'token': token || instanceToken,
        }
        const res = await fetch(`${uazapiUrl}/instance/status`, { headers })
        const data = await res.json()

        setStatus(data)

        if (data?.instance?.qrcode) {
          setQrCode(data.instance.qrcode)
        }

        if (data?.instance?.status === 'connected' || data?.status?.connected) {
          if (pollRef.current) clearInterval(pollRef.current)
          setQrCode(null)
          setSuccess('WhatsApp conectado com sucesso!')
        }
      } catch { /* ignore */ }
    }, 3000)
  }

  const handleDisconnect = async () => {
    if (!confirm('Desconectar o WhatsApp?')) return
    setLoading(true)
    await api('/instance/disconnect', 'POST')
    setQrCode(null)
    setSuccess('')
    await checkStatus()
    setLoading(false)
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    await saveSetting('UAZAPI_URL', uazapiUrl)
    await saveSetting('UAZAPI_ADMIN_TOKEN', adminToken)
    if (instanceToken) await saveSetting('UAZAPI_TOKEN', instanceToken)
    setSuccess('Configurações salvas!')
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const isConnected = status?.instance?.status === 'connected' || status?.status?.connected
  const isConnecting = status?.instance?.status === 'connecting'
  const profileName = status?.instance?.profileName

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
          <MessageSquare size={20} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-sm text-gray-400">Configuração da integração UAZAPI</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <Wifi size={28} className="text-green-500" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <WifiOff size={28} className="text-gray-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">
                  {isConnected ? profileName || 'Conectado' : isConnecting ? 'Conectando...' : 'Desconectado'}
                </p>
                <Badge className={isConnected ? 'bg-green-100 text-green-800' : isConnecting ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}>
                  {isConnected ? 'Online' : isConnecting ? 'Aguardando QR' : 'Offline'}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                {isConnected ? 'WhatsApp sincronizado e pronto para envios' : 'Configure e conecte sua instância'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Button variant="outline" size="sm" className="rounded-xl text-red-400" onClick={handleDisconnect}>
                <Trash2 size={14} className="mr-1" /> Desconectar
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-xl" onClick={checkStatus}>
              <RefreshCw size={14} className="mr-1" /> Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <QrCode size={20} className="text-green-500" />
            <p className="text-lg font-semibold text-gray-900">Escaneie o QR Code</p>
          </div>
          <p className="mb-6 text-sm text-gray-400">
            Abra o WhatsApp no celular &gt; Menu &gt; Dispositivos conectados &gt; Conectar dispositivo
          </p>
          <div className="mx-auto w-fit rounded-2xl border-4 border-green-100 p-4">
            <img src={qrCode} alt="QR Code WhatsApp" className="h-64 w-64" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-500">
            <Loader2 size={14} className="animate-spin" />
            Aguardando leitura do QR Code...
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuração */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase tracking-wide">Configuração UAZAPI</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">URL do Servidor</Label>
              <Input
                value={uazapiUrl}
                onChange={(e) => setUazapiUrl(e.target.value)}
                placeholder="https://free.uazapi.com"
                className="rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <Label className="text-gray-700">Admin Token</Label>
              <Input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Token de administrador"
                className="rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <Label className="text-gray-700">Token da Instância</Label>
              <Input
                value={instanceToken}
                onChange={(e) => setInstanceToken(e.target.value)}
                placeholder="Gerado automaticamente ao criar"
                className="rounded-xl bg-gray-50 border-gray-200 font-mono text-xs"
                readOnly={!!instanceToken}
              />
            </div>
            <Button onClick={handleSaveConfig} className="w-full rounded-xl bg-gray-900" disabled={loading}>
              Salvar Configurações
            </Button>
          </div>
        </div>

        {/* Criar / Conectar */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase tracking-wide">Instância WhatsApp</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700">Nome da Instância</Label>
              <Input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="simulacotas"
                className="rounded-xl bg-gray-50 border-gray-200"
              />
            </div>

            {!instanceToken ? (
              <Button
                onClick={handleCreateInstance}
                className="w-full gap-2 rounded-xl bg-green-600 hover:bg-green-700"
                disabled={loading || !uazapiUrl || !adminToken}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                Criar Instância + Gerar QR Code
              </Button>
            ) : (
              <div className="space-y-3">
                {!isConnected && (
                  <Button
                    onClick={() => handleConnect()}
                    className="w-full gap-2 rounded-xl bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                    {isConnecting ? 'Gerar Novo QR Code' : 'Conectar WhatsApp'}
                  </Button>
                )}
                <p className="text-center text-xs text-gray-400">
                  Token: <span className="font-mono">{instanceToken.substring(0, 12)}...</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">{success}</div>
      )}
    </div>
  )
}
