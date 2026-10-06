import api from './api'

const STORAGE_KEY = '@prontovital:triagens'

export const INITIAL_TRIAGENS = [
  {
    id: '1',
    id_triagem: 1,
    sintomas: 'Dor de cabeça',
    especialidadeSugerida: 'Neurologia',
    dataFormatada: '08/09/2026',
    criadoEm: '2026-09-08T10:00:00Z',
    duracao: '3 dias',
    intensidade: 6,
    status: 'concluido',
    resumoIA:
      'Paciente relata cefaleia persistente com intensidade moderada a forte. Ausência de sinais de alerta imediatos, mas recomenda-se investigação neurológica eletiva com especialista.',
  },
  {
    id: '2',
    id_triagem: 2,
    sintomas: 'Tontura',
    especialidadeSugerida: 'Neurologia',
    dataFormatada: '22/08/2026',
    criadoEm: '2026-08-22T14:30:00Z',
    duracao: 'Recente',
    intensidade: 7,
    status: 'concluido',
    resumoIA:
      'Episódios de tontura e vertigem postural. Avaliação neurológica e labiríntica recomendada para descarte de vertigem posicional paroxística benigna ou causas centrais.',
  },
]

function getLocalTriagens() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return INITIAL_TRIAGENS
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRIAGENS))
  return INITIAL_TRIAGENS
}

function saveLocalTriagens(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function deduzirEspecialidade(sintoma) {
  const s = String(sintoma || '').toLowerCase()
  if (s.includes('peito') || s.includes('coração') || s.includes('pressão') || s.includes('palpitação')) {
    return 'Cardiologia'
  }
  if (s.includes('cabeça') || s.includes('tontura') || s.includes('desmaio') || s.includes('dormência')) {
    return 'Neurologia'
  }
  if (s.includes('costas') || s.includes('articulaç') || s.includes('joelho') || s.includes('ombro') || s.includes('osso') || s.includes('coluna')) {
    return 'Ortopedia'
  }
  return 'Clínica Geral'
}

/** POST /api/triagens — Iniciar Pré-Triagem (paciente) */
export async function iniciarTriagem(payload) {
  const especialidade = payload.especialidadeSugerida || deduzirEspecialidade(payload.sintomas)
  const resumoGerado =
    payload.resumoIA ||
    `Paciente relata ${payload.sintomas}, com duração de ${payload.duracao || 'poucos dias'} e intensidade ${payload.intensidade || 5}/10. Recomenda-se consulta prioritária com a especialidade de ${especialidade}.`

  try {
    const { data } = await api
      .post('/triagens', { ...payload, resumo_ia: resumoGerado })
      .catch(() => api.post('/api/triagens', { ...payload, resumo_ia: resumoGerado }))

    const formatado = {
      id: String(data.id_triagem || data.id || Date.now()),
      id_triagem: data.id_triagem || data.id || Date.now(),
      sintomas: data.sintomas || payload.sintomas,
      especialidadeSugerida: especialidade,
      dataFormatada: new Date().toLocaleDateString('pt-BR'),
      criadoEm: new Date().toISOString(),
      duracao: data.duracao || payload.duracao || 'Recente',
      intensidade: Number(data.intensidade || payload.intensidade) || 5,
      status: 'concluido',
      resumoIA: data.resumoIA || data.resumo_ia || resumoGerado,
    }

    const list = getLocalTriagens()
    saveLocalTriagens([formatado, ...list])
    return formatado
  } catch {
    const formatado = {
      id: String(Date.now()),
      id_triagem: Date.now(),
      sintomas: payload.sintomas,
      especialidadeSugerida: especialidade,
      dataFormatada: new Date().toLocaleDateString('pt-BR'),
      criadoEm: new Date().toISOString(),
      duracao: payload.duracao || 'Recente',
      intensidade: Number(payload.intensidade) || 5,
      status: 'concluido',
      resumoIA: resumoGerado,
    }
    const list = getLocalTriagens()
    saveLocalTriagens([formatado, ...list])
    return formatado
  }
}

/** GET /api/triagens — Histórico de Triagens (paciente) */
export async function historicoTriagens() {
  try {
    const { data } = await api
      .get('/triagens')
      .catch(() => api.get('/api/triagens'))

    if (Array.isArray(data) && data.length > 0) {
      return data.map((t, idx) => {
        const d = t.criadoEm || t.createdAt ? new Date(t.criadoEm || t.createdAt) : new Date()
        const dataFormatada = !isNaN(d.getTime())
          ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
          : '08/09/2026'

        const especialidade = t.especialidadeSugerida || deduzirEspecialidade(t.sintomas)

        return {
          id: String(t.id_triagem || t.id || idx + 1),
          id_triagem: t.id_triagem || t.id || idx + 1,
          sintomas: t.sintomas || 'Sintoma não especificado',
          especialidadeSugerida: especialidade,
          dataFormatada,
          criadoEm: t.criadoEm || t.createdAt,
          duracao: t.duracao || 'Recente',
          intensidade: Number(t.intensidade) || 5,
          status: t.status || 'concluido',
          resumoIA: t.resumoIA || t.resumo_ia || 'Triagem registrada no sistema.',
        }
      })
    }
    return getLocalTriagens()
  } catch {
    return getLocalTriagens()
  }
}

/** POST /api/triagens/:id/mensagens — Enviar Mensagem ao Chatbot */
export async function enviarMensagem(id, payload) {
  try {
    const { data } = await api
      .post(`/triagens/${id}/mensagens`, payload)
      .catch(() => api.post(`/api/triagens/${id}/mensagens`, payload))
    return data
  } catch {
    return {
      resposta: `Recebemos sua resposta "${payload.mensagem}". Processando diagnóstico com IA...`,
    }
  }
}
