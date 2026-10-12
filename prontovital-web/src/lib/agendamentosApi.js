import api from './api'

const STORAGE_KEY = '@prontovital:agendamentos'

// Dados legados mantidos apenas para compat de import — NÃO usar como fallback.
// As listagens agora partem de [] e consomem o backend real.
export const INITIAL_AGENDAMENTOS = [
  {
    id: '1',
    id_agendamento: 1,
    medico: 'Dr. Rafael Menezes',
    iniciais: 'RM',
    especialidade: 'Cardiologia',
    clinica: 'Centro Médico Boa Viagem',
    dataHora: '2026-09-20T09:30:00',
    dataFormatada: '20/09/2026 · 09:30',
    status: 'Confirmado',
    obvervacao:
      'Paciente relata tontura intensa há 3 dias com intensidade 7/10. Histórico de hipertensão e diabetes. Sinais sugestivos de episódio hipertensivo. Recomenda-se avaliação cardiológica prioritária.',
  },
  {
    id: '2',
    id_agendamento: 2,
    medico: 'Dra. Camila Lins',
    iniciais: 'CL',
    especialidade: 'Ortopedia',
    clinica: 'Clínica Saúde Ilha do Leite',
    dataHora: '2026-08-15T14:00:00',
    dataFormatada: '15/08/2026 · 14:00',
    status: 'Concluído',
    obvervacao:
      'Dor no joelho direito há 2 semanas, intensidade 5/10. Dificuldade ao subir escadas. Suspeita de condromalácia patelar.',
  },
]

// ─── Helpers de localStorage ────────────────────────────────────────────────

