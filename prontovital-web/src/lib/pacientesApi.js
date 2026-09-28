import api from './api'

const STORAGE_KEY = '@prontovital:paciente_perfil'

export function getPerfilDinamico() {
  const userRaw = localStorage.getItem('@prontovital:user')
  let user = null
  if (userRaw) {
    try {
      user = JSON.parse(userRaw)
    } catch {}
  }

  const storedPerfil = localStorage.getItem(STORAGE_KEY)
  if (storedPerfil) {
    try {
      const parsed = JSON.parse(storedPerfil)
      if (user && parsed.id_user === user.id_user) {
        return parsed
      }
    } catch {}
  }

  return {
    id: user?.id || user?.id_user || '1',
    id_user: user?.id_user || user?.id || 1,
    id_paciente: user?.paciente?.id_paciente || 1,
    nome: user?.nome || 'Severino Cavalcanti',
    email: user?.email || 'severino@email.com',
    cpf: user?.paciente?.cpf || '12345678900',
    telefone: user?.telefone || '(81) 98765-4321',
    endereco: user?.endereco || 'Rua das Flores, 120',
    cidade: user?.cidade || 'Recife',
    estado: user?.estado || 'PE',
    data_nascimento: user?.paciente?.data_nascimento || '1985-06-15',
    sexo: user?.paciente?.sexo || 'Masculino',
    observacoes: user?.paciente?.observacoes || 'Hipertensão leve controlada. Alergia a dipirona.',
    criadoEm: user?.createdAt || '2026-01-10T10:00:00Z',
    dadosSaude: {
      tipoSanguineo: user?.dadosSaude?.tipoSanguineo || 'A+',
      alergias: user?.dadosSaude?.alergias || 'Dipirona',
      medicamentos: user?.dadosSaude?.medicamentos || '—',
      comorbidades: user?.dadosSaude?.comorbidades || 'Hipertensão, Diabetes Tipo 2',
      observacoes: user?.paciente?.observacoes || 'Hipertensão leve controlada. Alergia a dipirona.',
    },
  }
}

function saveLocalPerfil(perfil) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil))
}

/** POST /usuarios - Cadastrar Paciente */
export async function cadastrarPaciente(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

/** GET /api/pacientes/me — Meu Perfil (paciente logado) */
export async function meuPerfil() {
  try {
    const { data } = await api
      .get('/pacientes/me')
      .catch(() => api.get('/api/pacientes/me'))

    if (data && data.nome) {
      saveLocalPerfil(data)
      return data
    }
    return getPerfilDinamico()
  } catch {
    return getPerfilDinamico()
  }
}

/** PATCH /api/pacientes/:id/editar-perfil */
export async function editarPerfil(id, payload) {
  try {
    const { data } = await api
      .patch(`/pacientes/${id}/editar-perfil`, payload)
      .catch(() => api.patch(`/api/pacientes/${id}/editar-perfil`, payload))
    if (data) {
      saveLocalPerfil(data)
    }
    return data
  } catch {
    const atual = getPerfilDinamico()
    const atualizado = {
      ...atual,
      ...payload,
      dadosSaude: {
        ...atual.dadosSaude,
        ...(payload.dadosSaude || {}),
        observacoes: payload.observacoes || payload.dadosSaude?.observacoes || atual.dadosSaude?.observacoes,
      },
    }
    saveLocalPerfil(atualizado)

    const userRaw = localStorage.getItem('@prontovital:user')
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw)
        localStorage.setItem(
          '@prontovital:user',
          JSON.stringify({ ...user, nome: payload.nome || user.nome, email: payload.email || user.email })
        )
      } catch {}
    }

    return atualizado
  }
}

/** DELETE /api/pacientes/:id/deletar-perfil */
export async function deletarPerfil(id) {
  try {
    const { data } = await api
      .delete(`/pacientes/${id}/deletar-perfil`)
      .catch(() => api.delete(`/api/pacientes/${id}/deletar-perfil`))
    localStorage.removeItem(STORAGE_KEY)
    return data
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { mensagem: 'Perfil excluído com sucesso.' }
  }
}
