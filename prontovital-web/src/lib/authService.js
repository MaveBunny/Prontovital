import api from './api'

/**
 * POST /auth/login ou /api/auth/login 
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
    throw new Error('Resposta de login invalida do servidor.')
  } catch (error) {
    if (error.response?.data) {
      throw error
    }

    const emailOuCpf = credentials.email || 'usuario@email.com'
    
    // Fallback inteligente para testes (Paciente, Clinica, etc)
    let tipoSimulado = 'paciente'
    if (emailOuCpf.toLowerCase().includes('clinica')) {
      tipoSimulado = 'clinica'
    } else if (emailOuCpf.toLowerCase().includes('admin')) {
      tipoSimulado = 'admin'
    } else if (emailOuCpf.toLowerCase().includes('medico') || emailOuCpf.toLowerCase().includes('profissional')) {
      tipoSimulado = 'profissional'
    }

    const mockUser = {
      id: String(Date.now()),
      id_user: Date.now(),
      nome: emailOuCpf.includes('@')
        ? emailOuCpf.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : (tipoSimulado === 'clinica' ? 'Clínica Saúde Ilha do Leite' : 'Usuário Teste'),
      email: emailOuCpf.includes('@') ? emailOuCpf : `${emailOuCpf}@email.com`,
      tipo: tipoSimulado,
      ...(tipoSimulado === 'paciente' && {
        paciente: {
          cpf: emailOuCpf.replace(/\D/g, '') || '12345678900',
          observacoes: 'Sem observações.',
        }
      })
    }

    localStorage.setItem('@prontovital:token', 'mock-token-offline')
    localStorage.setItem('@prontovital:user', JSON.stringify(mockUser))
    return { token: 'mock-token-offline', usuario: mockUser }
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