function getLocalAgendamentos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalAgendamentos(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

/**
 * Retorna o id_paciente do usuário autenticado salvo no localStorage.
 * O backend retorna o id_paciente aninhado em usuario.Paciente.id_paciente
 * (ou usuario.paciente.id_paciente dependendo do serializer usado).
 */
function getIdPacienteLocal() {
  try {
    const raw = localStorage.getItem('@prontovital:user')
    if (!raw) return null
    const user = JSON.parse(raw)
    // Suporta tanto casing de chave (Paciente vs paciente)
    return (
      user?.Paciente?.id_paciente ||
      user?.paciente?.id_paciente ||
      user?.id_paciente ||
      null
    )
  } catch {
    return null
  }
}

// ─── Normalização da resposta do backend ────────────────────────────────────

/**
 * Transforma um agendamento retornado pela API no formato esperado
 * pelos componentes do frontend.
 *
 * Estrutura retornada pelo GET /pacientes/:id/agendamentos:
 * {
 *   id_agendamento, status, data_agendamento, horario_agendamento, obvervacao,
 *   Profissional: { id_profissional, User: { nome }, Especialidade: { nome } },
 *   Clinica:      { id_clinica, bairro, User: { nome } }
 * }
 */
function normalizarAgendamento(a, index) {
  // ── Data e horário ──────────────────────────────────────────────────────
  const dataStr = a.data_agendamento     // "YYYY-MM-DD"
  const horaStr = a.horario_agendamento  // "HH:mm:ss"
  let dataFormatada = '—'
  let dataHoraISO = null

  if (dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    const horaExibicao = horaStr ? horaStr.slice(0, 5) : '00:00'
    dataFormatada = `${dia}/${mes}/${ano} · ${horaExibicao}`
    dataHoraISO = horaStr ? `${dataStr}T${horaStr}` : `${dataStr}T00:00:00`
  }

  // ── Nome do médico ──────────────────────────────────────────────────────
  // O backend inclui: Profissional → User → nome
  const nomeMedico =
    a.Profissional?.User?.nome ||
    a.profissional?.User?.nome ||
    a.profissional?.user?.nome ||
    'Médico ProntoVital'

  const iniciais = nomeMedico
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'DR'

  // ── Especialidade ───────────────────────────────────────────────────────
  // O backend inclui: Profissional → Especialidade → nome
  const especialidade =
    a.Profissional?.Especialidade?.nome ||
    a.profissional?.Especialidade?.nome ||
    a.profissional?.especialidade?.nome ||
    'Clínica Geral'

  // ── Nome da clínica ─────────────────────────────────────────────────────
  // O backend inclui: Clinica → User → nome  (+ bairro)
  const nomeClinica =
    a.Clinica?.User?.nome ||
    a.clinica?.User?.nome ||
    a.clinica?.user?.nome ||
    'Clínica ProntoVital'

  // ── Status ─────────────────────────────────────────────────────────────
  // Backend retorna "confirmado" / "cancelado" em minúsculo
  const statusNormalizado = a.status
    ? a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase()
    : 'Confirmado'

  return {
    id: String(a.id_agendamento || index + 1),
    id_agendamento: a.id_agendamento || index + 1,
    medico: nomeMedico,
    iniciais,
    especialidade,
    clinica: nomeClinica,
    dataHora: dataHoraISO,
    dataFormatada,
    status: statusNormalizado,
    // Campo de texto do modelo do backend — grafia exata: "obvervacao".
    // Leitura tolerante: obvervacao (backend) || observacao (alias) || resumoTriagem (legado).
    obvervacao:
      a.obvervacao ||
      a.observacao ||
      a.resumoTriagem ||
      'Consulta agendada via plataforma ProntoVital.',
  }
}

// ─── Funções exportadas ──────────────────────────────────────────────────────

/**
 * GET /pacientes/:id_paciente/agendamentos
 * Retorna todos os agendamentos não-cancelados do paciente logado.
 */
export async function meusAgendamentos() {
  const id_paciente = getIdPacienteLocal()

  if (!id_paciente) {
    return []
  }

  try {
    // Listagem limpa — sem query params de filtro (backend não suporta).
    const { data } = await api.get(`/pacientes/${id_paciente}/agendamentos`)

    if (Array.isArray(data)) {
      const normalizados = data.map((a, i) => normalizarAgendamento(a, i))
      saveLocalAgendamentos(normalizados)
      return normalizados
    }

    return getLocalAgendamentos()
  } catch {
    return getLocalAgendamentos()
  }
}

/**
 * PATCH /pacientes/:id_paciente/agendamentos/:id_agendamento/cancelar
 * Cancela um agendamento do paciente logado.
 */
export async function cancelarConsulta(id_agendamento) {
  const id_paciente = getIdPacienteLocal()

  if (id_paciente) {
    try {
      const { data } = await api.patch(
        `/pacientes/${id_paciente}/agendamentos/${id_agendamento}/cancelar`
      )
      return data
    } catch {
      // Falha silenciosa: atualiza localStorage como fallback
    }
  }

  // Fallback local — atualiza o cache do localStorage
  const list = getLocalAgendamentos()
  const atualizados = list.map((a) =>
    String(a.id_agendamento) === String(id_agendamento) ||
    String(a.id) === String(id_agendamento)
      ? { ...a, status: 'Cancelado' }
      : a
  )
  saveLocalAgendamentos(atualizados)
  return { status: 'Cancelado' }
}

/**
 * POST /profissionais/:id_profissional/agendamentos — Criar agendamento
 * Usado pelo ModalAgendarConsulta.
 *
 * TODO: Integrar quando o backend suportar este campo (rota de criação
 * de agendamento pelo paciente diretamente ainda não existe em pacienteRoutes.js)
 */
export async function agendarConsulta(payload) {
  const id_paciente = getIdPacienteLocal()
  const id_profissional = payload.id_profissional

  if (id_profissional && id_paciente) {
    try {
      const dataAgendamento =
        payload.dataHora?.split('T')[0] || payload.data_agendamento
      const horarioAgendamento =
        payload.dataHora?.split('T')[1]?.slice(0, 5) || payload.horario_agendamento

      const { data } = await api.post(
        `/profissionais/${id_profissional}/agendamentos`,
        {
          id_paciente,
          id_clinica: payload.id_clinica,
          data_agendamento: dataAgendamento,
          horario_agendamento: horarioAgendamento,
          // Backend documenta "observacao"; modelo físico grava "obvervacao".
          // Enviamos ambos para garantir persistência + exibição.
          observacao: payload.obvervacao || payload.resumoTriagem || payload.observacao || null,
          obvervacao: payload.obvervacao || payload.resumoTriagem || payload.observacao || null,
        }
      )
      return normalizarAgendamento(data, 0)
    } catch {
      // Falha silenciosa: cria agendamento localmente como fallback
    }
  }

  // Fallback local
  const list = getLocalAgendamentos()
  const d = payload.dataHora ? new Date(payload.dataHora) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const dataFormatada = !isNaN(d.getTime())
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
    : 'Hoje · 10:00'

  const novo = {
    id: String(Date.now()),
    id_agendamento: Date.now(),
    medico: payload.medicoNome || 'Dr. Médico ProntoVital',
    iniciais: (payload.medicoNome || 'DR')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
    especialidade: payload.especialidade || 'Clínica Geral',
    clinica: payload.clinicaNome || 'Clínica Saúde Total',
    dataHora: payload.dataHora || new Date().toISOString(),
    dataFormatada,
    status: 'Confirmado',
    obvervacao:
      payload.obvervacao ||
      payload.resumoTriagem ||
      'Consulta agendada diretamente pelo paciente via plataforma ProntoVital.',
  }
  saveLocalAgendamentos([novo, ...list])
  return novo
}
