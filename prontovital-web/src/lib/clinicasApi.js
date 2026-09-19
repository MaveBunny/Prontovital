import api from './api'

/** GET /api/clinicas — Listar Clínicas (público/paciente) */
export async function listarClinicas(params = {}) {
  const { data } = await api.get('/api/clinicas', { params })
  return data
}

/** POST /api/clinicas — Cadastrar Clínica (admin) */
export async function cadastrarClinica(payload) {
  const { data } = await api.post('/api/clinicas', payload)
  return data
}
