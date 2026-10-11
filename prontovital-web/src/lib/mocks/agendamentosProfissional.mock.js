/**
 * Fonte centralizada e determinística de agendamentos do profissional.
 *
 * Usada por T01 (Semana), T02 (Mês), T03 (Detalhes) e T04 (Agendamentos).
 * Formato inspirado no futuro GET /profissionais/:id/agendamentos do backend.
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
        nome: 'Joao Pedro Alves',
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

export function toDataHora(agendamento) {
  return new Date(
    `${agendamento.data_agendamento}T${agendamento.horario_agendamento}`,
  ).toISOString()
}

export async function listarAgendamentosProfissional() {
  return [...AGENDAMENTOS_PROFISSIONAL]
}

export async function obterAgendamentoPorId(id) {
  return (
    AGENDAMENTOS_PROFISSIONAL.find(
      (a) => String(a.id_agendamento) === String(id),
    ) ?? null
  )
}

export async function listarAgendamentosPorPeriodo(inicio, fim) {
  const inicioStr = typeof inicio === 'string' ? inicio : toISODate(inicio)
  const fimStr = typeof fim === 'string' ? fim : toISODate(fim)

  return AGENDAMENTOS_PROFISSIONAL.filter(
    (a) => a.data_agendamento >= inicioStr && a.data_agendamento <= fimStr,
  )
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}
