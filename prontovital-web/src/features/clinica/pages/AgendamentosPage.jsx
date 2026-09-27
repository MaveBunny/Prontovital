import React, { useState } from 'react'

const MOCK_AGENDAMENTOS = [
  {
    id: 1,
    iniciais: 'SC',
    paciente: 'Severino Cavalcanti',
    medico: 'Dra. Camila Lins',
    data: '15/08/2026 às 14:00',
    status: 'Concluído',
    statusStyle: 'bg-blue-100 text-blue-700'
  },
  {
    id: 2,
    iniciais: 'MD',
    paciente: 'Maria das Graças Lima',
    medico: 'Dra. Camila Lins',
    data: '15/09/2026 às 08:00',
    status: 'Confirmado',
    statusStyle: 'bg-green-100 text-green-700'
  },
  {
    id: 3,
    iniciais: 'JP',
    paciente: 'João Pedro Alves',
    medico: 'Dra. Camila Lins',
    data: '15/09/2026 às 09:00',
    status: 'Confirmado',
    statusStyle: 'bg-green-100 text-green-700'
  }
]

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState(MOCK_AGENDAMENTOS)
  const [busca, setBusca] = useState('')
  const [filtroMedico, setFiltroMedico] = useState('Todos os médicos')
  const [filtroStatus, setFiltroStatus] = useState('Todos os status')
  
  // Modals state
  const [modalAberto, setModalAberto] = useState(null) // 'cancelar' | 'remover' | null
  const [itemSelecionado, setItemSelecionado] = useState(null)

  function abrirModal(tipo, item) {
    setItemSelecionado(item)
    setModalAberto(tipo)
  }

  function fecharModal() {
    setModalAberto(null)
    setItemSelecionado(null)
  }

  function handleConfirmarAcao() {
    if (modalAberto === 'remover') {
      setAgendamentos((prev) => prev.filter(a => a.id !== itemSelecionado.id))
    } else if (modalAberto === 'cancelar') {
      setAgendamentos((prev) => prev.map(a => 
        a.id === itemSelecionado.id 
          ? { ...a, status: 'Cancelado', statusStyle: 'bg-red-100 text-red-700' }
          : a
      ))
    }
    fecharModal()
  }

  // Filtros aplicados
  const agendamentosFiltrados = agendamentos.filter(item => {
    const matchBusca = item.paciente.toLowerCase().includes(busca.toLowerCase()) || item.medico.toLowerCase().includes(busca.toLowerCase())
    const matchMedico = filtroMedico === 'Todos os médicos' || item.medico === filtroMedico
    const matchStatus = filtroStatus === 'Todos os status' || item.status === filtroStatus
    return matchBusca && matchMedico && matchStatus
  })

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Agendamentos</h2>
        <p className="text-[15px] text-slate-500 mt-1">Gerencie os agendamentos dos médicos desta clínica.</p>
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
          <option value="Dra. Camila Lins">Dra. Camila Lins</option>
        </select>

        {/* Select Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
        >
          <option value="Todos os status">Todos os status</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Pendente">Pendente</option>
          <option value="Concluído">Concluído</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* ── Lista de Agendamentos ── */}
      <div className="flex flex-col gap-4">
        {agendamentosFiltrados.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Nenhum agendamento encontrado.</p>
        ) : (
          agendamentosFiltrados.map((item) => (
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
