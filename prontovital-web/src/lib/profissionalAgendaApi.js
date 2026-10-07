/**
 * Camada de serviço — agendamentos do profissional.
 *
 * Hoje delega para o mock centralizado (lib/mocks/agendamentosProfissional.mock.js).
 * Quando o backend expuser GET /profissionais/:id/agendamentos, basta trocar as
 * implementações internas por chamadas ao cliente `api` — as assinaturas públicas
 * (listarAgendamentosProfissional, obterAgendamentoPorId, listarAgendamentosPorPeriodo)
 * permanecem as mesmas e as telas T01–T04 não precisam ser reconstruídas.
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