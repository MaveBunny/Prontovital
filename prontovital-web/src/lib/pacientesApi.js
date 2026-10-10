import api from './api'

const STORAGE_KEY = '@prontovital:paciente_perfil'

// ─── Helpers de localStorage ─────────────────────────────────────────────────

/**
 * Retorna os dados do perfil do paciente a partir do localStorage.
 * Prioridade: perfil salvo > dados do usuário logado > valores padrão.
 *
 * Campos como nome, email, cpf, telefone, endereço vêm diretamente
 * do objeto de usuário retornado pelo POST /usuarios (cadastro).
 *
 * Campos de saúde (tipoSanguineo, alergias, medicamentos, comorbidades)
 * não têm equivalente no backend atual e são mantidos mockados.
 * TODO: Integrar quando o backend suportar estes campos
 */
export function getPerfilDinamico() {
  const userRaw = localStorage.getItem('@prontovital:user')
  let user = null
  if (userRaw) {
    try {
      user = JSON.parse(userRaw)
    } catch {}
  }

  // Tenta retornar perfil já salvo para este usuário específico
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

  // Campos reais disponíveis no backend (retornados pelo POST /usuarios):
  // nome, email, endereco, cidade, estado, telefone (User)
  // cpf, data_nascimento, sexo, observacoes (Paciente)
  return {
    id: user?.id_user || user?.id || null,
    id_user: user?.id_user || user?.id || null,
    id_paciente: user?.Paciente?.id_paciente || user?.paciente?.id_paciente || null,
    nome: user?.nome || '',
    email: user?.email || '',
    cpf: user?.Paciente?.cpf || user?.paciente?.cpf || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || '',
    cidade: user?.cidade || '',
    estado: user?.estado || '',
    data_nascimento: user?.Paciente?.data_nascimento || user?.paciente?.data_nascimento || '',
    sexo: user?.Paciente?.sexo || user?.paciente?.sexo || '',
    // O campo observacoes do modelo Paciente é o mais próximo de um histórico clínico
    observacoes: user?.Paciente?.observacoes || user?.paciente?.observacoes || '',
    dadosSaude: {
      // TODO: Integrar quando o backend suportar este campo
      tipoSanguineo: user?.dadosSaude?.tipoSanguineo || '',
      // TODO: Integrar quando o backend suportar este campo
      alergias: user?.dadosSaude?.alergias || '',
      // TODO: Integrar quando o backend suportar este campo
      medicamentos: user?.dadosSaude?.medicamentos || '',
      // TODO: Integrar quando o backend suportar este campo
      comorbidades: user?.dadosSaude?.comorbidades || '',
    },
  }
}

function saveLocalPerfil(perfil) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil))
  } catch {}
}

// ─── Funções exportadas ───────────────────────────────────────────────────────

/**
 * POST /usuarios — Cadastrar novo Paciente.
 * O backend espera: { perfil: 'paciente', nome, email, senha, endereco,
 *   cidade, estado, telefone, paciente: { cpf, data_nascimento, sexo, observacoes } }
 * Retorna o objeto completo do usuário criado (sem senha).
 */
export async function cadastrarPaciente(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}

/**
 * Normaliza perfil vindo do backend /pacientes/:id_paciente com fallback local
 */
function normalizarPerfilPaciente(data, localPerfil = {}) {
  const user = data.User || data.user || {}
  return {
    ...localPerfil,
    id: data.id_paciente || localPerfil.id,
    id_user: data.id_user || user.id_user || localPerfil.id_user,
    id_paciente: data.id_paciente || localPerfil.id_paciente,
    nome: user.nome || localPerfil.nome,
    email: user.email || localPerfil.email,
    cpf: data.cpf || localPerfil.cpf,
    telefone: user.telefone || localPerfil.telefone,
    endereco: user.endereco || localPerfil.endereco,
    cidade: user.cidade || localPerfil.cidade,
    estado: user.estado || localPerfil.estado,
    data_nascimento: data.data_nascimento || localPerfil.data_nascimento,
    sexo: data.sexo || localPerfil.sexo,
    observacoes: data.observacoes || localPerfil.observacoes,
    dadosSaude: localPerfil.dadosSaude || {
      tipoSanguineo: '',
      alergias: '',
      medicamentos: '',
      comorbidades: '',
    },
  }
}

/**
 * GET /pacientes/:id_paciente — Retorna perfil do paciente do backend
 * com fallback para localStorage se a API não estiver disponível.
 */
export async function meuPerfil() {
  const local = getPerfilDinamico()
  const id_paciente = local.id_paciente

  if (id_paciente) {
    try {
      const { data } = await api.get(`/pacientes/${id_paciente}`)
      if (data) {
        const normalizado = normalizarPerfilPaciente(data, local)
        saveLocalPerfil(normalizado)
        return normalizado
      }
    } catch {
      // Fallback para dados locais
    }
  }

  return local
}

/**
 * PATCH /pacientes/:id_paciente — Atualizar perfil do paciente no backend.
 */
export async function editarPerfil(id, payload) {
  const atual = getPerfilDinamico()
  const id_paciente = id || atual.id_paciente

  let perfilBackend = null
  if (id_paciente) {
    try {
      const { data } = await api.patch(`/pacientes/${id_paciente}`, {
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        endereco: payload.endereco,
        cidade: payload.cidade,
        estado: payload.estado,
        cpf: payload.cpf,
        data_nascimento: payload.data_nascimento,
        sexo: payload.sexo,
        observacoes: payload.observacoes,
      })
      if (data) {
        perfilBackend = data
      }
    } catch {
      // Fallback local se a API falhar
    }
  }

  const atualizado = perfilBackend
    ? normalizarPerfilPaciente(perfilBackend, {
        ...atual,
        dadosSaude: {
          ...atual.dadosSaude,
          ...(payload.dadosSaude || {}),
        },
      })
    : {
        ...atual,
        nome: payload.nome ?? atual.nome,
        email: payload.email ?? atual.email,
        telefone: payload.telefone ?? atual.telefone,
        endereco: payload.endereco ?? atual.endereco,
        cidade: payload.cidade ?? atual.cidade,
        estado: payload.estado ?? atual.estado,
        dadosSaude: {
          ...atual.dadosSaude,
          ...(payload.dadosSaude || {}),
        },
      }

  saveLocalPerfil(atualizado)

  // Atualiza também o objeto de usuário no localStorage para manter sincronia
  const userRaw = localStorage.getItem('@prontovital:user')
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw)
      localStorage.setItem(
        '@prontovital:user',
        JSON.stringify({
          ...user,
          nome: atualizado.nome,
          email: atualizado.email,
          telefone: atualizado.telefone,
          endereco: atualizado.endereco,
          cidade: atualizado.cidade,
          estado: atualizado.estado,
          dadosSaude: atualizado.dadosSaude,
        })
      )
    } catch {}
  }

  return atualizado
}

/**
 * DELETE /pacientes/:id_paciente — Excluir conta do paciente.
 */
export async function deletarPerfil(id) {
  const atual = getPerfilDinamico()
  const id_paciente = id || atual.id_paciente

  if (id_paciente) {
    try {
      await api.delete(`/pacientes/${id_paciente}`)
    } catch {
      // Falha silenciosa: continua para remoção local
    }
  }

  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('@prontovital:token')
  localStorage.removeItem('@prontovital:user')
  return { mensagem: 'Perfil excluído com sucesso.' }
}

