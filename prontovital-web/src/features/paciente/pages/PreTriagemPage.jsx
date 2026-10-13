import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function PreTriagemPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Paciente'

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">

      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Olá, {primeiroNome}
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">Acesse rapidamente seus serviços.</p>
      </div>

      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          ACESSO RÁPIDO
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <button
            onClick={() => navigate('/paciente/clinicas')}
            className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all rounded-2xl p-5 flex items-center gap-4 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Clínicas
            </span>
          </button>

          <button
            onClick={() => navigate('/paciente/profissionais')}
            className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all rounded-2xl p-5 flex items-center gap-4 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Profissionais
            </span>
          </button>

          <button
            onClick={() => navigate('/paciente/agendamentos')}
            className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all rounded-2xl p-5 flex items-center gap-4 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Agendamentos
            </span>
          </button>

          <button
            onClick={() => navigate('/paciente/historico-triagens')}
            className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all rounded-2xl p-5 flex items-center gap-4 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Hist. Triagens
            </span>
          </button>

        </div>
      </div>

    </div>
  )
}
