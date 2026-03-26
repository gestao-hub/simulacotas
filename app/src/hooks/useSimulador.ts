import { useState, useMemo } from 'react'

export type PlanoTipo = 'linear' | 'reduzida_70_30' | 'reduzida_50_50'
export type VarianteTipo = 'normal' | '12_meses'
export type CategoriaTipo = 'imovel' | 'veiculo' | 'moto' | 'servicos'

export interface Administradora {
  id: string
  nome: string
  logo_url: string | null
  taxa_adm_padrao: number
  fundo_reserva_padrao: number
  lance_embutido_padrao: number
  categorias: CategoriaTipo[]
  planos_disponiveis: PlanoTipo[]
}

export interface EntradaLinear {
  valor_bem: number
  prazo: number
  qtde_cotas: number
  taxa_adm: number
  fundo_reserva: number
  lance_percentual: number
  lance_embutido_percentual: number
}

export interface ResultadoLinear {
  percentual_mensal: number
  valor_total: number
  parcela_base: number
  valor_bem_taxas: number
  lance_total: number
  lance_embutido: number
  lance_recursos_proprios: number
  credito_liquido: number
  parcela_pos_lance: number
  juros_operacao: number
}

export interface CotaEntrada7030 {
  vencimento: string
  grupo: string
  prazo: number
  valor_bem: number
  lance_percentual: number
}

export interface CotaResultado7030 {
  percentual_mensal: number
  valor_total: number
  valor_bem_taxas: number
  lance_total: number
  lance_embutido: number
  lance_recursos_proprios: number
  credito_liquido: number
  entrada_30: number
  saldo_70: number
}

export interface Resultado7030 {
  cotas: CotaResultado7030[]
  carta_credito_total: number
  lance_total: number
  recursos_proprios_total: number
  prazo_medio: number
}

export interface Resultado5050 extends ResultadoLinear {
  parcela_entrada_50: number
  saldo_financiar_50: number
}

// ─── Cálculos Linear ────────────────────────────────────────────

export function calcularLinear(e: EntradaLinear): ResultadoLinear {
  const valorTotal = e.valor_bem * e.qtde_cotas
  const percMensal = e.prazo > 0 ? (e.taxa_adm + e.fundo_reserva) / e.prazo : 0
  const parcelaBase = e.prazo > 0 ? valorTotal / e.prazo : 0
  const valorBemTaxas = valorTotal * (1 + percMensal / 100)
  const lanceTotal = valorTotal * (e.lance_percentual / 100)
  const lanceEmbutido = valorTotal * (e.lance_embutido_percentual / 100)
  const lanceRecursosProprios = lanceTotal - lanceEmbutido
  const creditoLiquido = valorTotal - lanceEmbutido
  const parcelaPosLance = e.prazo > 1
    ? (valorBemTaxas - parcelaBase - lanceTotal) / (e.prazo - 1)
    : 0
  const jurosOperacao = valorBemTaxas - valorTotal

  return {
    percentual_mensal: percMensal,
    valor_total: valorTotal,
    parcela_base: parcelaBase,
    valor_bem_taxas: valorBemTaxas,
    lance_total: lanceTotal,
    lance_embutido: lanceEmbutido,
    lance_recursos_proprios: Math.max(0, lanceRecursosProprios),
    credito_liquido: creditoLiquido,
    parcela_pos_lance: Math.max(0, parcelaPosLance),
    juros_operacao: jurosOperacao,
  }
}

// ─── Cálculos 70/30 ────────────────────────────────────────────

