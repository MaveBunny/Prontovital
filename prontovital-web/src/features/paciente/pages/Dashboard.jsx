import { useAuth } from '../../../shared/hooks/useAuth'

export default function Dashboard() {
  const { usuario } = useAuth()
  const nome = usuario?.nome?.split(' ')[0] || 'Paciente'
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

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
        <button className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
          Iniciar triagem →
        </button>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Buscar clínicas', emoji: '🏥', cor: 'from-emerald-50 to-emerald-100 text-emerald-700' },
          { label: 'Meus agendamentos', emoji: '📅', cor: 'from-violet-50 to-violet-100 text-violet-700' },
          { label: 'Especialidades', emoji: '🩺', cor: 'from-orange-50 to-orange-100 text-orange-700' },
          { label: 'Histórico', emoji: '📋', cor: 'from-slate-50 to-slate-100 text-slate-600' },
        ].map((item) => (
          <button
            key={item.label}
            className={`bg-gradient-to-br ${item.cor} rounded-2xl p-4 text-left hover:opacity-80 transition-opacity`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm font-semibold mt-2">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Próxima consulta */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Próxima Consulta</h3>
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
      </div>
    </div>
  )
}
