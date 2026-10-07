import api from './api'
import { getPerfilDinamico } from './pacientesApi'

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

/** GET /pacientes/:id_paciente/agendamentos — Meus Agendamentos (paciente) */
export async function meusAgendamentos() {
  const perfilLocal = getPerfilDinamico()
  const id_paciente = perfilLocal.id_paciente || perfilLocal.id || 1

  try {
    const { data } = await api.get(`/pacientes/${id_paciente}/agendamentos`)

    if (Array.isArray(data) && data.length > 0) {
      return data.map((a, i) => {
        const medicoNome = a.Profissional?.User?.nome || a.medico || 'Dr. Médico ProntoVital'
        const especialidade = a.Profissional?.Especialidade?.nome || a.especialidade || 'Clínica Geral'
        const clinicaNome = a.Clinica?.User?.nome || a.clinica || 'Clínica ProntoVital'
        
        let dataFormatada = '20/09/2026 · 09:30'
        if (a.data_agendamento && a.horario_agendamento) {
          const [ano, mes, dia] = a.data_agendamento.split('-')
          const horaMin = a.horario_agendamento.substring(0, 5)
          dataFormatada = `${dia}/${mes}/${ano} · ${horaMin}`
        }

        const statusLower = String(a.status || 'confirmado').toLowerCase()
        const statusMap = {
          agendado: 'Confirmado',
          confirmado: 'Confirmado',
          concluido: 'Concluído',
          cancelado: 'Cancelado'
        }

        return {
          id: String(a.id_agendamento || a.id || i + 1),
          id_agendamento: a.id_agendamento || a.id || i + 1,
          medico: medicoNome,
          iniciais: medicoNome
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
          especialidade,
          clinica: clinicaNome,
          dataHora: a.data_agendamento ? `${a.data_agendamento}T${a.horario_agendamento || '09:00:00'}` : new Date().toISOString(),
          dataFormatada,
          status: statusMap[statusLower] || (statusLower.charAt(0).toUpperCase() + statusLower.slice(1)),
          resumoTriagem:
            a.obvervacao ||
            a.observacao ||
            'Consulta agendada diretamente pelo paciente.',
        }
      })
    }
    return getLocalAgendamentos()
  } catch {
    return getLocalAgendamentos()
  }
}

/** POST /profissionais/:id_profissional/agendamentos — Agendar Consulta (paciente) */
export async function agendarConsulta(payload) {
  const perfilLocal = getPerfilDinamico()
  const id_paciente = payload.id_paciente || perfilLocal.id_paciente || perfilLocal.id || 1
  const id_profissional = payload.id_profissional || 1
  const id_clinica = payload.id_clinica || 1

  let data_agendamento = payload.data_agendamento
  let horario_agendamento = payload.horario_agendamento

  if (!data_agendamento && payload.dataHora) {
    const parts = payload.dataHora.split('T')
    data_agendamento = parts[0]
    horario_agendamento = parts[1]?.substring(0, 5) || '09:00'
  }

  const backendBody = {
    id_paciente: Number(id_paciente),
    id_clinica: Number(id_clinica),
    data_agendamento,
    horario_agendamento: horario_agendamento?.length === 5 ? `${horario_agendamento}:00` : horario_agendamento,
    observacao: payload.resumoTriagem || payload.observacao || 'Consulta solicitada via ProntoVital.'
  }

  try {
    const { data } = await api.post(`/profissionais/${id_profissional}/agendamentos`, backendBody)

    const list = getLocalAgendamentos()
    const d = new Date(`${data_agendamento}T${horario_agendamento}:00`)
    const dataFormatada = !isNaN(d.getTime())
      ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      : `${data_agendamento} · ${horario_agendamento}`

    const novo = {
      id: String(data.id_agendamento || Date.now()),
      id_agendamento: data.id_agendamento || Date.now(),
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
      dataHora: `${data_agendamento}T${horario_agendamento}:00`,
      dataFormatada,
      status: 'Confirmado',
      resumoTriagem: backendBody.observacao,
    }

    saveLocalAgendamentos([novo, ...list])
    return novo
  } catch (error) {
    // Caso falhar a requisição remota, lança erro com mensagem do backend
    if (error.response?.data?.erro) {
      throw new Error(error.response.data.erro)
    }
    
    // Fallback local se a API estiver fora do ar
    const list = getLocalAgendamentos()
    const d = new Date(`${data_agendamento}T${horario_agendamento}:00`)
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
      dataHora: `${data_agendamento}T${horario_agendamento}:00`,
      dataFormatada,
      status: 'Confirmado',
      resumoTriagem: backendBody.observacao,
    }
    const atualizados = [novo, ...list]
    saveLocalAgendamentos(atualizados)
    return novo
  }
}

/** PATCH /pacientes/:id_paciente/agendamentos/:id_agendamento/cancelar — Cancelar Consulta */
export async function cancelarConsulta(id_agendamento) {
  const perfilLocal = getPerfilDinamico()
  const id_paciente = perfilLocal.id_paciente || perfilLocal.id || 1

  try {
    const { data } = await api.patch(`/pacientes/${id_paciente}/agendamentos/${id_agendamento}/cancelar`)
    const list = getLocalAgendamentos()
    const atualizados = list.map((a) =>
      String(a.id) === String(id_agendamento) || String(a.id_agendamento) === String(id_agendamento)
        ? { ...a, status: 'Cancelado' }
        : a
    )
    saveLocalAgendamentos(atualizados)
    return data
  } catch {
    const list = getLocalAgendamentos()
    const atualizados = list.map((a) =>
      String(a.id) === String(id_agendamento) || String(a.id_agendamento) === String(id_agendamento)
        ? { ...a, status: 'Cancelado' }
        : a
    )
    saveLocalAgendamentos(atualizados)
    return { status: 'Cancelado' }
  }
}
