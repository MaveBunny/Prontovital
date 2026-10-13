import api from './api'

export async function listarClinicas(params = {}) {
  try {
    const { data } = await api.get('/clinicas', { params }).catch(() => api.get('/api/clinicas', { params }))
    if (Array.isArray(data)) {
      return data.map((c, index) => ({
        id: c.id_clinica || c.id || index + 1,
        id_clinica: c.id_clinica || c.id || index + 1,
        nome: c.User?.nome || c.nome || 'Clínica sem nome',
        bairro: c.bairro || 'Centro',
        endereco: c.User?.endereco || c.endereco || 'Endereço não informado',
        telefone: c.User?.telefone || c.telefone || '',
        especialidades: c.especialidades || ['Clínica Geral'],
        totalProfissionais: c.totalProfissionais || 0,
        cidade: c.User?.cidade || c.cidade || 'Recife',
        estado: c.User?.estado || c.estado || 'PE',
      }))
    }
    return []
  } catch (err) {
    throw err
  }
}

export async function cadastrarClinica(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
