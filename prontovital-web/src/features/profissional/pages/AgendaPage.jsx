import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { listarDisponibilidade } from '../../../lib/agendaApi'
import { meusAgendamentos } from '../../../lib/agendamentosApi'
import { formatarDataHora } from '../../../shared/utils/formatDate'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const STATUS_COLOR = {
  agendado: 'bg-blue-100 text-blue-700',
  confirmado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
  concluido: 'bg-slate-100 text-slate-600',
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const data = await meusAgendamentos()
        setAgendamentos(data)
      } catch {
        // Mock para visualização sem backend
        setAgendamentos([
          { id: '1', paciente: { nome: 'João Pereira' }, dataHora: new Date().toISOString(), status: 'agendado', especialidade: 'Clínica Geral' },
          { id: '2', paciente: { nome: 'Ana Costa' }, dataHora: new Date(Date.now() + 3600000).toISOString(), status: 'confirmado', especialidade: 'Dermatologia' },
        ])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Minha Agenda</h1>
        <button className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
          + Horário
        </button>
      </div>

      {/* Mini calendário da semana */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex justify-between">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - d.getDay() + i)
            const isHoje = d.toDateString() === new Date().toDateString()
            return (
              <button key={i} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${isHoje ? 'bg-blue-600' : 'hover:bg-slate-50'}`}>
                <span className={`text-[10px] font-medium ${isHoje ? 'text-blue-200' : 'text-slate-400'}`}>{DIAS[i]}</span>
                <span className={`text-sm font-bold ${isHoje ? 'text-white' : 'text-slate-700'}`}>{d.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-600">Consultas do dia</h2>
        {carregando ? (
          <LoadingSpinner size="md" className="py-8" />
        ) : agendamentos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <p className="text-sm text-slate-400">Nenhuma consulta agendada para hoje.</p>
          </div>
        ) : (
          agendamentos.map((ag) => (
            <button
              key={ag.id}
              onClick={() => navigate(`/profissional/consulta/${ag.id}`)}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-blue-200 transition-colors text-left w-full"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-blue-600">
                  {ag.paciente.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{ag.paciente.nome}</p>
                <p className="text-xs text-slate-400">{ag.especialidade} · {formatarDataHora(ag.dataHora)}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[ag.status] || STATUS_COLOR.agendado}`}>
                {ag.status}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
