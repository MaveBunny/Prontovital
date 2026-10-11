/**
 * Camada de serviço — agendamentos do profissional.
 *
 * Hoje delega para o mock centralizado. Quando o backend expuser as rotas,
 * basta trocar as implementações internas por chamadas ao cliente api.
 */

import {
  listarAgendamentosProfissional as listarMock,
  obterAgendamentoPorId as obterPorIdMock,
  listarAgendamentosPorPeriodo as listarPorPeriodoMock,
} from './mocks/agendamentosProfissional.mock.js'

export async function listarAgendamentosProfissional() {
  return listarMock()
}

export async function obterAgendamentoPorId(id) {
  return obterPorIdMock(id)
}

export async function listarAgendamentosPorPeriodo(inicio, fim) {
  return listarPorPeriodoMock(inicio, fim)
}

export {
  toDataHora,
  toISODate,
  PROFISSIONAL,
} from './mocks/agendamentosProfissional.mock.js'
