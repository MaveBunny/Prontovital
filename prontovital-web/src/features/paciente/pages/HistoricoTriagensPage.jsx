import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { historicoTriagens, INITIAL_TRIAGENS } from '../../../lib/triagensApi'
import ModalAgendarConsulta from '../components/ModalAgendarConsulta'

export default function HistoricoTriagensPage() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState(INITIAL_TRIAGENS)
  const [expandidoId, setExpandidoId] = useState(null)
  const [carregando, setCarregando] = useState(false)

  // Modal Agendamento
  const [modalAberto, setModalAberto] = useState(false)
  const [triagemSelecionada, setTriagemSelecionada] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const dados = await historicoTriagens()
      if (dados && dados.length > 0) {
        setTriagens(dados)
      }
    } catch {
      setTriagens(INITIAL_TRIAGENS)
    } finally {
      setCarregando(false)
    }
  }

  function toggleExpandir(id) {
    setExpandidoId((prev) => (prev === id ? null : id))
  }

  function handleAgendarComEspecialidade(triagem) {
    setTriagemSelecionada(triagem)
    setModalAberto(true)
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Histórico de Triagens
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Pré-triagens realizadas pelo assistente de IA.
        </p>
      </div>

      {/* ── Lista de Triagens (Acordeão como na Imagem 5) ── */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : triagens.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            📋
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhuma triagem registrada</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Você ainda não realizou nenhuma pré-triagem com nosso assistente de IA.
          </p>
          <button
            onClick={() => navigate('/paciente/pre-triagem')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Iniciar Pré-Triagem Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {triagens.map((item) => {
            const isAberto = expandidoId === item.id
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Linha Principal Clicável (Header do Card) */}
                <button
                  onClick={() => toggleExpandir(item.id)}
                  className="w-full p-6 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-slate-50/50"
                >
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900 leading-snug">
                      {item.sintomas}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {item.especialidadeSugerida || 'Clínica Geral'} · {item.dataFormatada}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                    {isAberto ? '−' : '+'}
                  </div>
                </button>

                {/* Conteúdo Expandido com Detalhes da IA */}
                {isAberto && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 animate-[fadeIn_0.2s_ease-out] space-y-4">
                    
                    {/* Dados Básicos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Duração Informada
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                          {item.duracao || 'Recente'}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Intensidade
                        </span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                          {item.intensidade || 5} / 10
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Especialidade Recomendada
                        </span>
                        <span className="text-xs font-bold text-blue-600 mt-0.5 block">
                          {item.especialidadeSugerida || 'Clínica Geral'}
                        </span>
                      </div>
                    </div>

                    {/* Resumo da IA */}
                    <div className="bg-sky-50/60 border border-sky-100/80 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 tracking-wider mb-1.5">
                        <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        <span>SÍNTESE MÉDICA DA IA</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {item.resumoIA}
                      </p>
                    </div>

                    {/* Botão de Agendamento Rápido com a Especialidade */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleAgendarComEspecialidade(item)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Agendar com {item.especialidadeSugerida || 'Especialista'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de Agendamento ── */}
      {modalAberto && (
        <ModalAgendarConsulta
          aberto={modalAberto}
          onFechar={() => {
            setModalAberto(false)
            setTriagemSelecionada(null)
          }}
          especialidadePreSelecionada={triagemSelecionada?.especialidadeSugerida || 'Clínica Geral'}
          resumoTriagemInicial={triagemSelecionada?.resumoIA || ''}
          onSucesso={() => navigate('/paciente/agendamentos')}
        />
      )}

    </div>
  )
}
