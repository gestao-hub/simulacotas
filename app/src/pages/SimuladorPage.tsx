import { useState, useEffect } from 'react'
import { useSimulador, formatBRL, type Administradora, type PlanoTipo } from '@/hooks/useSimulador'
import AdminSelectorChips from '@/components/simulador/AdminSelectorChips'
import { CampoEditavel, CampoCalculado, CampoTexto } from '@/components/simulador/CampoMonetario'
import ResultadoCard from '@/components/simulador/ResultadoCard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { salvarSimulacao, salvarProposta } from '@/lib/salvarSimulacao'
import { gerarHTMLProposta, abrirPDFNovaAba } from '@/lib/gerarPDF'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const planoLabels: Record<PlanoTipo, string> = {
  linear: 'Linear',
  reduzida_70_30: '70/30',
  reduzida_50_50: '50/50',
}

export default function SimuladorPage() {
  const sim = useSimulador()
  const { user, profile } = useAuth()
  const [administradoras, setAdministradoras] = useState<Administradora[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<Administradora | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    supabase
      .from('administradoras')
      .select('*')
      .eq('is_active', true)
      .order('ordem')
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((d) => ({
            ...d,
            taxa_adm_padrao: Number(d.taxa_adm_padrao),
            fundo_reserva_padrao: Number(d.fundo_reserva_padrao),
            lance_embutido_padrao: Number(d.lance_embutido_padrao),
          }))
          setAdministradoras(mapped)
        }
      })
  }, [])

  const handleSelectAdmin = (admin: Administradora) => {
    setSelectedAdmin(admin)
    sim.preencherComAdmin(admin)
  }

  const salvarEGerar = async (formato: 'pdf' | 'whatsapp_text') => {
    if (!sim.resumo || !selectedAdmin || !user) return
    setSalvando(true)
    try {
      const simSalva = await salvarSimulacao({
        userId: user.id,
        clienteNome: sim.clienteNome,
        administradoraId: selectedAdmin.id,
        categoria: sim.categoria,
        plano: sim.plano,
        variante: sim.variante,
        dadosEntrada: { valor_bem: sim.valorBem, prazo: sim.prazo, qtde_cotas: sim.qtdeCotas, taxa_adm: sim.taxaAdm, fundo_reserva: sim.fundoReserva, lance_percentual: sim.lancePercentual, lance_embutido_percentual: sim.lanceEmbutidoPerc },
        dadosCalculados: JSON.parse(JSON.stringify(sim.resultadoLinear ?? sim.resultado5050 ?? sim.resultado7030 ?? {})),
        resumo: sim.resumo,
      })
      await salvarProposta(simSalva.id, user.id, null, formato, formato === 'whatsapp_text' ? 'whatsapp' : 'download')
      return simSalva
    } catch (e) {
      console.error('Erro ao salvar:', e)
    } finally {
      setSalvando(false)
    }
  }

  const handleGerarPDF = () => {
    if (!sim.resumo || !selectedAdmin) return

    // Abrir janela SINCRONAMENTE (antes de qualquer async) para evitar bloqueio de pop-up
    const win = window.open('', '_blank')
    if (!win) {
      alert('Permita pop-ups para gerar o PDF')
      return
    }

    // Gerar HTML e exibir na janela já aberta
    const html = gerarHTMLProposta({
      corretorNome: profile?.full_name ?? '',
      corretorWhatsapp: profile?.whatsapp ?? '',
      corretorLogo: profile?.logo_corretor_url ?? null,
      corPrimaria: profile?.cor_primaria ?? '#0D1B4B',
      corSecundaria: profile?.cor_secundaria ?? '#CCEE00',
      clienteNome: sim.clienteNome,
      administradoraNome: selectedAdmin.nome,
      plano: sim.plano,
      categoria: sim.categoria,
      resumo: sim.resumo,
    })
    abrirPDFNovaAba(html, win)

    // Salvar no banco em background (fire-and-forget)
    salvarEGerar('pdf')
  }

  const handleWhatsApp = () => {
    if (!sim.resumo) return
    salvarEGerar('whatsapp_text')
    const texto = [
      `*Simulação de Consórcio${selectedAdmin ? ` — ${selectedAdmin.nome}` : ''}*`,
      '━━━━━━━━━━━━━━━━━━━',
      `📋 Plano: ${planoLabels[sim.plano]}`,
      `🏠 Categoria: ${sim.categoria}`,
      `💰 Carta de Crédito: ${formatBRL(sim.resumo.carta_credito)}`,
      `📅 Prazo: ${sim.resumo.prazo_meses} meses`,
      `💵 Parcela Inicial: ${formatBRL(sim.resumo.parcela_inicial)}`,
      `📉 Parcela Pós-Lance: ${formatBRL(sim.resumo.parcela_pos_lance)}`,
      '━━━━━━━━━━━━━━━━━━━',
      `_Simulação por SimulaCotas_`,
    ].join('\n')

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nova Simulação</h1>

      {/* Administradora + Plano + Categoria + Cliente */}
      <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <Label className="mb-2 block text-sm font-medium text-gray-500">
            Administradora
          </Label>
          <AdminSelectorChips
            administradoras={administradoras}
            selectedId={selectedAdmin?.id ?? null}
            onSelect={handleSelectAdmin}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-500">Plano</Label>
            <Tabs value={sim.plano} onValueChange={(v) => sim.setPlano(v as PlanoTipo)}>
              <TabsList className="w-full">
                {(Object.keys(planoLabels) as PlanoTipo[])
                  .filter((p) => !selectedAdmin || selectedAdmin.planos_disponiveis.includes(p))
                  .map((p) => (
                    <TabsTrigger key={p} value={p} className="flex-1 text-xs font-bold">
                      {planoLabels[p]}
                    </TabsTrigger>
                  ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-500">Categoria</Label>
            <Select value={sim.categoria} onValueChange={(v) => sim.setCategoria(v as typeof sim.categoria)}>
              <SelectTrigger className="h-10 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imovel">Imóvel</SelectItem>
                <SelectItem value="veiculo">Veículo</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CampoTexto
          label="Cliente"
          value={sim.clienteNome}
          onChange={sim.setClienteNome}
          placeholder="Nome do cliente"
        />
      </div>

      {/* ─── Linear e 50/50 ─── */}
      {(sim.plano === 'linear' || sim.plano === 'reduzida_50_50') && (
        <>
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <SectionTitle>Informações do Crédito</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <CampoEditavel label="Valor do Bem" value={sim.valorBem} onChange={sim.setValorBem} prefix="R$" />
              <CampoEditavel label="Prazo" value={sim.prazo} onChange={sim.setPrazo} hint="meses" min={1} />
              <CampoEditavel label="Qtd. Cotas" value={sim.qtdeCotas} onChange={sim.setQtdeCotas} min={1} />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <SectionTitle>Taxas</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <CampoEditavel label="Taxa Adm %" value={sim.taxaAdm} onChange={sim.setTaxaAdm} suffix="%" step={0.1} />
              <CampoEditavel label="Fundo Reserva %" value={sim.fundoReserva} onChange={sim.setFundoReserva} suffix="%" step={0.1} />
              <CampoCalculado
                label="% Mensal"
                value={sim.resultadoLinear?.percentual_mensal ?? sim.resultado5050?.percentual_mensal ?? 0}
                formato="percentual"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <SectionTitle>Estimativa de Lance</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <CampoEditavel label="% Lance" value={sim.lancePercentual} onChange={sim.setLancePercentual} suffix="%" step={1} min={0} max={100} />
              <CampoEditavel label="Lance Embutido %" value={sim.lanceEmbutidoPerc} onChange={sim.setLanceEmbutidoPerc} suffix="%" step={0.1} min={0} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CampoCalculado label="Lance Total" value={sim.resultadoLinear?.lance_total ?? sim.resultado5050?.lance_total ?? 0} />
              <CampoCalculado label="Recursos Próprios" value={sim.resultadoLinear?.lance_recursos_proprios ?? sim.resultado5050?.lance_recursos_proprios ?? 0} destaque />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <SectionTitle>Valores Calculados</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <CampoCalculado label="Valor Total" value={sim.resultadoLinear?.valor_total ?? sim.resultado5050?.valor_total ?? 0} />
              <CampoCalculado label="Parcela Base" value={sim.resultadoLinear?.parcela_base ?? sim.resultado5050?.parcela_base ?? 0} />
              <CampoCalculado label="Vl. Bem + Taxas" value={sim.resultadoLinear?.valor_bem_taxas ?? sim.resultado5050?.valor_bem_taxas ?? 0} />
              <CampoCalculado label="Crédito Líquido" value={sim.resultadoLinear?.credito_liquido ?? sim.resultado5050?.credito_liquido ?? 0} />
              <CampoCalculado label="Parcela Pós-Lance" value={sim.resultadoLinear?.parcela_pos_lance ?? sim.resultado5050?.parcela_pos_lance ?? 0} destaque />
              {sim.plano === 'reduzida_50_50' && sim.resultado5050 && (
                <>
                  <CampoCalculado label="Entrada (50%)" value={sim.resultado5050.parcela_entrada_50} />
                  <CampoCalculado label="Saldo (50%)" value={sim.resultado5050.saldo_financiar_50} />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── 70/30 ─── */}
      {sim.plano === 'reduzida_70_30' && (
        <>
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <SectionTitle>Taxas</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <CampoEditavel label="Taxa Adm %" value={sim.taxaAdm} onChange={sim.setTaxaAdm} suffix="%" step={0.1} />
              <CampoEditavel label="Fundo Reserva %" value={sim.fundoReserva} onChange={sim.setFundoReserva} suffix="%" step={0.1} />
              <CampoEditavel label="Lance Embutido %" value={sim.lanceEmbutidoPerc} onChange={sim.setLanceEmbutidoPerc} suffix="%" step={0.1} min={0} />
            </div>
          </div>

          {sim.cotas7030.map((cota, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-navy)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-gray-900">Cota {i + 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CampoEditavel label="Prazo" value={cota.prazo} onChange={(v) => sim.updateCota7030(i, 'prazo', v)} hint="meses" min={1} />
                <CampoEditavel label="Valor do Bem" value={cota.valor_bem} onChange={(v) => sim.updateCota7030(i, 'valor_bem', v)} prefix="R$" />
                <CampoEditavel label="% Lance" value={cota.lance_percentual} onChange={(v) => sim.updateCota7030(i, 'lance_percentual', v)} suffix="%" min={0} max={100} />
                {sim.resultado7030 && (
                  <CampoCalculado label="% Mensal" value={sim.resultado7030.cotas[i]?.percentual_mensal ?? 0} formato="percentual" />
                )}
              </div>
              {sim.resultado7030 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <CampoCalculado label="Recursos Próprios" value={sim.resultado7030.cotas[i]?.lance_recursos_proprios ?? 0} destaque />
                  <CampoCalculado label="Crédito Líquido" value={sim.resultado7030.cotas[i]?.credito_liquido ?? 0} />
                  <CampoCalculado label="Entrada (30%)" value={sim.resultado7030.cotas[i]?.entrada_30 ?? 0} />
                  <CampoCalculado label="Saldo (70%)" value={sim.resultado7030.cotas[i]?.saldo_70 ?? 0} />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Resultado */}
      <ResultadoCard
        resumo={sim.resumo}
        clienteNome={sim.clienteNome}
        onGerarPDF={handleGerarPDF}
        onCompartilharWhatsApp={handleWhatsApp}
        salvando={salvando}
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
  )
}
