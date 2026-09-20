import api from './api'

/** POST /api/agendamentos — Agendar Consulta (paciente) */
export async function agendarConsulta(payload) {
  const { data } = await api.post('/api/agendamentos', payload)
  return data
}

/** GET /api/agendamentos/meus — Meus Agendamentos (paciente) */
export async function meusAgendamentos() {
  const { data } = await api.get('/api/agendamentos/meus')
  return data
}

/** PATCH /api/agendamentos/:id/cancelar — Cancelar Consulta (paciente) */
export async function cancelarConsulta(id) {
  const { data } = await api.patch(`/api/agendamentos/${id}/cancelar`)
  return data
}
