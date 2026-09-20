import api from './api'

/** GET /api/disponibilidades — Listar Disponibilidade (paciente) */
export async function listarDisponibilidade(params = {}) {
  const { data } = await api.get('/api/disponibilidades', { params })
  return data
}

/** POST /api/disponibilidades — Cadastrar Horário (profissional/admin) */
export async function cadastrarHorario(payload) {
  const { data } = await api.post('/api/disponibilidades', payload)
  return data
}
