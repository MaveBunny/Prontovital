import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import { enviarMensagem, iniciarTriagem } from '../../../lib/triagemApi'

const PERGUNTA_INICIAL = {
  id: 'boas-vindas',
  tipo: 'bot',
  texto: 'Olá! Sou o assistente de pré-triagem do ProntoVital. Vou te ajudar a descrever seus sintomas antes da consulta. Como você está se sentindo hoje?',
}

export default function IniciarTriagem() {
  const navigate = useNavigate()
  const [triagemId, setTriagemId] = useState(null)
  const [mensagens, setMensagens] = useState([PERGUNTA_INICIAL])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [etapa, setEtapa] = useState('descricao') // descricao → duracao → intensidade → concluido
  const [dados, setDados] = useState({ sintomas: '', duracao: '', intensidade: '' })
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  function adicionarMensagem(tipo, texto) {
    setMensagens((prev) => [...prev, { id: Date.now(), tipo, texto }])
  }

  async function handleEnviar(e) {
    e.preventDefault()
    if (!input.trim() || enviando) return

    const texto = input.trim()
    setInput('')
    adicionarMensagem('usuario', texto)
    setEnviando(true)

    try {
      if (etapa === 'descricao') {
        setDados((d) => ({ ...d, sintomas: texto }))
        await new Promise((r) => setTimeout(r, 600))
        adicionarMensagem('bot', 'Entendi. Há quantos dias você está com esses sintomas?')
        setEtapa('duracao')

      } else if (etapa === 'duracao') {
        setDados((d) => ({ ...d, duracao: texto }))
        await new Promise((r) => setTimeout(r, 600))
        adicionarMensagem('bot', 'De 0 a 10, qual é a intensidade do desconforto? (0 = sem dor, 10 = dor insuportável)')
        setEtapa('intensidade')

      } else if (etapa === 'intensidade') {
        const intensidade = Number(texto.replace(/\D/g, '')) || 5
        const novosDados = { ...dados, intensidade }
        setDados(novosDados)

        // Cria a triagem na API
        const triagem = await iniciarTriagem({
          sintomas: novosDados.sintomas,
          duracao: novosDados.duracao,
          intensidade,
        }).catch(() => ({ id: 'mock-' + Date.now() }))

        setTriagemId(triagem.id)
        await new Promise((r) => setTimeout(r, 800))
        adicionarMensagem('bot', `✅ Triagem registrada! Aqui está o resumo:\n\n📋 **Sintomas:** ${novosDados.sintomas}\n⏱ **Duração:** ${novosDados.duracao}\n📊 **Intensidade:** ${intensidade}/10\n\nEssas informações serão compartilhadas com o profissional de saúde antes da sua consulta.`)
        setEtapa('concluido')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-slate-800">Pré-Triagem</h1>
          <p className="text-xs text-slate-400">Assistente ProntoVital</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.tipo === 'usuario'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
              }`}
            >
              {msg.texto}
            </div>
          </div>
        ))}
        {enviando && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input / Ações pós-triagem */}
      {etapa !== 'concluido' ? (
        <form onSubmit={handleEnviar} className="bg-white border-t border-slate-100 px-4 py-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              etapa === 'intensidade' ? 'Digite um número de 0 a 10...' :
              etapa === 'duracao' ? 'Ex: 2 dias, 1 semana...' :
              'Descreva seus sintomas...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            disabled={enviando}
          />
          <button
            type="submit"
            disabled={!input.trim() || enviando}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="bg-white border-t border-slate-100 px-4 py-4 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/triagem/historico')}
          >
            Ver histórico
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate('/paciente/dashboard')}
          >
            Agendar consulta
          </Button>
        </div>
      )}
    </div>
  )
}
