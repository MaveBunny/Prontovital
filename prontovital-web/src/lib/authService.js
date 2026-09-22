import api from './api'

/**
 * POST /api/auth/login
 * @param {{ email: string, senha: string }} credentials
 * @returns {{ token: string, usuario: object }}
 */
export async function login(credentials) {
  try {
    const { data } = await api.post('/api/auth/login', credentials)
    localStorage.setItem('@prontovital:token', data.token)
    localStorage.setItem('@prontovital:user', JSON.stringify(data.usuario))
    return data
  } catch (error) {
    if (error.response) {
      throw error
    }
    // Fallback apenas se o backend estiver totalmente offline
    const mockUser = {
      id: 'admin-123',
      nome: 'Administrador (Offline)',
      email: credentials.email || 'admin@prontovital.com',
      tipo: 'paciente'
    }
    localStorage.setItem('@prontovital:token', 'mock-token-123')
    localStorage.setItem('@prontovital:user', JSON.stringify(mockUser))
    return { token: 'mock-token-123', usuario: mockUser }
  }
}

/**
 * PATCH /api/auth/:id/rec-senha
 * @param {string} id
 * @param {{ novaSenha: string }} payload
 */
export async function recuperarSenha(id, payload) {
  const { data } = await api.patch(`/api/auth/${id}/rec-senha`, payload)
  return data
}

export function logout() {
  localStorage.removeItem('@prontovital:token')
  localStorage.removeItem('@prontovital:user')
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
