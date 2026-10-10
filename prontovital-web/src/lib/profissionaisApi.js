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

/** GET /profissionais — Buscar Profissionais */
export async function buscarProfissionais(params = {}) {
  try {
    const { data } = await api.get('/profissionais', { params })
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p, idx) => {
        const nomeMedico = p.User?.nome || p.nome || 'Médico(a)'
        const clinicaNome = p.Clinicas?.[0]?.User?.nome || p.clinica || 'Clínica ProntoVital'
        const clinicaId = p.Clinicas?.[0]?.id_clinica || p.id_clinica || 1
        const especialidadeNome = p.Especialidades?.[0]?.nome || p.Especialidade?.nome || p.especialidade || 'Clínica Geral'

        return {
          id: p.id_profissional || idx + 1,
          id_profissional: p.id_profissional || idx + 1,
          nome: nomeMedico,
          iniciais: nomeMedico
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
          especialidade: especialidadeNome,
          conselho: p.conselho || 'CRM',
          registro: `${p.uf_registro || 'PE'} - ${p.registro_profissional || '00000'}`,
          registro_profissional: p.registro_profissional || '00000',
          uf_registro: p.uf_registro || 'PE',
          clinica: clinicaNome,
          id_clinica: clinicaId,
          telefone: p.User?.telefone || p.telefone || '',
          email: p.User?.email || p.email || '',
        }
      })
    }
    return MOCK_PROFISSIONAIS
  } catch {
    return MOCK_PROFISSIONAIS
  }
}

/** GET /profissionais/:id/disponibilidade?data=YYYY-MM-DD */
export async function consultarDisponibilidadeProfissional(idProfissional, dataIso) {
  try {
    const { data } = await api.get(`/profissionais/${idProfissional}/disponibilidade`, {
      params: { data: dataIso }
    })
    if (Array.isArray(data)) {
      return data
    }
    return []
  } catch {
    return ['08:00', '09:00', '09:30', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15', '17:00']
  }
}

/** POST /usuarios - Cadastrar Profissional */
export async function cadastrarProfissional(payload) {
  const { data } = await api.post('/usuarios', payload)
  return data
}
