import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'
import { meusAgendamentos } from '../../../lib/agendamentosApi'

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const nome = usuario?.nome?.split(' ')[0] || 'Paciente'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const [proximaConsulta, setProximaConsulta] = useState(null)
  const [carregandoConsulta, setCarregandoConsulta] = useState(true)

  useEffect(() => {
    async function carregarProximaConsulta() {
      setCarregandoConsulta(true)
      try {
        const agendamentos = await meusAgendamentos()
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        // Filtra agendamentos futuros confirmados e pega o mais próximo
        const futuros = agendamentos
          .filter((a) => {
            if (a.status?.toLowerCase() !== 'confirmado') return false
            if (!a.dataHora) return false
            const dataAg = new Date(a.dataHora)
            return dataAg >= hoje
          })
          .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))

        setProximaConsulta(futuros[0] || null)
      } catch {
        setProximaConsulta(null)
      } finally {
        setCarregandoConsulta(false)
      }
    }
    carregarProximaConsulta()
  }, [])

  const ACOES_RAPIDAS = [
    { label: 'Buscar clínicas', emoji: '🏥', cor: 'from-emerald-50 to-emerald-100 text-emerald-700', rota: '/paciente/clinicas' },
    { label: 'Meus agendamentos', emoji: '📅', cor: 'from-violet-50 to-violet-100 text-violet-700', rota: '/paciente/agendamentos' },
    { label: 'Especialistas', emoji: '🩺', cor: 'from-orange-50 to-orange-100 text-orange-700', rota: '/paciente/profissionais' },
    { label: 'Histórico', emoji: '📋', cor: 'from-slate-50 to-slate-100 text-slate-600', rota: '/paciente/historico-triagens' },
  ]

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      {/* Saudação */}
      <div>
        <p className="text-sm text-slate-400">{saudacao},</p>
        <h1 className="text-xl font-bold text-slate-800">{nome} 👋</h1>
      </div>

      {/* Card de triagem rápida */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">Pré-Triagem</p>
        <h2 className="text-base font-bold mb-3">Sentindo algo?<br />Descreva seus sintomas</h2>
        <button
          onClick={() => navigate('/paciente/pre-triagem')}
          className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Iniciar triagem →
        </button>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {ACOES_RAPIDAS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.rota)}
            className={`bg-gradient-to-br ${item.cor} rounded-2xl p-4 text-left hover:opacity-80 transition-opacity`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm font-semibold mt-2">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Próxima consulta — dados reais da API */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Próxima Consulta</h3>

        {carregandoConsulta ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs text-slate-400">Carregando...</span>
          </div>
        ) : proximaConsulta ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-sm text-blue-600">
              {proximaConsulta.iniciais || 'DR'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{proximaConsulta.medico}</p>
              <p className="text-xs text-slate-400 truncate">
                {proximaConsulta.especialidade} · {proximaConsulta.dataFormatada}
              </p>
            </div>
            <button
              onClick={() => navigate('/paciente/agendamentos')}
              className="text-xs text-blue-600 font-semibold hover:underline shrink-0"
            >
              Ver →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Nenhuma consulta agendada</p>
              <p className="text-xs text-slate-400">Agende sua primeira consulta</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
