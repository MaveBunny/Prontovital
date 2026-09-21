import api from './api'

/** GET /api/profissionais — Buscar Profissionais (paciente/admin) */
export async function buscarProfissionais(params = {}) {
  const { data } = await api.get('/api/profissionais', { params })
  return data
}

/** POST /usuarios - Cadastrar Profissional */
export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
