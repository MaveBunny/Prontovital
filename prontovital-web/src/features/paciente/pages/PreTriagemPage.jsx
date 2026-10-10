import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'
import { iniciarTriagem, deduzirEspecialidade } from '../../../lib/triagensApi'
import ModalAgendarConsulta from '../components/ModalAgendarConsulta'

const SINTOMAS_PADRAO = [
  'Dor de cabeça',
  'Tontura',
  'Dor no peito',
  'Dor nas costas',
  'Febre',
  'Dor nas articulações',
]

const DURACOES_OPCOES = [
  'Há poucas horas',
  'Há 2 ou 3 dias',
  'Há 1 a 2 semanas',
  'Há mais de um mês',
]

export default function PreTriagemPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Severino'

  // Fluxo da Pré-Triagem com IA
  const [passo, setPasso] = useState(1) // 1: Escolha sintoma, 2: Duração & Intensidade, 3: Resultado IA
  const [sintomaSelecionado, setSintomaSelecionado] = useState('')
  const [sintomaCustomizado, setSintomaCustomizado] = useState('')
  const [duracaoSelecionada, setDuracaoSelecionada] = useState('Há 2 ou 3 dias')
  const [intensidade, setIntensidade] = useState(6)
  const [analisando, setAnalisando] = useState(false)
  const [resultadoTriagem, setResultadoTriagem] = useState(null)

  // Modal Agendamento
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false)

  async function handleSelecionarSintoma(sintoma) {
    setSintomaSelecionado(sintoma)
    setPasso(2)
  }

  async function handleConcluirTriagem() {
    setAnalisando(true)
    const sintomaFinal = sintomaSelecionado || sintomaCustomizado || 'Sintomas gerais'
    const especialidade = deduzirEspecialidade(sintomaFinal)

    try {
      const triagem = await iniciarTriagem({
        sintomas: sintomaFinal,
        duracao: duracaoSelecionada,
        intensidade: Number(intensidade),
        especialidadeSugerida: especialidade,
      })
      setResultadoTriagem(triagem)
      setPasso(3)
    } finally {
      setAnalisando(false)
    }
  }

  function handleReiniciar() {
    setPasso(1)
    setSintomaSelecionado('')
    setSintomaCustomizado('')
    setDuracaoSelecionada('Há 2 ou 3 dias')
    setIntensidade(6)
    setResultadoTriagem(null)
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Saudação ── */}
      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Olá, {primeiroNome}
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">Como você está se sentindo hoje?</p>
      </div>

      {/* ── Seção: Acesso Rápido ── */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          ACESSO RÁPIDO
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card Clínicas */}
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

          {/* Card Profissionais */}
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

          {/* Card Agendamentos */}
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

          {/* Card Hist. Triagens */}
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

      {/* ── Seção: Pré-Triagem com IA ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            PRÉ-TRIAGEM COM IA
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Responda às perguntas abaixo. Nossa IA analisa seus sintomas e indica a especialidade ideal.
        </p>

        {/* ── Box do Assistente Inteligente ── */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden max-w-2xl">
          
          {/* Header Barra Escura (Navy) */}
          <div className="bg-[#1B2438] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21Z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight">Assistente ProntoVital</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">Online</span>
            </div>
          </div>

          {/* Conteúdo Interativo do Chat */}
          <div className="p-6 bg-slate-50/50 min-h-[220px]">
            
            {/* ── PASSO 1: Seleção de Sintomas ── */}
            {passo === 1 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
                {/* Balão do Bot */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    IA
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs max-w-md">
                    <p className="text-sm font-semibold text-slate-800">
                      Qual é o seu sintoma principal?
                    </p>
                  </div>
                </div>

                {/* Chips de Sintomas (exatamente como na imagem) */}
                <div className="pl-11 flex flex-wrap gap-2 pt-2">
                  {SINTOMAS_PADRAO.map((sintoma) => (
                    <button
                      key={sintoma}
                      onClick={() => handleSelecionarSintoma(sintoma)}
                      className="px-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      {sintoma}
                    </button>
                  ))}
                </div>

                {/* Campo para sintoma customizado */}
                <div className="pl-11 pt-3 flex gap-2">
                  <input
                    type="text"
                    value={sintomaCustomizado}
                    onChange={(e) => setSintomaCustomizado(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sintomaCustomizado.trim()) {
                        handleSelecionarSintoma(sintomaCustomizado)
                      }
                    }}
                    placeholder="Outro sintoma? Digite aqui..."
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    disabled={!sintomaCustomizado.trim()}
                    onClick={() => handleSelecionarSintoma(sintomaCustomizado)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}

            {/* ── PASSO 2: Detalhes de Duração e Intensidade ── */}
            {passo === 2 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
                {/* Resposta do usuário anterior */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-xs max-w-xs text-xs font-semibold">
                    {sintomaSelecionado || sintomaCustomizado}
                  </div>
                </div>

                {/* Pergunta do Bot */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    IA
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs max-w-md">
                    <p className="text-sm font-semibold text-slate-800">
                      Entendi. Há quanto tempo você percebeu este sintoma e qual a intensidade do incômodo?
                    </p>
                  </div>
                </div>

                {/* Seletores */}
                <div className="pl-11 space-y-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Duração dos sintomas:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURACOES_OPCOES.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setDuracaoSelecionada(dur)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            duracaoSelecionada === dur
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Intensidade da dor/desconforto:
                      </label>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {intensidade} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensidade}
                      onChange={(e) => setIntensidade(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                      <span>1 - Leve</span>
                      <span>5 - Moderada</span>
                      <span>10 - Intensa</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleReiniciar}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-white transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConcluirTriagem}
                      disabled={analisando}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {analisando ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processando com IA...
                        </>
                      ) : (
                        'Analisar e Obter Recomendação →'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PASSO 3: Resultado e Orientação da IA ── */}
            {passo === 3 && resultadoTriagem && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                    IA
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-3 w-full">
                    
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Análise Concluída
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        Especialidade: {resultadoTriagem.especialidadeSugerida}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {resultadoTriagem.resumoIA}
                    </p>

                    <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 text-[11px] text-sky-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <span>
                        Esta triagem é um suporte preliminar e não substitui uma consulta médica formal.
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={() => setModalAgendamentoAberto(true)}
                        className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Agendar Consulta com {resultadoTriagem.especialidadeSugerida}
                      </button>
                      <button
                        onClick={() => navigate('/paciente/profissionais')}
                        className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Ver Profissionais
                      </button>
                      <button
                        onClick={handleReiniciar}
                        className="w-full sm:w-auto px-3 py-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors"
                      >
                        Nova Triagem
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ── Modal de Agendamento ── */}
      {modalAgendamentoAberto && (
        <ModalAgendarConsulta
          aberto={modalAgendamentoAberto}
          onFechar={() => setModalAgendamentoAberto(false)}
          especialidadePreSelecionada={resultadoTriagem?.especialidadeSugerida || 'Clínica Geral'}
          resumoTriagemInicial={resultadoTriagem?.resumoIA || ''}
          onSucesso={() => navigate('/paciente/agendamentos')}
        />
      )}

    </div>
  )
}
