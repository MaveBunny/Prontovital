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
    // MOCK LOGIN PARA TESTE DO PROTÓTIPO SEM BACKEND
    const mockUser = {
      id: 'admin-123',
      nome: 'Administrador',
      email: 'admin@prontovital.com',
      tipo: 'admin'
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
