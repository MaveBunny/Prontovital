import api from './api'

/** GET /api/clinicas — Listar Clínicas (público/paciente) */
export async function listarClinicas(params = {}) {
  const { data } = await api.get('/api/clinicas', { params })
  return data
}

/** POST /usuarios - Cadastrar Clínica */
export async function cadastrarClinica(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
