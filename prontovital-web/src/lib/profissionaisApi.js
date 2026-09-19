import api from './api'

/** GET /api/profissionais — Buscar Profissionais (paciente/admin) */
export async function buscarProfissionais(params = {}) {
  const { data } = await api.get('/api/profissionais', { params })
  return data
}

/** POST /api/profissionais — Cadastrar Profissional (admin) */
export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/api/profissionais', payload)
  return data
}
