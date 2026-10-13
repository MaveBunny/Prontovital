import api from './api'

export function getIdProfissionalLocal() {
  try {
    const raw = localStorage.getItem('@prontovital:user')
    if (raw) {
      const user = JSON.parse(raw)
      const id = user?.id_profissional || user?.Profissional?.id_profissional
      if (id) return Number(id)
    }
    const token = localStorage.getItem('@prontovital:token')
    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload?.id_profissional) return Number(payload.id_profissional)
      }
    }
    return 1
  } catch {
    return 1
  }
}

export function toDataHora(ag) {
  if (!ag) return new Date().toISOString()
  if (ag.dataHora) return ag.dataHora
  if (ag.data_hora) return ag.data_hora
  if (ag.data_agendamento && ag.horario_agendamento) {
    const hora = String(ag.horario_agendamento).slice(0, 8)
    return `${ag.data_agendamento}T${hora}`
  }
  if (ag.data_agendamento) return `${ag.data_agendamento}T00:00:00`
  return new Date().toISOString()
}

export function toDataAgendamento(ag) {
  if (!ag) return ''
  if (ag.data_agendamento) return String(ag.data_agendamento).slice(0, 10)
  const dh = ag.dataHora || ag.data_hora || toDataHora(ag)
  if (typeof dh === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dh)) return dh.slice(0, 10)
  const d = new Date(dh)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toISODate(d) {
  if (typeof d === 'string') return d.slice(0, 10)
  return d.toISOString().slice(0, 10)
}

export async function listarAgendamentosProfissional() {
  const idProf = getIdProfissionalLocal()
  try {
    const { data } = await api.get(`/profissionais/${idProf}/agendamentos`)
    if (Array.isArray(data)) return data
    return []
  } catch (error) {
    console.error('Erro ao listar agendamentos do profissional:', error)
    return []
  }
}

export async function obterAgendamentoPorId(id) {
  const agendamentos = await listarAgendamentosProfissional()
  return (
    agendamentos.find(
      (a) => String(a.id_agendamento) === String(id) || String(a.id) === String(id)
    ) || null
  )
}

export async function listarAgendamentosPorPeriodo(inicio, fim) {
  const agendamentos = await listarAgendamentosProfissional()
  const dInicio = new Date(inicio)
  const dFim = new Date(fim)
  return agendamentos.filter((a) => {
    const d = new Date(toDataHora(a))
    return d >= dInicio && d <= dFim
  })
}
