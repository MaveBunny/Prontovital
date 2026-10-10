import React, { useState, useEffect } from 'react'
import { meusAgendamentos, cancelarConsulta } from '../../../lib/agendamentosApi'
import { buscarProfissionais } from '../../../lib/profissionaisApi'

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([])
  const [medicos, setMedicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroMedico, setFiltroMedico] = useState('Todos os médicos')
  const [filtroStatus, setFiltroStatus] = useState('Todos os status')
  
  // Modals state
  const [modalAberto, setModalAberto] = useState(null) // 'cancelar' | 'remover' | null
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const [dadosAgendamentos, dadosProfissionais] = await Promise.all([
        meusAgendamentos().catch(() => []),
        buscarProfissionais().catch(() => [])
      ])
      setAgendamentos(dadosAgendamentos)
      setMedicos(dadosProfissionais)
    } finally {
      setCarregando(false)
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
    if (!itemSelecionado) return
    setProcessando(true)

    try {
      if (modalAberto === 'cancelar' || modalAberto === 'remover') {
        await cancelarConsulta(itemSelecionado.id_agendamento || itemSelecionado.id)
        setAgendamentos((prev) =>
          prev.map((a) =>
            (a.id === itemSelecionado.id || a.id_agendamento === itemSelecionado.id_agendamento)
              ? { ...a, status: 'Cancelado' }
              : a
          )
        )
      }
    } catch (error) {
      console.error('Erro ao processar agendamento:', error)
    } finally {
      setProcessando(false)
      fecharModal()
    }
  }

  // Filtros aplicados
  const agendamentosFiltrados = agendamentos.filter((item) => {
    const pacienteNome = item.paciente || item.medico || ''
    const medicoNome = item.medico || ''
    const matchBusca = pacienteNome.toLowerCase().includes(busca.toLowerCase()) || medicoNome.toLowerCase().includes(busca.toLowerCase())
    const matchMedico = filtroMedico === 'Todos os médicos' || item.medico === filtroMedico
    const matchStatus = filtroStatus === 'Todos os status' || item.status?.toLowerCase() === filtroStatus.toLowerCase()
    return matchBusca && matchMedico && matchStatus
  })

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Agendamentos</h2>
        <p className="text-[15px] text-slate-500 mt-1">Gerencie os agendamentos registrados no sistema.</p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        
        {/* Input de Busca */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por paciente ou médico..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Select Médico */}
        <select 
          value={filtroMedico}
          onChange={(e) => setFiltroMedico(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
        >
          <option value="Todos os médicos">Todos os médicos</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.nome}>{m.nome}</option>
          ))}
        </select>

        {/* Select Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
        >
          <option value="Todos os status">Todos os status</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Concluído">Concluído</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* ── Lista de Agendamentos ── */}
      <div className="flex flex-col gap-4">
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Nenhum agendamento encontrado.</p>
        ) : (
          agendamentosFiltrados.map((item) => {
            const isCancelado = item.status?.toLowerCase() === 'cancelado'
            const isConcluido = item.status?.toLowerCase() === 'concluído'
            const statusStyle = isCancelado
              ? 'bg-red-100 text-red-700'
              : isConcluido
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold tracking-wider">{item.iniciais || 'PV'}</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">{item.medico}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{item.especialidade || 'Consulta'} · {item.dataFormatada}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle}`}>
                    {item.status}
                  </span>

                  {!isCancelado && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => abrirModal('cancelar', item)} 
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Cancelar Agendamento"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => abrirModal('remover', item)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remover Agendamento"
                      >
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* ── Modais ── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-[zoomIn_0.2s_ease-out]">
            
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {modalAberto === 'remover' ? 'Remover agendamento?' : 'Cancelar agendamento?'}
            </h3>
            
            <p className="text-[15px] text-slate-500 mt-2 mb-6 leading-relaxed">
              {modalAberto === 'remover' 
                ? 'Tem certeza que deseja remover este agendamento no sistema?'
                : 'Tem certeza que deseja cancelar este agendamento?'}
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={fecharModal}
                disabled={processando}
                className="flex-1 py-3 px-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmarAcao}
                disabled={processando}
                className="flex-1 py-3 px-4 bg-[#E02424] text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {processando ? 'Aguarde...' : modalAberto === 'remover' ? 'Remover agendamento' : 'Confirmar cancelamento'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}
