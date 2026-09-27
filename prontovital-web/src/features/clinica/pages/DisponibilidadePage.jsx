import React, { useState } from 'react'

const MEDICOS_MOCK = [
  { id: 1, nome: 'Dra. Camila Lins' },
  { id: 2, nome: 'Dra. Ana Beatriz Sousa' }
]

const HORARIOS_INICIAIS = [
  { id: 1, medicoId: 2, dia: 'Segunda-feira', inicio: '10:00', fim: '16:00', ativo: true },
  { id: 2, medicoId: 2, dia: 'Terça-feira', inicio: '08:00', fim: '13:00', ativo: true },
  { id: 3, medicoId: 2, dia: 'Quinta-feira', inicio: '14:00', fim: '18:00', ativo: true },
  { id: 4, medicoId: 1, dia: 'Segunda-feira', inicio: '08:00', fim: '12:00', ativo: true },
]

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']

const HORARIOS_OPCOES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', 
  '19:00', '19:30', '20:00'
]

export default function DisponibilidadePage() {
  const [medicoAtivo, setMedicoAtivo] = useState(2) // ID da Dra Ana Beatriz
  const [horarios, setHorarios] = useState(HORARIOS_INICIAIS)
  
  // Form state
  const [formDia, setFormDia] = useState('Segunda-feira')
  const [formInicio, setFormInicio] = useState('08:00')
  const [formFim, setFormFim] = useState('07:00')

  // Modal State
  const [itemParaRemover, setItemParaRemover] = useState(null)

  const medicoSelecionado = MEDICOS_MOCK.find(m => m.id === medicoAtivo)
  const horariosDoMedico = horarios.filter(h => h.medicoId === medicoAtivo)

  function handleAddHorario(e) {
    e.preventDefault()
    const novo = {
      id: Date.now(),
      medicoId: medicoAtivo,
      dia: formDia,
      inicio: formInicio,
      fim: formFim,
      ativo: true
    }
    setHorarios([...horarios, novo])
  }

  function toggleAtivo(id) {
    setHorarios(prev => prev.map(h => 
      h.id === id ? { ...h, ativo: !h.ativo } : h
    ))
  }

  function confirmarRemocao() {
    setHorarios(prev => prev.filter(h => h.id !== itemParaRemover.id))
    setItemParaRemover(null)
  }

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Disponibilidade dos Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">Configure os horários de atendimento de cada médico desta clínica.</p>
      </div>

      {/* ── Seleção de Médicos ── */}
      <div className="flex flex-wrap gap-3 mb-10">
        {MEDICOS_MOCK.map(medico => {
          const isAtivo = medico.id === medicoAtivo
          return (
            <button
              key={medico.id}
              onClick={() => setMedicoAtivo(medico.id)}
              className={`px-5 py-2.5 rounded-full text-[14.5px] font-bold transition-colors border ${
                isAtivo 
                  ? 'bg-[#149983] border-[#149983] text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {medico.nome}
            </button>
          )
        })}
      </div>

      {/* ── Formulário Adicionar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">
          Adicionar horário — {medicoSelecionado?.nome}
        </h3>
        
        <form onSubmit={handleAddHorario} className="flex flex-col md:flex-row items-end gap-4">
          
          <div className="w-full md:w-1/3">
            <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Dia da semana</label>
            <div className="relative">
              <select 
                value={formDia}
                onChange={(e) => setFormDia(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm cursor-pointer pr-10"
              >
                {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Início</label>
            <div className="relative">
              <select 
                value={formInicio}
                onChange={(e) => setFormInicio(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm cursor-pointer pr-10"
              >
                {HORARIOS_OPCOES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Fim</label>
            <div className="relative">
              <select 
                value={formFim}
                onChange={(e) => setFormFim(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm cursor-pointer pr-10"
              >
                {HORARIOS_OPCOES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full md:w-auto mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adicionar horário
          </button>
        </form>
      </div>

      {/* ── Lista de Horários ── */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Horários de {medicoSelecionado?.nome}
        </h3>
        
        <div className="flex flex-col gap-3">
          {horariosDoMedico.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">Nenhum horário cadastrado para este médico.</p>
          ) : (
            horariosDoMedico.map((horario) => (
              <div 
                key={horario.id} 
                className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  horario.ativo ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'
                }`}
              >
                
                <div>
                  <p className={`text-[15px] font-bold ${horario.ativo ? 'text-slate-900' : 'text-slate-500'}`}>
                    {horario.dia}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {horario.inicio} – {horario.fim}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Badge Ativo/Inativo */}
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    horario.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {horario.ativo ? 'Ativo' : 'Inativo'}
                  </span>

                  {/* Toggle Ativar/Desativar */}
                  <button 
                    onClick={() => toggleAtivo(horario.id)}
                    className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 rounded-lg transition-colors"
                  >
                    {horario.ativo ? 'Desativar' : 'Ativar'}
                  </button>

                  {/* Remover */}
                  <button 
                    onClick={() => setItemParaRemover(horario)}
                    className="px-4 py-1.5 border border-red-100 bg-red-50 hover:bg-red-100 text-[13px] font-semibold text-red-600 rounded-lg transition-colors"
                  >
                    Remover
                  </button>
                </div>

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

      {/* ── Modal de Remoção ── */}
      {itemParaRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-[1px] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-[zoomIn_0.2s_ease-out]">
            
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Remover horário?</h3>
            <p className="text-[15px] text-slate-500 mt-2 mb-6 leading-relaxed">
              Tem certeza que deseja remover este horário de {itemParaRemover.dia}? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setItemParaRemover(null)}
                className="flex-1 py-3 px-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarRemocao}
                className="flex-1 py-3 px-4 bg-[#E02424] text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Remover horário
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}