export function calcular7030(
  cotas: CotaEntrada7030[],
  taxaAdm: number,
  fundoReserva: number,
  lanceEmbutidoPerc: number,
): Resultado7030 {
  let cartaCreditoTotal = 0
  let lanceTotalGeral = 0
  let recursosPropTotal = 0
  let prazoSum = 0
  let cotasCount = 0

  const resultadosCotas = cotas.map((c) => {
    const percMensal = c.prazo > 0 ? (taxaAdm + fundoReserva) / c.prazo : 0
    const valorTotal = c.valor_bem
    const valorBemTaxas = valorTotal * (1 + percMensal / 100)
    const lanceTotal = valorTotal * (c.lance_percentual / 100)
    const lanceEmbutido = valorTotal * (lanceEmbutidoPerc / 100)
    const lanceRecursos = lanceTotal - lanceEmbutido
    const creditoLiquido = valorTotal - lanceEmbutido
    const entrada30 = valorBemTaxas * 0.30
    const saldo70 = valorBemTaxas * 0.70

    if (c.valor_bem > 0 && c.prazo > 0) {
      cartaCreditoTotal += valorTotal
      lanceTotalGeral += lanceTotal
      recursosPropTotal += lanceRecursos
      prazoSum += c.prazo
      cotasCount++
    }

    return {
      percentual_mensal: percMensal,
      valor_total: valorTotal,
      valor_bem_taxas: valorBemTaxas,
      lance_total: lanceTotal,
      lance_embutido: lanceEmbutido,
      lance_recursos_proprios: Math.max(0, lanceRecursos),
      credito_liquido: creditoLiquido,
      entrada_30: entrada30,
      saldo_70: saldo70,
    }
  })

  return {
    cotas: resultadosCotas,
    carta_credito_total: cartaCreditoTotal,
    lance_total: lanceTotalGeral,
    recursos_proprios_total: Math.max(0, recursosPropTotal),
    prazo_medio: cotasCount > 0 ? prazoSum / cotasCount : 0,
  }
}

// ─── Cálculos 50/50 ────────────────────────────────────────────

export function calcular5050(e: EntradaLinear): Resultado5050 {
  const base = calcularLinear(e)
  const parcelaEntrada50 = base.parcela_base / 2
  const saldoFinanciar50 = base.valor_bem_taxas / 2
  const parcelaPosLance = e.prazo > 1
    ? (base.valor_bem_taxas - parcelaEntrada50 - base.lance_total) / (e.prazo - 1)
    : 0

  return {
    ...base,
    parcela_entrada_50: parcelaEntrada50,
    saldo_financiar_50: saldoFinanciar50,
    parcela_pos_lance: Math.max(0, parcelaPosLance),
  }
}

// ─── Formatação ────────────────────────────────────────────────

