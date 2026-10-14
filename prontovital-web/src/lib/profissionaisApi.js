import api from './api'

export const LISTA_ESPECIALIDADES_PADRAO = [
  { id_especialidade: 1, nome: 'Clínica Geral' },
  { id_especialidade: 2, nome: 'Pediatria' },
  { id_especialidade: 3, nome: 'Ginecologia e Obstetrícia' },
  { id_especialidade: 4, nome: 'Ortopedia e Traumatologia' },
  { id_especialidade: 5, nome: 'Cardiologia' },
  { id_especialidade: 6, nome: 'Oftalmologia' },
  { id_especialidade: 7, nome: 'Otorrinolaringologia' },
  { id_especialidade: 8, nome: 'Dermatologia' },
  { id_especialidade: 9, nome: 'Gastroenterologia' },
  { id_especialidade: 10, nome: 'Endocrinologia' },
  { id_especialidade: 11, nome: 'Neurologia' },
  { id_especialidade: 12, nome: 'Psiquiatria' },
  { id_especialidade: 13, nome: 'Psicologia' },
  { id_especialidade: 14, nome: 'Urologia' },
  { id_especialidade: 15, nome: 'Odontologia' },
]

export async function listarEspecialidades() {
  try {
    const { data } = await api.get('/especialidades')
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    console.warn('Usando lista padrão de especialidades:', err)
  }
  return LISTA_ESPECIALIDADES_PADRAO
}

export async function vincularEspecialidade(idProfissional, idEspecialidade) {
  const { data } = await api.patch(
    `/profissionais/${idProfissional}/especialidade/${idEspecialidade}`
  )
  return data
}

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

      const espNome = p.Especialidade?.nome || p.especialidade || 'Sem especialidade vinculada'
      const idEsp = p.Especialidade?.id_especialidade || p.id_especialidade || null

      return {
        id: p.id_profissional || p.id || idx + 1,
        id_profissional: p.id_profissional || p.id,
        nome,
        iniciais,
        id_especialidade: idEsp,
        especialidade: espNome,
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
