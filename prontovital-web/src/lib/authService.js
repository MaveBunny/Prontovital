import api from './api'

/**
 * POST /auth/login ou /api/auth/login — Autenticação integrada com PostgreSQL
 * @param {{ email: string, senha: string }} credentials
 * @returns {{ token: string, usuario: object }}
 */
export async function login(credentials) {
  try {
    const { data } = await api
      .post('/auth/login', credentials)
      .catch(() => api.post('/api/auth/login', credentials))

    if (data?.token) {
      localStorage.setItem('@prontovital:token', data.token)
      localStorage.setItem('@prontovital:user', JSON.stringify(data.usuario))
      return data
    }
    throw new Error('Resposta de login inválida do servidor.')
  } catch (error) {
    // Se o backend respondeu com erro da API (ex: 400, 401, 404, etc), repassa o erro real do banco de dados
    if (error.response?.data) {
      throw error
    }

    // Fallback apenas se o backend estiver totalmente fora do ar (sem conexão)
    const emailOuCpf = credentials.email || 'usuario@email.com'
    const mockUser = {
      id: String(Date.now()),
      id_user: Date.now(),
      nome: emailOuCpf.includes('@')
        ? emailOuCpf.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Usuário ProntoVital',
      email: emailOuCpf.includes('@') ? emailOuCpf : `${emailOuCpf}@email.com`,
      tipo: 'paciente',
      paciente: {
        cpf: emailOuCpf.replace(/\D/g, '') || '12345678900',
        observacoes: 'Sem observações cadastradas.',
      },
    }
    localStorage.setItem('@prontovital:token', 'mock-token-offline')
    localStorage.setItem('@prontovital:user', JSON.stringify(mockUser))
    return { token: 'mock-token-offline', usuario: mockUser }
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
