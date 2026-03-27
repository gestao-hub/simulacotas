import type { PlanoTipo } from '@/hooks/useSimulador'
import { formatBRL } from '@/hooks/useSimulador'

interface PDFParams {
  corretorNome: string
  corretorWhatsapp: string
  corretorLogo: string | null
  corPrimaria: string
  corSecundaria: string
  clienteNome: string
  administradoraNome: string
  plano: PlanoTipo
  categoria: string
  resumo: {
    carta_credito: number
    parcela_inicial: number
    parcela_pos_lance: number
    credito_liquido: number
    recursos_proprios: number
    prazo_meses: number
  }
}

const planoLabel: Record<PlanoTipo, string> = {
  linear: 'Linear',
  reduzida_70_30: 'Reduzida 70/30',
  reduzida_50_50: 'Reduzida 50/50',
}

const categoriaLabel: Record<string, string> = {
  imovel: 'Imóvel',
  veiculo: 'Veículo',
  moto: 'Moto',
  servicos: 'Serviços',
}

export function gerarHTMLProposta(p: PDFParams): string {
  const data = new Date().toLocaleDateString('pt-BR')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1E293B; }
  .page { max-width: 595px; margin: 0 auto; padding: 40px 36px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 3px solid ${p.corSecundaria}; }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-left img { height: 40px; }
  .header-left h1 { font-size: 20px; font-weight: 800; color: ${p.corPrimaria}; }
  .header-right { text-align: right; font-size: 11px; color: #64748B; }
  .client-box { background: #F8F9FA; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
  .client-box h2 { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .client-box p { font-size: 16px; font-weight: 700; color: ${p.corPrimaria}; }
  .info-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .info-chip { flex: 1; background: #F1F5F9; border-radius: 8px; padding: 10px 14px; text-align: center; }
  .info-chip .label { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; }
  .info-chip .value { font-size: 14px; font-weight: 800; color: ${p.corPrimaria}; margin-top: 2px; }
  .result-card { background: linear-gradient(135deg, ${p.corPrimaria}, #152260); border-radius: 16px; padding: 24px; color: #fff; }
  .result-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: ${p.corSecundaria}; margin-bottom: 16px; }
  .result-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .result-item { background: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; border-left: 3px solid ${p.corSecundaria}; }
  .result-item .label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }
  .result-item .value { font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 10px; color: #94A3B8; }
  .footer-right { font-size: 11px; font-weight: 700; color: ${p.corPrimaria}; }
  .disclaimer { margin-top: 16px; font-size: 9px; color: #94A3B8; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      ${p.corretorLogo ? `<img src="${p.corretorLogo}" alt="Logo"/>` : ''}
      <h1>${p.corretorNome || 'SimulaCotas'}</h1>
    </div>
    <div class="header-right">
      <div>${data}</div>
      <div>Proposta de Consórcio</div>
    </div>
  </div>

  <div class="client-box">
    <h2>Cliente</h2>
    <p>${p.clienteNome || '—'}</p>
  </div>

  <div class="info-row">
    <div class="info-chip">
      <div class="label">Administradora</div>
      <div class="value">${p.administradoraNome}</div>
    </div>
    <div class="info-chip">
      <div class="label">Plano</div>
      <div class="value">${planoLabel[p.plano]}</div>
    </div>
    <div class="info-chip">
      <div class="label">Categoria</div>
      <div class="value">${categoriaLabel[p.categoria] ?? p.categoria}</div>
    </div>
  </div>

  <div class="result-card">
    <div class="result-title">Resumo da Simulação</div>
    <div class="result-grid">
      <div class="result-item">
        <div class="label">Carta de Crédito</div>
        <div class="value">${formatBRL(p.resumo.carta_credito)}</div>
      </div>
      <div class="result-item">
        <div class="label">Parcela Inicial</div>
        <div class="value">${formatBRL(p.resumo.parcela_inicial)}</div>
      </div>
      <div class="result-item">
        <div class="label">Parcela Pós-Lance</div>
        <div class="value">${formatBRL(p.resumo.parcela_pos_lance)}</div>
      </div>
      <div class="result-item">
        <div class="label">Crédito Líquido</div>
        <div class="value">${formatBRL(p.resumo.credito_liquido)}</div>
      </div>
      <div class="result-item">
        <div class="label">Recursos Próprios</div>
        <div class="value">${formatBRL(p.resumo.recursos_proprios)}</div>
      </div>
      <div class="result-item">
        <div class="label">Prazo</div>
        <div class="value">${p.resumo.prazo_meses} meses</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">Gerado por SimulaCotas</div>
    <div class="footer-right">${p.corretorWhatsapp ? `WhatsApp: ${p.corretorWhatsapp}` : ''}</div>
  </div>
  <div class="disclaimer">Simulação meramente informativa. Valores sujeitos a confirmação pela administradora.</div>
</div>
</body>
</html>`
}

export function abrirPDFNovaAba(html: string, preOpenedWin?: Window | null) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  if (preOpenedWin) {
    preOpenedWin.location.href = url
    preOpenedWin.onload = () => preOpenedWin.print()
  } else {
    const win = window.open(url, '_blank')
    if (win) {
      win.onload = () => win.print()
    }
  }
}
