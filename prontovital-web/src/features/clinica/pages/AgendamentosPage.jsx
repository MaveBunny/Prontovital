import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

export default function AgendamentosPage() {
  const { usuario } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [modalAberto, setModalAberto] = useState(null) // 'cancelar' | 'remover' | null
  const [itemSelecionado, setItemSelecionado] = useState(null)

  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user

  useEffect(() => {
    carregarAgendamentos()
  }, [idClinica])

  async function carregarAgendamentos() {
    setLoading(true)
    try {
      const { data } = await api.get(`/clinicas/${idClinica}/agendamentos`)
      if (Array.isArray(data)) {
        const formatados = data.map((item) => {
          const nomePaciente = item.Paciente?.User?.nome || 'Paciente'
          const partesNome = nomePaciente.split(' ')
          const iniciais = partesNome.length >= 2 
            ? (partesNome[0][0] + partesNome[1][0]).toUpperCase()
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
            id_agendamento: item.id_agendamento,
            id_paciente: item.id_paciente,
            iniciais,
            paciente: nomePaciente,
            medico: item.Profissional?.User?.nome || 'Médico(a)',
            data: `${dataFormatada} às ${horarioFormatado}`,
            status: statusTexto,
            statusStyle
          }
        })
        setAgendamentos(formatados)
      } else {
        setAgendamentos([])
      }
    } catch (err) {
      console.error('Erro ao buscar agendamentos da clínica:', err)
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }

  function abrirModal(tipo, item) {
    setItemSelecionado(item)
    setModalAberto(tipo)
  }

  function fecharModal() {
    setModalAberto(null)
    setItemSelecionado(null)
  }

  async function handleConfirmarAcao() {
    if (modalAberto === 'remover') {
      setAgendamentos((prev) => prev.filter(a => a.id !== itemSelecionado.id))
    } else if (modalAberto === 'cancelar') {
      try {
        if (itemSelecionado.id_paciente && itemSelecionado.id_agendamento) {
          await api.patch(`/pacientes/${itemSelecionado.id_paciente}/agendamentos/${itemSelecionado.id_agendamento}/cancelar`)
        }
      } catch (cancelErr) {
        console.warn('Erro ao cancelar agendamento na API:', cancelErr)
      }
      setAgendamentos((prev) => prev.map(a => 
        a.id === itemSelecionado.id 
          ? { ...a, status: 'Cancelado', statusStyle: 'bg-red-100 text-red-700' }
          : a
      ))
    }
    fecharModal()
  }

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Agendamentos</h2>
        <p className="text-[15px] text-slate-500 mt-1">Gerencie os agendamentos dos médicos desta clínica.</p>
      </div>

      {/* ── Lista de Agendamentos ── */}
      <div className="flex flex-col gap-4">
        {agendamentos.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Nenhum agendamento encontrado.</p>
        ) : (
          agendamentos.map((item) => (
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

              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.statusStyle}`}>
                  {item.status}
                </span>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => abrirModal('cancelar', item)} 
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Cancelar Agendamento"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <button 
                    onClick={() => abrirModal('remover', item)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remover Agendamento"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Botão flutuante de ajuda */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

      {/* ── Modais ── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-[1px] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-[zoomIn_0.2s_ease-out]">
            
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {modalAberto === 'remover' ? 'Remover agendamento?' : 'Cancelar agendamento?'}
            </h3>
            
            <p className="text-[15px] text-slate-500 mt-2 mb-6 leading-relaxed">
              {modalAberto === 'remover' 
                ? 'Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja cancelar este agendamento?'}
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={fecharModal}
                className="flex-1 py-3 px-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarAcao}
                className="flex-1 py-3 px-4 bg-[#E02424] text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                {modalAberto === 'remover' ? 'Remover agendamento' : 'Confirmar cancelamento'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}
