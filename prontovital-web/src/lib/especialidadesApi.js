import api from './api'

/** GET /api/especialidades — Listar Especialidades (público/paciente) */
export async function listarEspecialidades() {
  const { data } = await api.get('/api/especialidades')
  return data
}

/** POST /api/especialidades — Cadastrar Especialidade (admin) */
export async function cadastrarEspecialidade(payload) {
  const { data } = await api.post('/api/especialidades', payload)
  return data
}
