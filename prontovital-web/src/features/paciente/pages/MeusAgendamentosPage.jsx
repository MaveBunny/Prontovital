import React, { useState, useEffect } from 'react'
import { meusAgendamentos, cancelarConsulta, INITIAL_AGENDAMENTOS } from '../../../lib/agendamentosApi'

const STATUS_TABS = ['Todos', 'Confirmado', 'Concluído', 'Cancelado']

export default function MeusAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState(INITIAL_AGENDAMENTOS)
  const [statusAtivo, setStatusAtivo] = useState('Todos')
  const [carregando, setCarregando] = useState(false)

  // Modal Cancelar
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false)
  const [itemCancelando, setItemCancelando] = useState(null)
  const [salvandoCancelamento, setSalvandoCancelamento] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const dados = await meusAgendamentos()
      if (dados && dados.length > 0) {
        setAgendamentos(dados)
      }
    } catch {
      setAgendamentos(INITIAL_AGENDAMENTOS)
    } finally {
      setCarregando(false)
    }
  }

  const agendamentosFiltrados = agendamentos.filter((a) => {
    if (statusAtivo === 'Todos') return true
    return a.status?.toLowerCase() === statusAtivo.toLowerCase()
  })

  function abrirModalCancelar(item) {
    setItemCancelando(item)
    setModalCancelarAberto(true)
  }

  function fecharModalCancelar() {
    setItemCancelando(null)
    setModalCancelarAberto(false)
  }

  async function handleConfirmarCancelamento() {
    if (!itemCancelando) return
    setSalvandoCancelamento(true)
    try {
      // Usa id_agendamento — campo real retornado pelo backend
      await cancelarConsulta(itemCancelando.id_agendamento)
      setAgendamentos((prev) =>
        prev.map((a) =>
          String(a.id_agendamento) === String(itemCancelando.id_agendamento)
            ? { ...a, status: 'Cancelado' }
            : a
        )
      )
      fecharModalCancelar()
    } finally {
      setSalvandoCancelamento(false)
    }
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-6">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Meus Agendamentos
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Histórico e consultas futuras.
        </p>
      </div>

      {/* ── Status Pills / Tabs (exatamente como na imagem 4) ── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {STATUS_TABS.map((tab) => {
          const ativo = statusAtivo === tab
          return (
            <button
              key={tab}
              onClick={() => setStatusAtivo(tab)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                ativo
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── Lista de Agendamentos ── */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : agendamentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            📅
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhum agendamento encontrado</h4>
          <p className="text-xs text-slate-400 mt-1">
            {statusAtivo !== 'Todos'
              ? `Não há consultas com status "${statusAtivo}".`
              : 'Você ainda não possui consultas agendadas.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {agendamentosFiltrados.map((item) => {
            const isConfirmado = item.status?.toLowerCase() === 'confirmado'
            const isConcluido = item.status?.toLowerCase() === 'concluído'
            const isCancelado = item.status?.toLowerCase() === 'cancelado'

            const badgeBg = isConfirmado
              ? 'bg-emerald-100/70 text-emerald-800'
              : isConcluido
              ? 'bg-blue-100/70 text-blue-800'
              : 'bg-rose-100/70 text-rose-800'

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 transition-all hover:shadow-xs"
              >
                {/* Linha Superior: Médico + Data/Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  
                  {/* Avatar + Info Médico */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
                      {item.iniciais || 'DR'}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                        {item.medico}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.especialidade} — {item.clinica}
                      </p>
                    </div>
                  </div>

                  {/* Data & Status */}
                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {item.dataFormatada}
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold w-fit ${badgeBg}`}>
                      {item.status}
                    </span>
                  </div>

                </div>

                {/* Caixa Azul: Resumo da Triagem (conforme Imagem 4) */}
                <div className="bg-sky-50/60 border border-sky-100/80 rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 tracking-wider mb-1.5">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <span>RESUMO DA TRIAGEM</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {item.resumoTriagem}
                  </p>
                </div>

                {/* Ação: Cancelar Consulta (se confirmado) */}
                {isConfirmado && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => abrirModalCancelar(item)}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar consulta
                    </button>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de Confirmação de Cancelamento ── */}
      {modalCancelarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-[zoomIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold text-slate-900">Cancelar consulta?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Tem certeza que deseja cancelar sua consulta com <span className="font-bold text-slate-700">{itemCancelando?.medico}</span> agendada para <span className="font-bold text-slate-700">{itemCancelando?.dataFormatada}</span>?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={fecharModalCancelar}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmarCancelamento}
                disabled={salvandoCancelamento}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {salvandoCancelamento ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
