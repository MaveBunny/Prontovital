import api from './api'

export const MOCK_CLINICAS = [
  {
    id: 1,
    id_clinica: 1,
    nome: 'Clínica Saúde Ilha do Leite',
    bairro: 'Ilha do Leite',
    endereco: 'Av. Agamenon Magalhães, 4002',
    telefone: '(81) 3333-1111',
    especialidades: ['Ortopedia', 'Neurologia'],
    totalProfissionais: 2,
    cidade: 'Recife',
    estado: 'PE',
  },
  {
    id: 2,
    id_clinica: 2,
    nome: 'Centro Médico Boa Viagem',
    bairro: 'Boa Viagem',
    endereco: 'Av. Conselheiro Aguiar, 2850',
    telefone: '(81) 3333-2222',
    especialidades: ['Cardiologia'],
    totalProfissionais: 1,
    cidade: 'Recife',
    estado: 'PE',
  },
  {
    id: 3,
    id_clinica: 3,
    nome: 'Policlínica Madalena',
    bairro: 'Madalena',
    endereco: 'Rua da Madalena, 775',
    telefone: '(81) 3333-3333',
    especialidades: ['Clínica Geral'],
    totalProfissionais: 1,
    cidade: 'Recife',
    estado: 'PE',
  },
]

/** GET /clinicas — Listar Clínicas */
export async function listarClinicas(busca = '') {
  try {
    const queryParams = typeof busca === 'string' ? (busca ? { busca } : {}) : busca
    const { data } = await api.get('/clinicas', { params: queryParams })
    if (Array.isArray(data) && data.length > 0) {
      return data.map((c, index) => ({
        id: c.id_clinica || index + 1,
        id_clinica: c.id_clinica || index + 1,
        nome: c.User?.nome || c.nome || 'Clínica ProntoVital',
        bairro: c.bairro || 'Centro',
        endereco: c.User?.endereco || c.endereco || 'Endereço não informado',
        telefone: c.User?.telefone || c.telefone || '(81) 3333-0000',
        especialidades: c.especialidades || ['Clínica Geral'],
        totalProfissionais: c.totalProfissionais || 1,
        cidade: c.User?.cidade || c.cidade || 'Recife',
        estado: c.User?.estado || c.estado || 'PE',
      }))
    }
    return MOCK_CLINICAS
  } catch {
    return MOCK_CLINICAS
  }
}

/** POST /usuarios - Cadastrar Clínica */
export async function cadastrarClinica(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
