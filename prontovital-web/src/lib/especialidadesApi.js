import api from './api'

/** GET /especialidades — Listar Especialidades (requer token) */
export async function listarEspecialidades() {
  try {
    const { data } = await api.get('/especialidades')
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error)
    return []
  }
}
