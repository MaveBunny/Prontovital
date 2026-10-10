import api from './api'

/** GET /profissionais/:id/disponibilidade?data=YYYY-MM-DD — Listar slots livres */
export async function consultarDisponibilidade(idProfissional, dataIso) {
  try {
    const { data } = await api.get(`/profissionais/${idProfissional}/disponibilidade`, {
      params: { data: dataIso }
    })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao consultar disponibilidade:', error)
    return []
  }
}

/** GET /clinicas/:id/horarios ou /profissionais/:id/horarios — Consultar horários cadastrados */
export async function consultarHorarios({ id_clinica, id_profissional }) {
  try {
    const url = id_clinica
      ? `/clinicas/${id_clinica}/horarios`
      : `/profissionais/${id_profissional}/horarios`
    const { data } = await api.get(url)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao consultar horários:', error)
    return []
  }
}

/** POST /clinicas/:id/horarios ou /profissionais/:id/horarios — Cadastrar Horários de Atendimento */
export async function criarHorario({ id_clinica, id_profissional, dias_da_semana, horario_abertura, horario_fechamento }) {
  const url = id_clinica
    ? `/clinicas/${id_clinica}/horarios`
    : `/profissionais/${id_profissional}/horarios`
  
  const payload = {
    dias_da_semana: Array.isArray(dias_da_semana) ? dias_da_semana : [dias_da_semana],
    horario_abertura: horario_abertura?.length === 5 ? `${horario_abertura}:00` : horario_abertura,
    horario_fechamento: horario_fechamento?.length === 5 ? `${horario_fechamento}:00` : horario_fechamento,
  }

  const { data } = await api.post(url, payload)
  return data
}
