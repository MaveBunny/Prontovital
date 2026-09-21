import api from './api'

/** POST /usuarios - Cadastrar Paciente */
export async function cadastrarPaciente(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

/** GET /api/pacientes/me — Meu Perfil (paciente logado) */
export async function meuPerfil() {
  const { data } = await api.get('/api/pacientes/me')
  return data
}

/** PATCH /api/pacientes/:id/editar-perfil */
export async function editarPerfil(id, payload) {
  const { data } = await api.patch(`/api/pacientes/${id}/editar-perfil`, payload)
  return data
}

/** DELETE /api/pacientes/:id/deletar-perfil */
export async function deletarPerfil(id) {
  const { data } = await api.delete(`/api/pacientes/${id}/deletar-perfil`)
  return data
}
