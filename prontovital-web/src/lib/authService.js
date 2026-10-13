
import api from './api'

export async function login(credentials) {
  const { data } = await api.post('/auth/login', {
    email: credentials.email,
    senha: credentials.senha,
  })

  if (!data?.token || !data?.usuario) {
    throw new Error('A API retornou uma resposta de login inválida.')
  }

  localStorage.setItem('@prontovital:token', data.token)
  localStorage.setItem('@prontovital:user', JSON.stringify(data.usuario))

  return data
}

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
