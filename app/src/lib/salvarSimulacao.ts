import { supabase } from '@/lib/supabase'
import type { PlanoTipo, VarianteTipo, CategoriaTipo } from '@/hooks/useSimulador'

interface SalvarParams {
  userId: string
  clienteNome: string
  clienteTelefone?: string
  administradoraId: string
  categoria: CategoriaTipo
  plano: PlanoTipo
  variante: VarianteTipo
  dadosEntrada: Record<string, unknown>
  dadosCalculados: Record<string, unknown>
  resumo: Record<string, unknown>
}

export async function salvarSimulacao(params: SalvarParams) {
  const { data, error } = await supabase
    .from('simulacoes')
    .insert({
      user_id: params.userId,
      cliente_nome: params.clienteNome,
      cliente_telefone: params.clienteTelefone ?? null,
      administradora_id: params.administradoraId,
      categoria: params.categoria,
      plano: params.plano,
      variante: params.variante,
      dados_entrada: params.dadosEntrada,
      dados_calculados: params.dadosCalculados,
      resumo: params.resumo,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function salvarProposta(simulacaoId: string, userId: string, pdfUrl: string | null, formato: 'pdf' | 'whatsapp_text' | 'link', canal?: 'whatsapp' | 'email' | 'link' | 'download') {
  const { data, error } = await supabase
    .from('propostas_geradas')
    .insert({
      simulacao_id: simulacaoId,
      user_id: userId,
      pdf_url: pdfUrl,
      formato,
      compartilhada_em: canal ? new Date().toISOString() : null,
      canal_compartilhamento: canal ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listarSimulacoes(userId: string) {
  const { data, error } = await supabase
    .from('simulacoes')
    .select('*, administradoras(nome, logo_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}

export async function excluirSimulacao(id: string) {
  const { error } = await supabase.from('simulacoes').delete().eq('id', id)
  if (error) throw error
}
