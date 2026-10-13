import api from './api'

/**
 * POST /auth/login ou /api/auth/login 
 * @param {{ email: string, senha: string }} credentials
 * @returns {{ token: string, usuario: object }}
 */
export async function login(credentials) {
  try {
    const { data } = await api.post('/auth/login', credentials)

    if (data?.token) {
      const usuarioComEmail = {
        ...data.usuario,
        email: data.usuario?.email || credentials.email
      }
      localStorage.setItem('@prontovital:token', data.token)
      localStorage.setItem('@prontovital:user', JSON.stringify(usuarioComEmail))
      return { ...data, usuario: usuarioComEmail }
    }
    throw new Error('Resposta de login inválida do servidor.')
  } catch (error) {
    throw error
  }
}

/**
 * PATCH /auth/:id/rec-senha
 */
export async function recuperarSenha(id, payload) {
  const { data } = await api
    .patch(`/auth/${id}/rec-senha`, payload)
    .catch(() => api.patch(`/api/auth/${id}/rec-senha`, payload))
  return data
}

export function logout() {
  localStorage.removeItem('@prontovital:token')
  localStorage.removeItem('@prontovital:user')
  localStorage.removeItem('@prontovital:paciente_perfil')
}

export function getToken() {
  return localStorage.getItem('@prontovital:token')
}

export function getUsuarioLocal() {
  const raw = localStorage.getItem('@prontovital:user')
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  return Boolean(getToken())
}
