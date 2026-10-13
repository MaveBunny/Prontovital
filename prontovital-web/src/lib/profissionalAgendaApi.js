
import api from './api'
import { getUsuarioLocal } from './authService'

/**
 * Retorna o ID do profissional autenticado.
 */
function obterIdProfissional() {
  const usuario = getUsuarioLocal()
  const id = usuario?.id_profissional

  if (!id) {
    throw new Error(
      'Não foi possível identificar o profissional autenticado.',
    )
  }

  return id
}

/**
 * Converte a data e o horário retornados pela API
 * em uma data local, sem aplicar conversões UTC indevidas.
 */
export function toDataHora(agendamento) {
  const data = String(agendamento.data_agendamento ?? '').slice(0, 10)
  const horario = String(
    agendamento.horario_agendamento ?? '00:00:00',
  )

  if (!data) {
    throw new Error('O agendamento não possui uma data válida.')
  }

  return new Date(`${data}T${horario}`)
}

/**
 * Retorna a data no formato YYYY-MM-DD.
 */
export function toISODate(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

/**
 * Lista os agendamentos do profissional autenticado.
 */
export async function listarAgendamentosProfissional() {
  const idProfissional = obterIdProfissional()

  const { data } = await api.get(
    `/profissionais/${idProfissional}/agendamentos`,
  )

  if (!Array.isArray(data)) {
    throw new Error('A API retornou uma lista de agendamentos inválida.')
  }

  return data
}

/**
 * Busca um agendamento pelo ID utilizando a listagem da API,
 * pois o backend atual não possui uma rota individual de consulta.
 */
export async function obterAgendamentoPorId(id) {
  const agendamentos = await listarAgendamentosProfissional()

  const agendamento = agendamentos.find(
    (item) => String(item.id_agendamento) === String(id),
  )

  if (!agendamento) {
    throw new Error('Agendamento não encontrado.')
  }

  return agendamento
}

/**
 * Filtra os agendamentos por período.
 */
export async function listarAgendamentosPorPeriodo(inicio, fim) {
  const agendamentos = await listarAgendamentosProfissional()

  const dataInicio = toISODate(inicio)
  const dataFim = toISODate(fim)

  return agendamentos.filter((agendamento) => {
    const data = String(agendamento.data_agendamento).slice(0, 10)

    return data >= dataInicio && data <= dataFim
  })
}