export function formatBRL(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPct(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '—'
  return value.toFixed(4).replace('.', ',') + '%'
}

// ─── Hook principal ────────────────────────────────────────────

const defaultCotas7030: CotaEntrada7030[] = [
  { vencimento: '', grupo: '', prazo: 222, valor_bem: 309000, lance_percentual: 40 },
  { vencimento: '', grupo: '', prazo: 222, valor_bem: 309000, lance_percentual: 40 },
  { vencimento: '', grupo: '', prazo: 222, valor_bem: 309000, lance_percentual: 40 },
]

export function useSimulador() {
  const [plano, setPlano] = useState<PlanoTipo>('linear')
  const [variante, setVariante] = useState<VarianteTipo>('normal')
  const [categoria, setCategoria] = useState<CategoriaTipo>('imovel')
  const [clienteNome, setClienteNome] = useState('')

  // Campos editáveis compartilhados
  const [valorBem, setValorBem] = useState(400000)
  const [prazo, setPrazo] = useState(200)
  const [qtdeCotas, setQtdeCotas] = useState(1)
  const [taxaAdm, setTaxaAdm] = useState(20)
  const [fundoReserva, setFundoReserva] = useState(3)
  const [lancePercentual, setLancePercentual] = useState(50)
  const [lanceEmbutidoPerc, setLanceEmbutidoPerc] = useState(0.3)

  // Cotas 70/30
  const [cotas7030, setCotas7030] = useState<CotaEntrada7030[]>(defaultCotas7030)

  const updateCota7030 = (index: number, field: keyof CotaEntrada7030, value: string | number) => {
    setCotas7030(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // Resultados calculados em tempo real
  const resultadoLinear = useMemo(() => {
    if (plano !== 'linear') return null
    return calcularLinear({
      valor_bem: valorBem,
      prazo,
      qtde_cotas: qtdeCotas,
      taxa_adm: taxaAdm,
      fundo_reserva: fundoReserva,
      lance_percentual: lancePercentual,
      lance_embutido_percentual: lanceEmbutidoPerc,
    })
  }, [plano, valorBem, prazo, qtdeCotas, taxaAdm, fundoReserva, lancePercentual, lanceEmbutidoPerc])

  const resultado7030 = useMemo(() => {
    if (plano !== 'reduzida_70_30') return null
    return calcular7030(cotas7030, taxaAdm, fundoReserva, lanceEmbutidoPerc)
  }, [plano, cotas7030, taxaAdm, fundoReserva, lanceEmbutidoPerc])

  const resultado5050 = useMemo(() => {
    if (plano !== 'reduzida_50_50') return null
    return calcular5050({
      valor_bem: valorBem,
      prazo,
      qtde_cotas: qtdeCotas,
      taxa_adm: taxaAdm,
      fundo_reserva: fundoReserva,
      lance_percentual: lancePercentual,
      lance_embutido_percentual: lanceEmbutidoPerc,
    })
  }, [plano, valorBem, prazo, qtdeCotas, taxaAdm, fundoReserva, lancePercentual, lanceEmbutidoPerc])

  // Resumo universal (para o card de resultado)
  const resumo = useMemo(() => {
    if (plano === 'linear' && resultadoLinear) {
      return {
        carta_credito: resultadoLinear.valor_total,
        parcela_inicial: resultadoLinear.parcela_base,
        parcela_pos_lance: resultadoLinear.parcela_pos_lance,
        credito_liquido: resultadoLinear.credito_liquido,
        recursos_proprios: resultadoLinear.lance_recursos_proprios,
        prazo_meses: prazo,
      }
    }
    if (plano === 'reduzida_70_30' && resultado7030) {
      return {
        carta_credito: resultado7030.carta_credito_total,
        parcela_inicial: 0, // Múltiplas cotas
        parcela_pos_lance: 0,
        credito_liquido: resultado7030.carta_credito_total - resultado7030.lance_total + resultado7030.recursos_proprios_total,
        recursos_proprios: resultado7030.recursos_proprios_total,
        prazo_meses: Math.round(resultado7030.prazo_medio),
      }
    }
    if (plano === 'reduzida_50_50' && resultado5050) {
      return {
        carta_credito: resultado5050.valor_total,
        parcela_inicial: resultado5050.parcela_entrada_50,
        parcela_pos_lance: resultado5050.parcela_pos_lance,
        credito_liquido: resultado5050.credito_liquido,
        recursos_proprios: resultado5050.lance_recursos_proprios,
        prazo_meses: prazo,
      }
    }
    return null
  }, [plano, resultadoLinear, resultado7030, resultado5050, prazo])

  const preencherComAdmin = (admin: Administradora) => {
    setTaxaAdm(admin.taxa_adm_padrao)
    setFundoReserva(admin.fundo_reserva_padrao)
    setLanceEmbutidoPerc(admin.lance_embutido_padrao)
  }

  return {
    // Estado
    plano, setPlano,
    variante, setVariante,
    categoria, setCategoria,
    clienteNome, setClienteNome,
    valorBem, setValorBem,
    prazo, setPrazo,
    qtdeCotas, setQtdeCotas,
    taxaAdm, setTaxaAdm,
    fundoReserva, setFundoReserva,
    lancePercentual, setLancePercentual,
    lanceEmbutidoPerc, setLanceEmbutidoPerc,
    cotas7030, setCotas7030, updateCota7030,
    // Resultados
    resultadoLinear,
    resultado7030,
    resultado5050,
    resumo,
    // Ações
    preencherComAdmin,
  }
}
