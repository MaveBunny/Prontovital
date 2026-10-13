import api from './api'

const STORAGE_KEY = '@prontovital:triagens'

function getLocalTriagens() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
          : new Date().toLocaleDateString('pt-BR')

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

export async function enviarMensagem(id, payload) {
  const { data } = await api
    .post(`/triagens/${id}/mensagens`, payload)
    .catch(() => api.post(`/api/triagens/${id}/mensagens`, payload))
  return data
}
