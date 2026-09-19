import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function ClinicaDashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const nome = usuario?.clinica?.nome || 'Clínica'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">ProntoVital</span>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="text-xs text-slate-400 hover:text-slate-600">Sair</button>
      </header>

      <div className="px-4 py-6 flex flex-col gap-5">
        <div>
          <p className="text-sm text-slate-400">Painel da clínica</p>
          <h1 className="text-xl font-bold text-slate-800">{nome} 🏥</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Profissionais', valor: '0', cor: 'bg-blue-50 text-blue-700' },
            { label: 'Consultas hoje', valor: '0', cor: 'bg-green-50 text-green-700' },
            { label: 'Especialidades', valor: '0', cor: 'bg-purple-50 text-purple-700' },
            { label: 'Avaliação', valor: '—', cor: 'bg-yellow-50 text-yellow-700' },
          ].map((s) => (
            <div key={s.label} className={`${s.cor} rounded-2xl p-4`}>
              <p className="text-2xl font-bold">{s.valor}</p>
              <p className="text-xs font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gerenciar</h3>
          {[
            { label: 'Profissionais da clínica', desc: 'Cadastrar e gerenciar especialistas' },
            { label: 'Agenda da clínica', desc: 'Horários de atendimento disponíveis' },
            { label: 'Consultas agendadas', desc: 'Visualizar todos os agendamentos' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left mb-2 last:mb-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
