import api from './api'

/**
 * POST /auth/login — endpoint real do backend (prontovital-api/src/routes/authRoutes.js).
 * Entrada: { email, senha } | Saída: { token, usuario: { id, nome, perfil, id_paciente? } }
 * Sem fallback mock: erros do backend são propagados para a UI.
 */
export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials)

  if (data?.token) {
    localStorage.setItem('@prontovital:token', data.token)
    localStorage.setItem('@prontovital:user', JSON.stringify(data.usuario))
    return data
  }
  throw new Error('Resposta de login invalida do servidor.')
}

/*
 * recuperarSenha() — DESABILITADA.
 * Motivo: o backend (prontovital-api) não possui a rota PATCH /auth/:id/rec-senha.
 * Função mantida comentada para histórico, sem disparar chamadas inexistentes.
 *
 * export async function recuperarSenha(id, payload) {
 *   const { data } = await api.patch(`/auth/${id}/rec-senha`, payload)
 *   return data
 * }
 */

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
