import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { meusAgendamentos } from '../../../lib/agendamentosApi'
import { buscarProfissionais } from '../../../lib/profissionaisApi'

export default function VisaoGeralPage() {
  const { usuario } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const [dadosAgendamentos, dadosProfissionais] = await Promise.all([
          meusAgendamentos().catch(() => []),
          buscarProfissionais().catch(() => [])
        ])
        setAgendamentos(dadosAgendamentos)
        setProfissionais(dadosProfissionais)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const totalAgendamentos = agendamentos.length
  const totalConfirmados = agendamentos.filter(a => a.status?.toLowerCase() === 'confirmado' || a.status?.toLowerCase() === 'agendado').length

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-10">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Visão Geral</h2>
        <p className="text-[15px] text-slate-500 mt-1">{usuario?.nome || 'Clínica ProntoVital'}</p>
      </div>

      {/* ── Cards de Estatísticas Realísticas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{totalAgendamentos}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Agendamentos cadastrados</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{profissionais.length}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Médicos no sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{totalConfirmados}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Confirmados</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{totalAgendamentos}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Total de Consultas</p>
          </div>
        </div>

      </div>

      {/* ── Agendamentos Recentes ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Agendamentos no Sistema</h3>
        
        {carregando ? (
          <p className="text-xs text-slate-400">Carregando agendamentos...</p>
        ) : agendamentos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum agendamento cadastrado no momento.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {agendamentos.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    {item.iniciais || 'PV'}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">{item.medico}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{item.especialidade} · {item.dataFormatada}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
