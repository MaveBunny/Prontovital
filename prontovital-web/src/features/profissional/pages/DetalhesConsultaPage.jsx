import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../../../components/shared/Badge'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { formatarData, formatarDataHora } from '../../../shared/utils/formatDate'

// Mock de consulta para visualização sem backend
const MOCK_CONSULTA = {
  id: '1',
  dataHora: new Date().toISOString(),
  status: 'confirmado',
  especialidade: 'Clínica Geral',
  clinica: { nome: 'Clínica Saúde Total' },
  paciente: {
    nome: 'João Pereira Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    dadosSaude: {
      tipoSanguineo: 'A+',
      alergias: 'Dipirona',
      medicamentos: 'Nenhum',
    },
  },
  triagem: {
    sintomas: 'Dor de cabeça intensa, febre há 2 dias, tontura ao se levantar.',
    duracao: '2 dias',
    intensidade: 7,
    resumoIA: 'Paciente relata cefaleia intensa com duração de 48h associada a febre. Possíveis hipóteses: síndrome gripal, hipertensão arterial ou infecção viral. Recomenda-se avaliação da pressão arterial e hemograma.',
    criadoEm: new Date(Date.now() - 86400000).toISOString(),
  },
}

export default function DetalhesConsultaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [consulta, setConsulta] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Em produção: buscar agendamento por ID + triagem vinculada
    setTimeout(() => {
      setConsulta(MOCK_CONSULTA)
      setCarregando(false)
    }, 600)
  }, [id])

  if (carregando) return <LoadingSpinner size="lg" className="h-screen" />
  if (!consulta) return null

  return (
    <div className="px-4 py-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800">Detalhes da Consulta</h1>
          <p className="text-xs text-slate-400">{formatarDataHora(consulta.dataHora)}</p>
        </div>
        <div className="ml-auto">
          <Badge color={consulta.status === 'confirmado' ? 'green' : consulta.status === 'cancelado' ? 'red' : 'blue'}>
            {consulta.status}
          </Badge>
        </div>
      </div>

      {/* Dados do paciente */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Paciente</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-blue-600">
              {consulta.paciente.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{consulta.paciente.nome}</p>
            <p className="text-xs text-slate-400">{consulta.paciente.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-xs text-slate-400">CPF</span>
            <span className="font-medium text-slate-700">{consulta.paciente.cpf}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-xs text-slate-400">Tipo sanguíneo</span>
            <span className="font-bold text-red-500">🩸 {consulta.paciente.dadosSaude.tipoSanguineo || '—'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-xs text-slate-400">Alergias</span>
            <span className="font-medium text-slate-700">{consulta.paciente.dadosSaude.alergias || '—'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-xs text-slate-400">Medicamentos</span>
            <span className="font-medium text-slate-700">{consulta.paciente.dadosSaude.medicamentos || '—'}</span>
          </div>
        </div>
      </div>

      {/* Triagem — sintomas relatados */}
      {consulta.triagem && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pré-Triagem</h3>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Duração</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{consulta.triagem.duracao}</p>
              </div>
              <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-orange-400">Intensidade</p>
                <p className="text-lg font-bold text-orange-600 mt-0.5">{consulta.triagem.intensidade}/10</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Registrado em</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatarData(consulta.triagem.criadoEm)}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">Sintomas relatados pelo paciente</p>
              <p className="text-sm text-slate-700 leading-relaxed">{consulta.triagem.sintomas}</p>
            </div>
          </div>

          {/* Resumo da IA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest">Resumo da IA</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{consulta.triagem.resumoIA}</p>
          </div>
        </>
      )}
    </div>
  )
}
