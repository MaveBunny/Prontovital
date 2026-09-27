import React from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'

const MEDICOS_MOCK = [
  {
    id: 1,
    iniciais: 'DC',
    nome: 'Dra. Camila Lins',
    especialidade: 'Ortopedia',
    crm: 'PE-45821',
    status: 'Ativo'
  },
  {
    id: 2,
    iniciais: 'DA',
    nome: 'Dra. Ana Beatriz Sousa',
    especialidade: 'Neurologia',
    crm: 'PE-61234',
    status: 'Ativo'
  }
]

export default function MedicosPage() {
  const { usuario } = useAuth()
  
  // Nome da clínica para exibir no subtítulo
  const nomeClinica = usuario?.nome || 'Clínica Saúde Ilha do Leite'

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Profissionais vinculados a {nomeClinica}.
        </p>
      </div>

      {/* ── Lista de Médicos ── */}
      <div className="flex flex-col gap-4">
        {MEDICOS_MOCK.map((medico) => (
          <div 
            key={medico.id} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between"
          >
            
            <div className="flex items-center gap-4">
              {/* Badge Iniciais */}
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <span className="text-[15px] font-bold tracking-wider">{medico.iniciais}</span>
              </div>
              
              {/* Informações */}
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">{medico.nome}</h3>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  {medico.especialidade} · {medico.crm}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {medico.status}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Botão flutuante de ajuda */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

    </div>
  )
}
