import React, { useState } from 'react'
import { agendarConsulta } from '../../../lib/agendamentosApi'
import { MOCK_PROFISSIONAIS } from '../../../lib/profissionaisApi'

const HORARIOS_PADRAO = [
  '08:00', '09:00', '09:30', '10:30', '11:15',
  '14:00', '14:45', '15:30', '16:15', '17:00'
]

export default function ModalAgendarConsulta({
  aberto,
  onFechar,
  medicoPreSelecionado = null,
  especialidadePreSelecionada = '',
  resumoTriagemInicial = '',
  onSucesso = null,
}) {
  const [medicoId, setMedicoId] = useState(
    medicoPreSelecionado?.id || (MOCK_PROFISSIONAIS[0]?.id ?? 1)
  )
  const [dataConsulta, setDataConsulta] = useState(() => {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    return amanha.toISOString().split('T')[0]
  })
  const [horarioSelecionado, setHorarioSelecionado] = useState('09:30')
  const [resumoTriagem, setResumoTriagem] = useState(resumoTriagemInicial)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  if (!aberto) return null

  const medico =
    medicoPreSelecionado ||
    MOCK_PROFISSIONAIS.find((p) => String(p.id) === String(medicoId)) ||
    MOCK_PROFISSIONAIS[0]

  async function handleConfirmar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const dataHoraIso = `${dataConsulta}T${horarioSelecionado}:00`
      await agendarConsulta({
        id_profissional: medico?.id_profissional || medico?.id,
        id_clinica: medico?.id_clinica || 1,
        medicoNome: medico?.nome || 'Dr. Médico ProntoVital',
        especialidade: medico?.especialidade || especialidadePreSelecionada || 'Clínica Geral',
        clinicaNome: medico?.clinica || 'Clínica Saúde Total',
        dataHora: dataHoraIso,
        resumoTriagem:
          resumoTriagem ||
          resumoTriagemInicial ||
          'Consulta solicitada via plataforma ProntoVital.',
      })

      setSucesso(true)
      setTimeout(() => {
        setSucesso(false)
        if (onSucesso) onSucesso()
        onFechar()
      }, 1200)
    } catch {
      setErro('Não foi possível realizar o agendamento. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-100 overflow-hidden animate-[zoomIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Agendar Consulta</h3>
            <p className="text-xs text-slate-500 mt-0.5">Escolha o profissional, data e horário ideal.</p>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {sucesso ? (
          <div className="py-8 text-center animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Consulta Agendada!</h4>
            <p className="text-sm text-slate-500 mt-1">Seu agendamento foi confirmado com sucesso.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmar} className="mt-5 space-y-4">
            
            {/* Profissional Card / Seleção */}
            {!medicoPreSelecionado ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Médico / Especialista
                </label>
                <select
                  value={medicoId}
                  onChange={(e) => setMedicoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {MOCK_PROFISSIONAIS.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} — {prof.especialidade} ({prof.clinica})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  {medico?.iniciais || 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">{medico?.nome}</h4>
                  <p className="text-xs text-blue-700 font-medium">{medico?.especialidade}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{medico?.clinica}</p>
                </div>
              </div>
            )}

            {/* Data e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data da Consulta
                </label>
                <input
                  type="date"
                  value={dataConsulta}
                  onChange={(e) => setDataConsulta(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Horário
                </label>
                <select
                  value={horarioSelecionado}
                  onChange={(e) => setHorarioSelecionado(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {HORARIOS_PADRAO.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo da Triagem / Sintomas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resumo da Triagem / Observações Clínicas
              </label>
              <textarea
                value={resumoTriagem}
                onChange={(e) => setResumoTriagem(e.target.value)}
                placeholder="Descreva brevemente seus sintomas ou motivo da consulta..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            {erro && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {erro}
              </p>
            )}

            {/* Ações */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onFechar}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
              >
                {salvando ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}
