import api from './api'

export async function listarClinicas(params = {}) {
  try {
    const [clinicasRes, profsRes] = await Promise.all([
      api.get('/clinicas', { params }).catch(() => api.get('/api/clinicas', { params })),
      api.get('/profissionais').catch(() => ({ data: [] }))
    ])
    const data = clinicasRes.data
    const profs = Array.isArray(profsRes?.data) ? profsRes.data : []

    const contagemPorClinica = {}
    profs.forEach((p) => {
      if (Array.isArray(p.Clinicas)) {
        p.Clinicas.forEach((cl) => {
          const idCl = String(cl.id_clinica)
          contagemPorClinica[idCl] = (contagemPorClinica[idCl] || 0) + 1
        })
      }
    })

    if (Array.isArray(data)) {
      return data.map((c, index) => {
        const idClinica = c.id_clinica || c.id || index + 1
        const total = contagemPorClinica[String(idClinica)] ?? (c.totalProfissionais || 0)

        return {
          id: idClinica,
          id_clinica: idClinica,
          nome: c.User?.nome || c.nome || 'Clínica sem nome',
          bairro: c.bairro || 'Centro',
          endereco: c.User?.endereco || c.endereco || 'Endereço não informado',
          telefone: c.User?.telefone || c.telefone || '',
          especialidades: c.especialidades || ['Clínica Geral'],
          totalProfissionais: total,
          cidade: c.User?.cidade || c.cidade || 'Recife',
          estado: c.User?.estado || c.estado || 'PE',
        }
      })
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
