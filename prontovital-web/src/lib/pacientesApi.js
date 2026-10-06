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
 * "GET Perfil" — Não existe endpoint real no backend ainda.
 * Retorna os dados do usuário salvos no localStorage pelo fluxo de cadastro/login.
 *
 * TODO: Integrar quando o backend suportar GET /pacientes/me ou
 *       GET /pacientes/:id_paciente
 */
export async function meuPerfil() {
  // Tentativa futura — quando o backend implementar a rota de perfil:
  // try {
  //   const { data } = await api.get('/pacientes/me')
  //   if (data) { saveLocalPerfil(data); return data }
  // } catch {}
  return getPerfilDinamico()
}

/**
 * Atualizar perfil localmente.
 * Não existe endpoint real no backend (sem PUT/PATCH para paciente).
 *
 * TODO: Integrar quando o backend suportar PATCH /pacientes/:id_paciente
 */
export async function editarPerfil(_id, payload) {
  const atual = getPerfilDinamico()
  const atualizado = {
    ...atual,
    nome: payload.nome ?? atual.nome,
    email: payload.email ?? atual.email,
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
          nome: payload.nome ?? user.nome,
          email: payload.email ?? user.email,
          // TODO: Integrar quando o backend suportar atualização de dadosSaude
          dadosSaude: {
            ...(user.dadosSaude || {}),
            ...(payload.dadosSaude || {}),
          },
        })
      )
    } catch {}
  }

  return atualizado
}

/**
 * Excluir conta.
 * Não existe endpoint real no backend.
 *
 * TODO: Integrar quando o backend suportar DELETE /usuarios/:id_user
 *       ou DELETE /pacientes/:id_paciente
 */
export async function deletarPerfil(_id) {
  // TODO: Integrar quando o backend suportar este endpoint
  localStorage.removeItem(STORAGE_KEY)
  return { mensagem: 'Perfil excluído com sucesso.' }
}
