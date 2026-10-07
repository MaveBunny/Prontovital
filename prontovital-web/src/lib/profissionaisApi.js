import api from './api'

export const MOCK_PROFISSIONAIS = [
  {
    id: 1,
    id_profissional: 1,
    nome: 'Dra. Camila Lins',
    iniciais: 'DC',
    especialidade: 'Ortopedia',
    conselho: 'CRM',
    registro: 'PE - 45821',
    registro_profissional: '45821',
    uf_registro: 'PE',
    clinica: 'Clínica Saúde Ilha do Leite',
    id_clinica: 1,
    telefone: '(81) 3333-1111',
    email: 'dra.camila@prontovital.com',
  },
  {
    id: 2,
    id_profissional: 2,
    nome: 'Dr. Rafael Menezes',
    iniciais: 'DR',
    especialidade: 'Cardiologia',
    conselho: 'CRM',
    registro: 'PE - 32100',
    registro_profissional: '32100',
    uf_registro: 'PE',
    clinica: 'Centro Médico Boa Viagem',
    id_clinica: 2,
    telefone: '(81) 3333-2222',
    email: 'dr.rafael@prontovital.com',
  },
  {
    id: 3,
    id_profissional: 3,
    nome: 'Dra. Ana Beatriz Sousa',
    iniciais: 'DA',
    especialidade: 'Neurologia',
    conselho: 'CRM',
    registro: 'PE - 61234',
    registro_profissional: '61234',
    uf_registro: 'PE',
    clinica: 'Clínica Saúde Ilha do Leite',
    id_clinica: 1,
    telefone: '(81) 3333-1111',
    email: 'dra.anabeatriz@prontovital.com',
  },
  {
    id: 4,
    id_profissional: 4,
    nome: 'Dr. Henrique Torres',
    iniciais: 'DH',
    especialidade: 'Clínica Geral',
    conselho: 'CRM',
    registro: 'PE - 28900',
    registro_profissional: '28900',
    uf_registro: 'PE',
    clinica: 'Policlínica Madalena',
    id_clinica: 3,
    telefone: '(81) 3333-3333',
    email: 'dr.henrique@prontovital.com',
  },
]

/** GET /profissionais ou /api/profissionais — Buscar Profissionais */
export async function buscarProfissionais(params = {}) {
  try {
    const { data } = await api.get('/profissionais', { params }).catch(() => api.get('/api/profissionais', { params }))
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p, idx) => ({
        id: p.id_profissional || p.id || idx + 1,
        id_profissional: p.id_profissional || p.id || idx + 1,
        nome: p.User?.nome || p.nome || 'Médico(a)',
        iniciais: (p.User?.nome || p.nome || 'DR')
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        especialidade: p.especialidade || 'Clínica Geral',
        conselho: p.conselho || 'CRM',
        registro: p.registro || `${p.uf_registro || 'PE'} - ${p.registro_profissional || '00000'}`,
        registro_profissional: p.registro_profissional || '00000',
        uf_registro: p.uf_registro || 'PE',
        clinica: p.clinica || 'Clínica ProntoVital',
        id_clinica: p.id_clinica || 1,
        telefone: p.User?.telefone || p.telefone || '',
        email: p.User?.email || p.email || '',
      }))
    }
    return MOCK_PROFISSIONAIS
  } catch {
    return MOCK_PROFISSIONAIS
  }
}

/** POST /usuarios - Cadastrar Profissional */
export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
