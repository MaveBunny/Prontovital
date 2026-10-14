import React, { useState, useEffect } from 'react'
import api from '../../../lib/api'
import { agendarConsulta } from '../../../lib/agendamentosApi'

export default function ModalAgendarConsulta({
  aberto,
  onFechar,
  medicoPreSelecionado = null,
  especialidadePreSelecionada = '',
  resumoTriagemInicial = '',
  onSucesso = null,
}) {
  const [profissionais, setProfissionais] = useState([])
  const [medicoId, setMedicoId] = useState('')
  const [dataConsulta, setDataConsulta] = useState(() => {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    if (amanha.getDay() === 6) amanha.setDate(amanha.getDate() + 2)
    if (amanha.getDay() === 0) amanha.setDate(amanha.getDate() + 1)
    return amanha.toISOString().split('T')[0]
  })
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [carregandoProfissionais, setCarregandoProfissionais] = useState(false)
  const [resumoTriagem, setResumoTriagem] = useState(resumoTriagemInicial)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!aberto) return
    carregarProfissionais()
  }, [aberto])

  async function carregarProfissionais() {
    setCarregandoProfissionais(true)
    try {
      const { data } = await api.get('/profissionais')
      if (Array.isArray(data) && data.length > 0) {
        const formatados = data.map((p) => {
          const clinicaObj = p.Clinicas?.[0]
          return {
            id: p.id_profissional || p.id,
            id_profissional: p.id_profissional || p.id,
            nome: p.User?.nome || p.nome || 'Médico(a)',
            especialidade: p.Especialidade?.nome || p.especialidade || 'Clínica Geral',
            clinica: clinicaObj?.User?.nome || p.clinica || 'Sem clínica vinculada',
            id_clinica: clinicaObj?.id_clinica || p.id_clinica || null,
            iniciais: (p.User?.nome || p.nome || 'DR')
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'DR',
          }
        })
        const vinculados = formatados.filter((p) => p.id_clinica)
        setProfissionais(vinculados)
        if (!medicoPreSelecionado && vinculados.length > 0) {
          setMedicoId(vinculados[0].id)
        }
      } else {
        setProfissionais([])
      }
    } catch {
      setProfissionais([])
    } finally {
      setCarregandoProfissionais(false)
    }
  }

  const lista = profissionais
  const medico =
    medicoPreSelecionado ||
    lista.find((p) => String(p.id) === String(medicoId)) ||
    lista[0] ||
    null

  useEffect(() => {
    const idProf = medico?.id_profissional || medico?.id || medicoId
    if (!idProf || !dataConsulta) return

    async function carregarSlots() {
      setCarregandoHorarios(true)
      setErro('')
      try {
        const { data } = await api.get(
          `/profissionais/${idProf}/disponibilidade?data=${dataConsulta}`
        )
        if (Array.isArray(data) && data.length > 0) {
          setHorariosDisponiveis(data)
          setHorarioSelecionado(data[0])
        } else {
          setHorariosDisponiveis([])
          setHorarioSelecionado('')
        }
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err)
        setHorariosDisponiveis([])
        setHorarioSelecionado('')
      } finally {
        setCarregandoHorarios(false)
      }
    }

    carregarSlots()
  }, [medico?.id, medico?.id_profissional, medicoId, dataConsulta])

  if (!aberto) return null

  async function handleConfirmar(e) {
    e.preventDefault()
    setErro('')

    if (!medico) {
      setErro('Nenhum médico selecionado.')
      return
    }

    if (!medico.id_clinica) {
      setErro('Profissional sem clínica vinculada no banco real.')
      return
    }

    if (!horarioSelecionado) {
      setErro('Por favor, selecione um horário disponível.')
      return
    }

    setSalvando(true)

    try {
      await agendarConsulta({
        id_profissional: medico.id_profissional || medico.id,
        id_clinica: medico.id_clinica,
        data_agendamento: dataConsulta,
        horario_agendamento: horarioSelecionado,
        observacao:
          resumoTriagem ||
          resumoTriagemInicial ||
          'Consulta agendada via plataforma ProntoVital.',
      })

      setSucesso(true)
      setTimeout(() => {
        setSucesso(false)
        if (onSucesso) onSucesso()
        onFechar()
      }, 1000)
    } catch (err) {
      console.error('Erro ao agendar consulta na API:', err)
      const msg =
        err.response?.data?.erro ||
        err.response?.data?.mensagem ||
        err.message ||
        'Não foi possível realizar o agendamento. Tente novamente.'
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-100 overflow-hidden animate-[zoomIn_0.2s_ease-out]">

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
            <p className="text-sm text-slate-500 mt-1">Seu agendamento foi salvo com sucesso no sistema.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmar} className="mt-5 space-y-4">

            {!medicoPreSelecionado ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Médico / Especialista
                </label>
                {carregandoProfissionais ? (
                  <p className="text-xs text-slate-400 py-2">Carregando profissionais...</p>
                ) : lista.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    Nenhum profissional disponível para agendamento no momento.
                  </div>
                ) : (
                  <select
                    value={medicoId}
                    onChange={(e) => setMedicoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {lista.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome} — {prof.especialidade} ({prof.clinica})
                      </option>
                    ))}
                  </select>
                )}
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
                  Horário {carregandoHorarios && '(verificando disponibilidade...)'}
                </label>
                {carregandoHorarios ? (
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
                    Buscando horários disponíveis...
                  </div>
                ) : horariosDisponiveis.length === 0 ? (
                  <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium leading-tight">
                    Sem horários livres nesta data. Escolha outro dia.
                  </div>
                ) : (
                  <select
                    value={horarioSelecionado}
                    onChange={(e) => setHorarioSelecionado(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {horariosDisponiveis.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observação / Sintomas
              </label>
              <textarea
                rows={2}
                value={resumoTriagem}
                onChange={(e) => setResumoTriagem(e.target.value)}
                placeholder="Descreva brevemente o motivo da consulta..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {erro && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 animate-[fadeIn_0.2s_ease]">
                {erro}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || (!medicoPreSelecionado && lista.length === 0) || !horarioSelecionado}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
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
