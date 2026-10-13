import api from './api'

/** GET /profissionais — Buscar Profissionais reais da API */
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

      const clinicaObj = p.Clinicas?.[0]
      const clinicaNome = clinicaObj?.User?.nome || p.clinica || 'Clínica ProntoVital'
      const idClinica = clinicaObj?.id_clinica || p.id_clinica || null

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
        telefone: p.User?.telefone || p.telefone || '',
        email: p.User?.email || p.email || '',
      }
    })
  } catch (error) {
    console.error('Erro ao buscar profissionais da API:', error)
    return []
  }
}

/** POST /usuarios - Cadastrar Profissional */
export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
