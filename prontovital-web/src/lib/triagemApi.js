import api from './api'

/** POST /api/triagens — Iniciar Pré-Triagem (paciente) */
export async function iniciarTriagem(payload) {
  const { data } = await api.post('/api/triagens', payload)
  return data
}

/** POST /api/triagens/:id/mensagens — Enviar Mensagem ao Chatbot (paciente) */
export async function enviarMensagem(id, payload) {
  const { data } = await api.post(`/api/triagens/${id}/mensagens`, payload)
  return data
}

/** GET /api/triagens — Histórico de Triagens (paciente) */
export async function historicoTriagens() {
  const { data } = await api.get('/api/triagens')
  return data
}
