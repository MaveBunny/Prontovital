import api from './api'

export function getIdPacienteLocal() {
  try {
    const raw = localStorage.getItem('@prontovital:user')
    if (raw) {
      const user = JSON.parse(raw)
      const id =
        user?.id_paciente ||
        user?.Paciente?.id_paciente ||
        user?.paciente?.id_paciente
      if (id) return Number(id)
    }

    const token = localStorage.getItem('@prontovital:token')
    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload?.id_paciente) return Number(payload.id_paciente)
      }
    }
    return null
  } catch {
    return null
  }
}

export function normalizarAgendamento(a, index = 0) {
  const dataStr = a.data_agendamento
  const horaStr = a.horario_agendamento
  let dataFormatada = '—'
  let dataHoraISO = null

  if (dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    const horaExibicao = horaStr ? horaStr.slice(0, 5) : '00:00'
    dataFormatada = `${dia}/${mes}/${ano} · ${horaExibicao}`
    dataHoraISO = horaStr ? `${dataStr}T${horaStr}` : `${dataStr}T00:00:00`
  }

  const nomeMedico =
    a.Profissional?.User?.nome ||
    a.profissional?.User?.nome ||
    a.medicoNome ||
    'Médico ProntoVital'

  const iniciais = nomeMedico
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'DR'

  const especialidade =
    a.Profissional?.Especialidade?.nome ||
    a.profissional?.Especialidade?.nome ||
    a.especialidade ||
    'Clínica Geral'

  const nomeClinica =
    a.Clinica?.User?.nome ||
    a.clinica?.User?.nome ||
    a.clinicaNome ||
    'Clínica ProntoVital'

  const statusRaw = a.status || 'confirmado'
  const statusNormalizado =
    statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase()

  return {
    id: String(a.id_agendamento || index + 1),
    id_agendamento: a.id_agendamento || index + 1,
    id_profissional: a.id_profissional,
    id_paciente: a.id_paciente,
    id_clinica: a.id_clinica,
    medico: nomeMedico,
    iniciais,
    especialidade,
    clinica: nomeClinica,
    dataHora: dataHoraISO,
    dataFormatada,
    status: statusNormalizado,
    obvervacao:
      a.observacao ||
      a.obvervacao ||
      a.resumoTriagem ||
      'Consulta agendada via plataforma ProntoVital.',
  }
}

export async function meusAgendamentos() {
  const id_paciente = getIdPacienteLocal()

  if (!id_paciente) {
    console.warn('id_paciente não localizado para o paciente autenticado.')
    return []
  }

  try {
    const { data } = await api.get(`/pacientes/${id_paciente}/agendamentos`)

    if (Array.isArray(data)) {
      return data.map((a, i) => normalizarAgendamento(a, i))
    }

    return []
  } catch (error) {
    console.error('Erro ao buscar agendamentos do paciente na API:', error)
    throw error
  }
}

export async function cancelarConsulta(id_agendamento) {
  const id_paciente = getIdPacienteLocal()

  if (!id_paciente) {
    throw new Error('Paciente não autenticado.')
  }

  const { data } = await api.patch(
    `/pacientes/${id_paciente}/agendamentos/${id_agendamento}/cancelar`
  )
  return data
}

export async function agendarConsulta(payload) {
  const id_paciente = getIdPacienteLocal()
  const id_profissional = payload.id_profissional

  if (!id_paciente) {
    throw new Error('Sessão expirada ou paciente não identificado. Por favor, refaça o login.')
  }

  if (!id_profissional) {
    throw new Error('Médico não selecionado.')
  }

  const dataAgendamento =
    payload.data_agendamento || payload.dataHora?.split('T')[0]
  const horarioAgendamento =
    payload.horario_agendamento || payload.dataHora?.split('T')[1]?.slice(0, 5)

  const observacaoFinal =
    payload.observacao || payload.resumoTriagem || payload.obvervacao || null

  if (!payload?.id_clinica) {
    throw new Error('Clínica do atendimento não identificada.')
  }

  const { data } = await api.post(
    `/profissionais/${id_profissional}/agendamentos`,
    {
      id_paciente: Number(id_paciente),
      id_clinica: Number(payload.id_clinica),
      data_agendamento: dataAgendamento,
      horario_agendamento: horarioAgendamento,
      observacao: observacaoFinal,
    }
  )

  return normalizarAgendamento(data, 0)
}
