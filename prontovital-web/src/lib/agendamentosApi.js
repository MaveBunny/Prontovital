import api from './api'

const STORAGE_KEY = '@prontovital:agendamentos'

export const INITIAL_AGENDAMENTOS = [
  {
    id: '1',
    id_agendamento: 1,
    medico: 'Dr. Rafael Menezes',
    iniciais: 'DR',
    especialidade: 'Cardiologia',
    clinica: 'Centro Médico Boa Viagem',
    dataHora: '2026-09-20T09:30:00',
    dataFormatada: '20/09/2026 · 09:30',
    status: 'Confirmado',
    resumoTriagem:
      'Paciente relata tontura intensa há 3 dias com intensidade 7/10. Histórico de hipertensão e diabetes. Sinais sugestivos de episódio hipertensivo. Recomenda-se avaliação cardiológica prioritária.',
  },
  {
    id: '2',
    id_agendamento: 2,
    medico: 'Dra. Camila Lins',
    iniciais: 'DC',
    especialidade: 'Ortopedia',
    clinica: 'Clínica Saúde Ilha do Leite',
    dataHora: '2026-08-15T14:00:00',
    dataFormatada: '15/08/2026 · 14:00',
    status: 'Concluído',
    resumoTriagem:
      'Dor no joelho direito há 2 semanas, intensidade 5/10. Dificuldade ao subir escadas. Suspeita de condromalácia patelar.',
  },
]

function getLocalAgendamentos() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return INITIAL_AGENDAMENTOS
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AGENDAMENTOS))
  return INITIAL_AGENDAMENTOS
}

function saveLocalAgendamentos(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/** GET /api/agendamentos/meus — Meus Agendamentos (paciente) */
export async function meusAgendamentos() {
  try {
    const { data } = await api
      .get('/agendamentos/meus')
      .catch(() => api.get('/api/agendamentos/meus'))

    if (Array.isArray(data) && data.length > 0) {
      return data.map((a, i) => {
        const d = a.dataHora || a.data_hora ? new Date(a.dataHora || a.data_hora) : new Date()
        const dataFormatada = !isNaN(d.getTime())
          ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          : '20/09/2026 · 09:30'

        return {
          id: String(a.id_agendamento || a.id || i + 1),
          id_agendamento: a.id_agendamento || a.id || i + 1,
          medico: a.profissional?.nome || a.medico || 'Dr. Rafael Menezes',
          iniciais: (a.profissional?.nome || a.medico || 'DR')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
          especialidade: a.especialidade || 'Cardiologia',
          clinica: a.clinica?.nome || a.clinica || 'Centro Médico Boa Viagem',
          dataHora: a.dataHora || a.data_hora,
          dataFormatada,
          status: a.status
            ? a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase()
            : 'Confirmado',
          resumoTriagem:
            a.resumoTriagem ||
            a.resumo_triagem ||
            'Paciente relata sintomas acompanhados pelo assistente virtual ProntoVital.',
        }
      })
    }
    return getLocalAgendamentos()
  } catch {
    return getLocalAgendamentos()
  }
}

/** POST /api/agendamentos — Agendar Consulta (paciente) */
export async function agendarConsulta(payload) {
  try {
    const { data } = await api
      .post('/agendamentos', payload)
      .catch(() => api.post('/api/agendamentos', payload))
    return data
  } catch {
    const list = getLocalAgendamentos()
    const d = payload.dataHora ? new Date(payload.dataHora) : new Date()
    const dataFormatada = !isNaN(d.getTime())
      ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      : 'Hoje · 10:00'

    const novo = {
      id: String(Date.now()),
      id_agendamento: Date.now(),
      medico: payload.medicoNome || 'Dr. Médico ProntoVital',
      iniciais: (payload.medicoNome || 'DR')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      especialidade: payload.especialidade || 'Clínica Geral',
      clinica: payload.clinicaNome || 'Clínica Saúde Total',
      dataHora: payload.dataHora || new Date().toISOString(),
      dataFormatada,
      status: 'Confirmado',
      resumoTriagem:
        payload.resumoTriagem ||
        'Consulta agendada diretamente pelo paciente via plataforma ProntoVital.',
    }
    const atualizados = [novo, ...list]
    saveLocalAgendamentos(atualizados)
    return novo
  }
}

/** PATCH /api/agendamentos/:id/cancelar — Cancelar Consulta */
export async function cancelarConsulta(id) {
  try {
    const { data } = await api
      .patch(`/agendamentos/${id}/cancelar`)
      .catch(() => api.patch(`/api/agendamentos/${id}/cancelar`))
    return data
  } catch {
    const list = getLocalAgendamentos()
    const atualizados = list.map((a) =>
      String(a.id) === String(id) || String(a.id_agendamento) === String(id)
        ? { ...a, status: 'Cancelado' }
        : a
    )
    saveLocalAgendamentos(atualizados)
    return { status: 'Cancelado' }
  }
}
