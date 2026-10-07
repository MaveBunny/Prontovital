/**
 * Fonte centralizada e determinística de agendamentos do profissional.
 *
 * Usada (a partir da Etapa 2) por T01 (Semana), T02 (Mês), T03 (Detalhes) e T04 (Agendamentos).
 * Formato inspirado no futuro GET /profissionais/:id/agendamentos do backend:
 *   - data_agendamento: 'YYYY-MM-DD'
 *   - horario_agendamento: 'HH:mm:ss'
 *   - status: 'confirmado' | 'concluido' | 'cancelado'
 *
 * Quando o backend estiver pronto, este módulo será substituído por
 * src/lib/profissionalAgendaApi.js mantendo as mesmas assinaturas de funções.
 */

export const PROFISSIONAL = {
  id_profissional: 1,
  nome: 'Dra. Camila Lins',
  email: 'camila@clinica.com',
}

const CLINICA = {
  id_clinica: 1,
  nome: 'Clínica Saúde Ilha do Leite',
}

export const AGENDAMENTOS_PROFISSIONAL = [
  {
    id_agendamento: 1,
    status: 'concluido',
    data_agendamento: '2026-08-15',
    horario_agendamento: '14:00:00',
    Especialidade: { nome: 'Ortopedia' },
    Paciente: {
      id_paciente: 3,
      User: {
        nome: 'Severino Cavalcanti',
        cpf: '333.444.555-66',
        email: 'severino@email.com',
        telefone: '(81) 99999-3333',
        dadosSaude: {
          tipoSanguineo: 'O+',
          alergias: 'Nenhuma conhecida',
          medicamentos: 'Nenhum',
        },
      },
    },
    Clinica: CLINICA,
    PreTriagem: null,
  },
  {
    id_agendamento: 2,
    status: 'confirmado',
    data_agendamento: '2026-09-15',
    horario_agendamento: '08:00:00',
    Especialidade: { nome: 'Ortopedia' },
    Paciente: {
      id_paciente: 1,
      User: {
        nome: 'Maria das Graças Lima',
        cpf: '111.222.333-44',
        email: 'maria.lima@email.com',
        telefone: '(81) 99999-1111',
        dadosSaude: {
          tipoSanguineo: 'A+',
          alergias: 'Dipirona',
          medicamentos: 'Nenhum',
        },
      },
    },
    Clinica: CLINICA,
    PreTriagem: {
      queixa:
        'Lombalgia há 5 dias, intensidade 8/10. Dificuldade para se levantar pela manhã. Possível compressão nervosa lombossacra.',
      duracao: '5 dias',
      intensidade: 8,
      registradoEm: '2026-09-13T10:30:00.000Z',
    },
  },
  {
    id_agendamento: 3,
    status: 'confirmado',
    data_agendamento: '2026-09-15',
    horario_agendamento: '09:00:00',
    Especialidade: { nome: 'Ortopedia' },
    Paciente: {
      id_paciente: 2,
      User: {
        nome: 'João Pedro Alves',
        cpf: '222.333.444-55',
        email: 'joao.alves@email.com',
        telefone: '(81) 99999-2222',
        dadosSaude: {
          tipoSanguineo: 'B+',
          alergias: 'Penicilina',
          medicamentos: 'Losartana 50mg',
        },
      },
    },
    Clinica: CLINICA,
    PreTriagem: null,
  },
]

/** Combina data_agendamento + horario_agendamento em ISO local único. */
export function toDataHora(agendamento) {
  return new Date(
    `${agendamento.data_agendamento}T${agendamento.horario_agendamento}`,
  ).toISOString()
}

/** Retorna todos os agendamentos do profissional (cópia defensiva). */
export async function listarAgendamentosProfissional() {
  return [...AGENDAMENTOS_PROFISSIONAL]
}

/** Busca um agendamento pelo id estável (rota /profissional/consulta/:id). */
export async function obterAgendamentoPorId(id) {
  return (
    AGENDAMENTOS_PROFISSIONAL.find(
      (a) => String(a.id_agendamento) === String(id),
    ) ?? null
  )
}

/** Agendamentos dentro de um período [inicio, fim] — aceita 'YYYY-MM-DD' ou Date (inclusive). */
export async function listarAgendamentosPorPeriodo(inicio, fim) {
  const inicioStr = typeof inicio === 'string' ? inicio : toISODate(inicio)
  const fimStr = typeof fim === 'string' ? fim : toISODate(fim)

  return AGENDAMENTOS_PROFISSIONAL.filter(
    (a) => a.data_agendamento >= inicioStr && a.data_agendamento <= fimStr,
  )
}

/** Converte Date para 'YYYY-MM-DD' no fuso local. */
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}