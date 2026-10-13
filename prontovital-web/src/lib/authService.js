import api from './api'

function extrairToken(data) {
  if (!data || typeof data !== 'object') return null
  return (
    data.token ||
    data.access_token ||
    data.accessToken ||
    data.jwt ||
    data?.dados?.token ||
    null
  )
}

function extrairUsuario(data, fallbackEmail) {
  if (!data || typeof data !== 'object') return null

  const aninhado = data.usuario || data.user || data.User || data.dados?.usuario || data.dados?.user
  if (aninhado && typeof aninhado === 'object') {
    return {
      ...aninhado,
      email: aninhado.email || fallbackEmail || '',
    }
  }

  if (data.perfil || data.tipo || data.role || data.nome || data.id || data.id_user) {
    const { token: _t, access_token: _at, accessToken: _ac, jwt: _j, dados: _d, usuario: _u, user: _usr, ...resto } = data
    return {
      ...resto,
      email: resto.email || fallbackEmail || '',
    }
  }

  return null
}

export async function login(credentials) {
  const loginId = String(credentials?.email ?? credentials?.loginId ?? '').trim()
  const { senha } = credentials || {}

  if (!loginId || !senha) {
    throw new Error('Informe e-mail/CPF e senha.')
  }

  const payload = { email: loginId, senha }
  if (!loginId.includes('@')) {
    const soDigitos = loginId.replace(/\D/g, '')
    if (soDigitos) payload.cpf = soDigitos
  }

  let data
  try {
    ;({ data } = await api.post('/auth/login', payload))
  } catch (error) {
    if (error?.response?.status === 404) {
      ;({ data } = await api.post('/api/auth/login', payload))
    } else {
      throw error
    }
  }

  const token = extrairToken(data)
  const usuario = extrairUsuario(data, loginId.includes('@') ? loginId : undefined)

  if (!token || !usuario) {
    throw new Error('Resposta de login inválida do servidor.')
  }

  localStorage.setItem('@prontovital:token', token)
  localStorage.setItem('@prontovital:user', JSON.stringify(usuario))
  return { ...data, token, usuario }
}

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
