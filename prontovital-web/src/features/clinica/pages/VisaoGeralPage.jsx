import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

export default function VisaoGeralPage() {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    hoje: 0,
    medicos: 0,
    confirmados: 0,
    total: 0
  })
  const [recentes, setRecentes] = useState([])

  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user
  const nomeClinica = usuario?.nome || 'Clínica'

  useEffect(() => {
    async function carregarDados() {
      setLoading(true)
      try {
        // 1. Busca agendamentos da clínica
        let agendamentosData = []
        if (idClinica) {
          try {
            const { data } = await api.get(`/clinicas/${idClinica}/agendamentos`)
            if (Array.isArray(data)) {
              agendamentosData = data
            }
          } catch (e) {
            console.error('Erro ao buscar agendamentos:', e)
          }
        }

        // 2. Busca profissionais da clínica
        let totalMedicos = 0
        try {
          const { data: profissionais } = await api.get('/profissionais')
          if (Array.isArray(profissionais)) {
            const vinculados = profissionais.filter((p) =>
              p.Clinicas?.some((c) => String(c.id_clinica) === String(idClinica) || c.User?.nome?.trim() === nomeClinica.trim())
            )
            totalMedicos = vinculados.length
          }
        } catch (e) {
          console.error('Erro ao buscar profissionais:', e)
        }

        // Cálculos
        const hojeIso = new Date().toISOString().split('T')[0]
        const agendamentosHoje = agendamentosData.filter(a => a.data_agendamento === hojeIso).length
        const totalConfirmados = agendamentosData.filter(a => a.status?.toLowerCase() === 'confirmado').length

        setStats({
          hoje: agendamentosHoje,
          medicos: totalMedicos,
          confirmados: totalConfirmados,
          total: agendamentosData.length
        })

        // Formata os mais recentes
        const formatados = agendamentosData.slice(0, 5).map((item) => {
          const nomePaciente = item.Paciente?.User?.nome || 'Paciente'
          const partes = nomePaciente.trim().split(' ')
          const iniciais = partes.length >= 2 
            ? (partes[0][0] + partes[1][0]).toUpperCase()
            : nomePaciente.substring(0, 2).toUpperCase()

          let dataFormatada = item.data_agendamento || ''
          if (dataFormatada.includes('-')) {
            const [ano, mes, dia] = dataFormatada.split('-')
            dataFormatada = `${dia}/${mes}/${ano}`
          }
          const horarioFormatado = item.horario_agendamento?.substring(0, 5) || '--:--'

          const statusNormalizado = item.status?.toLowerCase() || 'confirmado'
          let statusStyle = 'bg-slate-100 text-slate-700'
          let statusTexto = 'Pendente'

          if (statusNormalizado === 'confirmado') {
            statusStyle = 'bg-green-100 text-green-700'
            statusTexto = 'Confirmado'
          } else if (statusNormalizado === 'concluido' || statusNormalizado === 'concluído') {
            statusStyle = 'bg-blue-100 text-blue-700'
            statusTexto = 'Concluído'
          } else if (statusNormalizado === 'cancelado') {
            statusStyle = 'bg-red-100 text-red-700'
            statusTexto = 'Cancelado'
          }

          return {
            id: item.id_agendamento,
            iniciais,
            paciente: nomePaciente,
            medico: item.Profissional?.User?.nome || 'Médico(a)',
            data: `${dataFormatada} às ${horarioFormatado}`,
            status: statusTexto,
            statusStyle
          }
        })

        setRecentes(formatados)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [idClinica, nomeClinica])

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-10">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Visão Geral</h2>
        <p className="text-[15px] text-slate-500 mt-1">{usuario?.nome || 'Clínica'}</p>
      </div>

      {/* ── Cards de Estatísticas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{loading ? '-' : stats.hoje}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Agendamentos hoje</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{loading ? '-' : stats.medicos}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Médicos vinculados</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{loading ? '-' : stats.confirmados}</h3>
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
            <h3 className="text-3xl font-bold text-slate-900 leading-none">{loading ? '-' : stats.total}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">Total no período</p>
          </div>
        </div>

      </div>

      {/* ── Agendamentos Recentes ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Agendamentos Recentes</h3>
        
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-sm text-slate-400 py-4">Carregando agendamentos...</div>
          ) : recentes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center text-sm text-slate-500">
              Nenhum agendamento registrado até o momento.
            </div>
          ) : (
            recentes.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold tracking-wider">{item.iniciais}</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">{item.paciente}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{item.medico} · {item.data}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.statusStyle}`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>
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
