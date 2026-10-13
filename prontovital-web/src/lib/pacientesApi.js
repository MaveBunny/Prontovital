import api from './api'

const STORAGE_KEY = '@prontovital:paciente_perfil'


function getIdsLocais() {
  try {
    const raw = localStorage.getItem('@prontovital:user')
    if (!raw) return { id_user: null, id_paciente: null }
    const user = JSON.parse(raw)
    return {
      id_user: user?.id_user || user?.id || null,
      id_paciente:
        user?.id_paciente ||
        user?.Paciente?.id_paciente ||
        user?.paciente?.id_paciente ||
        null,
    }
  } catch {
    return { id_user: null, id_paciente: null }
  }
}

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
      const idUserParsed = parsed.id_user
      const idUserAtual = user?.id_user || user?.id
      if (idUserAtual && idUserParsed === idUserAtual) {
        return parsed
      }
    } catch {}
  }

  return {
    id: user?.id_user || user?.id || null,
    id_user: user?.id_user || user?.id || null,
    id_paciente:
      user?.id_paciente ||
      user?.Paciente?.id_paciente ||
      user?.paciente?.id_paciente ||
      null,
    nome: user?.nome || '',
    email: user?.email || '',
    cpf: user?.Paciente?.cpf || user?.paciente?.cpf || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || '',
    cidade: user?.cidade || '',
    estado: user?.estado || '',
    data_nascimento:
      user?.Paciente?.data_nascimento || user?.paciente?.data_nascimento || '',
    sexo: user?.Paciente?.sexo || user?.paciente?.sexo || '',
    observacoes:
      user?.Paciente?.observacoes || user?.paciente?.observacoes || '',
  }
}

function saveLocalPerfil(perfil) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil))
  } catch {}
}

function normalizarPacienteBackend(data) {
  if (!data) return null
  const user = data.User || data.user || {}
  return {
    id: data.id_user || user.id_user || user.id || null,
    id_user: data.id_user || user.id_user || user.id || null,
    id_paciente: data.id_paciente || null,
    nome: user.nome || data.nome || '',
    email: user.email || data.email || '',
    cpf: data.cpf || '',
    telefone: user.telefone || data.telefone || '',
    endereco: user.endereco || data.endereco || '',
    cidade: user.cidade || data.cidade || '',
    estado: user.estado || data.estado || '',
    data_nascimento: data.data_nascimento
      ? String(data.data_nascimento).split('T')[0]
      : '',
    sexo: data.sexo || '',
    observacoes: data.observacoes || '',
  }
}


export async function cadastrarPaciente(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

export async function meuPerfil() {
  const { id_paciente } = getIdsLocais()
  if (!id_paciente) return getPerfilDinamico()

  try {
    const { data } = await api.get(`/pacientes/${id_paciente}`)
    const normalizado = normalizarPacienteBackend(data)
    if (normalizado) {
      saveLocalPerfil(normalizado)
      return normalizado
    }
  } catch {
  }
  return getPerfilDinamico()
}

export async function editarPerfil(_id, payload = {}) {
  const body = {}
  for (const k of [
    'nome',
    'email',
    'senha',
    'endereco',
    'cidade',
    'estado',
    'telefone',
  ]) {
    if (payload[k] !== undefined && payload[k] !== '') body[k] = payload[k]
  }

  const paciente = {}
  const origem = payload.paciente || payload
  for (const k of ['cpf', 'data_nascimento', 'sexo', 'observacoes']) {
    if (origem[k] !== undefined && origem[k] !== '') paciente[k] = origem[k]
  }
  if (Object.keys(paciente).length > 0) body.paciente = paciente

  try {
    const { data } = await api.patch('/usuarios/perfil', body)
    const normalizado = normalizarPacienteBackend({
      ...data,
      User: data.User || {
        nome: data.nome,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        telefone: data.telefone,
      },
    })
    if (normalizado) {
      saveLocalPerfil(normalizado)
      return normalizado
    }
    return data
  } catch (err) {
    if (!err?.response) {
      const atual = getPerfilDinamico()
      const atualizado = {
        ...atual,
        ...body,
        ...(body.paciente || {}),
      }
      delete atualizado.paciente
      saveLocalPerfil(atualizado)
      return atualizado
    }
    throw err
  }
}

export async function deletarPerfil(_id) {
  try {
    const { data } = await api.patch('/usuarios/perfil/cancelar')
    localStorage.removeItem(STORAGE_KEY)
    return data
  } catch (err) {
    if (!err?.response) {
      localStorage.removeItem(STORAGE_KEY)
      return { mensagem: 'Perfil excluído com sucesso.' }
    }
    throw err
  }
}
