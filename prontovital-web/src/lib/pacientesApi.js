import api from './api'

const STORAGE_KEY = '@prontovital:paciente_perfil'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extrai id_user e id_paciente do usuário logado.
 * Backend POST /auth/login retorna: { id, nome, perfil, id_paciente? }
 * Também suporta formato aninhado Paciente/paciente (compat).
 */
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

/**
 * Retorna perfil a partir do localStorage (fallback offline).
 * Contém SOMENTE campos existentes no backend:
 * User: nome, email, endereco, cidade, estado, telefone
 * Paciente: cpf, data_nascimento (YYYY-MM-DD), sexo, observacoes
 */
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

/**
 * Normaliza GET /pacientes/:id_paciente →
 * { id_paciente, cpf, data_nascimento, sexo, observacoes, id_user,
 *   User: { nome, email, endereco, cidade, estado, telefone } }
 * para o formato plano usado pelas telas.
 */
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

// ─── Funções exportadas ──────────────────────────────────────────────────────

/**
 * POST /usuarios — Cadastrar novo Paciente.
 * Backend espera: { perfil: 'paciente', nome, email, senha, endereco,
 *   cidade, estado, telefone, paciente: { cpf, data_nascimento, sexo, observacoes } }
 */
export async function cadastrarPaciente(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

/**
 * GET /pacientes/:id_paciente — Perfil do paciente (backend real).
 * Auth: perfil "paciente". Fallback: dados locais.
 */
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
    // Backend indisponível — usa cache local
  }
  return getPerfilDinamico()
}

/**
 * PATCH /usuarios/perfil — Atualizar perfil (backend real).
 * Campos User permitidos: nome, email, senha, endereco, cidade, estado, telefone.
 * Campos Paciente permitidos: cpf, data_nascimento, sexo, observacoes.
 * Campos sem equivalente no backend (tipoSanguineo, alergias, etc.) são ignorados.
 */
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
  // Aceita tanto plano quanto aninhado { paciente: {...} }
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
    // Fallback local — mantém compat sem quebrar a UI
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

/**
 * PATCH /usuarios/perfil/cancelar — Cancelar conta (soft delete ativo=false).
 * Sem body. Fallback: limpa cache local.
 */
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
