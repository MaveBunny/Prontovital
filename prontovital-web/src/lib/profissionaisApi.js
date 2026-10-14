import api from './api'

export async function buscarProfissionais(params = {}) {
  try {
    const { data } = await api.get('/profissionais', { params })
    if (!Array.isArray(data)) return []

    return data.map((p, idx) => {
      const nome = p.User?.nome || p.nome || 'Médico(a)'
      const iniciais = nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'DR'

      const rawClinicas = Array.isArray(p.Clinicas) ? p.Clinicas : []
      const clinicasLista = rawClinicas.map((c) => ({
        id_clinica: c.id_clinica,
        nome: c.User?.nome || c.nome || 'Clínica',
      }))
      const nomesClinicas = clinicasLista.map((c) => c.nome).filter(Boolean)
      const clinicaNome = nomesClinicas.length > 0 ? nomesClinicas.join(', ') : 'Sem clínica vinculada'
      const idClinica = clinicasLista[0]?.id_clinica || p.id_clinica || null

      return {
        id: p.id_profissional || p.id || idx + 1,
        id_profissional: p.id_profissional || p.id,
        nome,
        iniciais,
        especialidade: p.Especialidade?.nome || p.especialidade || 'Clínica Geral',
        conselho: p.conselho || 'CRM',
        registro: p.registro_profissional
          ? `${p.conselho || 'CRM'}: ${p.uf_registro ? p.uf_registro + ' - ' : ''}${p.registro_profissional}`
          : (p.registro || 'Registro não informado'),
        registro_profissional: p.registro_profissional || '',
        uf_registro: p.uf_registro || '',
        clinica: clinicaNome,
        id_clinica: idClinica,
        clinicas: clinicasLista,
        telefone: p.User?.telefone || p.telefone || '',
        email: p.User?.email || p.email || '',
      }
    })
  } catch (error) {
    console.error('Erro ao buscar profissionais da API:', error)
    return []
  }
}

export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
