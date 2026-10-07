import api from './api'

/**
 * POST /auth/login ou /api/auth/login — Autenticação integrada com PostgreSQL
 * @param {{ email: string, senha: string }} credentials
 * @returns {{ token: string, usuario: object }}
 */
export async function login(credentials) {
  try {
    const payload = {
      email: credentials.email || credentials.loginId,
      senha: credentials.senha,
    }
    const { data } = await api.post('/auth/login', payload)

    if (data?.token) {
      localStorage.setItem('@prontovital:token', data.token)
      const usuarioSalvo = {
        ...data.usuario,
        id_user: data.usuario?.id || data.usuario?.id_user,
        perfil: data.usuario?.perfil || 'paciente',
      }
      localStorage.setItem('@prontovital:user', JSON.stringify(usuarioSalvo))
      return { token: data.token, usuario: usuarioSalvo }
    }
    throw new Error('Resposta de login inválida do servidor.')
  } catch (error) {
    if (error.response?.data) {
      throw error
    }
    throw new Error(error.message || 'Erro de conexão com o servidor de autenticação.')
  }
}

/**
 * PATCH /auth/:id/rec-senha
 * @param {string} id
 * @param {{ novaSenha: string }} payload
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
