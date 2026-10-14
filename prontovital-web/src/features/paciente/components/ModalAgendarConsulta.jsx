import React, { useState, useEffect, useMemo } from 'react'
import api from '../../../lib/api'
import { agendarConsulta } from '../../../lib/agendamentosApi'
import { obterEspecialidadeSalva, LISTA_ESPECIALIDADES_PADRAO } from '../../../lib/profissionaisApi'

const DIAS_SEMANA_NOMES = [
  { dia: 0, nomeCurto: 'Dom', nomeCompleto: 'Domingo' },
  { dia: 1, nomeCurto: 'Seg', nomeCompleto: 'Segunda' },
  { dia: 2, nomeCurto: 'Ter', nomeCompleto: 'Terça' },
  { dia: 3, nomeCurto: 'Qua', nomeCompleto: 'Quarta' },
  { dia: 4, nomeCurto: 'Qui', nomeCompleto: 'Quinta' },
  { dia: 5, nomeCurto: 'Sex', nomeCompleto: 'Sexta' },
  { dia: 6, nomeCurto: 'Sáb', nomeCompleto: 'Sábado' },
]

function gerarSlotsPadrao(aberturaStr = '08:00', fechamentoStr = '18:00') {
  const [hIni, mIni] = aberturaStr.slice(0, 5).split(':').map(Number)
  const [hFim, mFim] = fechamentoStr.slice(0, 5).split(':').map(Number)

  const slots = []
  let atual = hIni * 60 + mIni
  const fim = hFim * 60 + mFim

  while (atual + 30 <= fim) {
    const hora = String(Math.floor(atual / 60)).padStart(2, '0')
    const minuto = String(atual % 60).padStart(2, '0')
    slots.push(`${hora}:${minuto}`)
    atual += 30
  }

  return slots
}

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
  const [horariosSemanais, setHorariosSemanais] = useState([])
  const [carregandoHorariosSemanais, setCarregandoHorariosSemanais] = useState(false)

  const [dataConsulta, setDataConsulta] = useState('')
  const [horariosLivres, setHorariosLivres] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoSlots, setCarregandoSlots] = useState(false)
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
          const vinculoLocal = obterEspecialidadeSalva(p.id_profissional || p.id)
          const idEsp = p.Especialidade?.id_especialidade || p.id_especialidade || vinculoLocal?.id_especialidade || null
          const espObj = LISTA_ESPECIALIDADES_PADRAO.find((e) => String(e.id_especialidade) === String(idEsp))
          const espNome = p.Especialidade?.nome || vinculoLocal?.nome || espObj?.nome || p.especialidade || 'Clínica Geral'

          return {
            id: p.id_profissional || p.id,
            id_profissional: p.id_profissional || p.id,
            nome: p.User?.nome || p.nome || 'Médico(a)',
            especialidade: espNome,
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

  const idProfissional = medico?.id_profissional || medico?.id || medicoId

  useEffect(() => {
    if (!aberto || !idProfissional) return

    async function buscarHorariosSemanais() {
      setCarregandoHorariosSemanais(true)
      try {
        const { data } = await api.get(`/profissionais/${idProfissional}/horarios`)
        if (Array.isArray(data) && data.length > 0) {
          setHorariosSemanais(data)
        } else {
          setHorariosSemanais([
            { dia_da_semana: 1, horario_abertura: '08:00', horario_fechamento: '18:00' },
            { dia_da_semana: 2, horario_abertura: '08:00', horario_fechamento: '18:00' },
            { dia_da_semana: 3, horario_abertura: '08:00', horario_fechamento: '18:00' },
            { dia_da_semana: 4, horario_abertura: '08:00', horario_fechamento: '18:00' },
            { dia_da_semana: 5, horario_abertura: '08:00', horario_fechamento: '18:00' },
          ])
        }
      } catch {
        setHorariosSemanais([
          { dia_da_semana: 1, horario_abertura: '08:00', horario_fechamento: '18:00' },
          { dia_da_semana: 2, horario_abertura: '08:00', horario_fechamento: '18:00' },
          { dia_da_semana: 3, horario_abertura: '08:00', horario_fechamento: '18:00' },
          { dia_da_semana: 4, horario_abertura: '08:00', horario_fechamento: '18:00' },
          { dia_da_semana: 5, horario_abertura: '08:00', horario_fechamento: '18:00' },
        ])
      } finally {
        setCarregandoHorariosSemanais(false)
      }
    }

    buscarHorariosSemanais()
  }, [aberto, idProfissional])

  const diasAtendimentoSet = useMemo(() => {
    return new Set(horariosSemanais.map((h) => Number(h.dia_da_semana)))
  }, [horariosSemanais])

  const proximosDias = useMemo(() => {
    const listaDias = []
    const hoje = new Date()

    for (let i = 1; i <= 14; i++) {
      const d = new Date()
      d.setDate(hoje.getDate() + i)

      const ano = d.getFullYear()
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const dia = String(d.getDate()).padStart(2, '0')
      const dataISO = `${ano}-${mes}-${dia}`

      const diaSemana = d.getDay()
      const podeAtender = diasAtendimentoSet.has(diaSemana)
      const infoSemana = DIAS_SEMANA_NOMES.find((s) => s.dia === diaSemana)

      listaDias.push({
        dataISO,
        diaNum: dia,
        mesNome: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        diaSemanaCurto: infoSemana?.nomeCurto || '',
        diaSemanaCompleto: infoSemana?.nomeCompleto || '',
        podeAtender,
      })
    }

    return listaDias
  }, [diasAtendimentoSet])

  useEffect(() => {
    if (proximosDias.length > 0 && !dataConsulta) {
      const primeiroDisponivel = proximosDias.find((d) => d.podeAtender)
      if (primeiroDisponivel) {
        setDataConsulta(primeiroDisponivel.dataISO)
      } else {
        setDataConsulta(proximosDias[0].dataISO)
      }
    }
  }, [proximosDias, dataConsulta])

  useEffect(() => {
    if (!idProfissional || !dataConsulta) return

    async function carregarSlots() {
      setCarregandoSlots(true)
      setErro('')
      try {
        const { data } = await api.get(
          `/profissionais/${idProfissional}/disponibilidade?data=${dataConsulta}`
        )
        const livres = Array.isArray(data) ? data : []
        setHorariosLivres(livres)

        if (livres.length > 0) {
          setHorarioSelecionado(livres[0])
        } else {
          setHorarioSelecionado('')
        }
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err)
        setHorariosLivres([])
        setHorarioSelecionado('')
      } finally {
        setCarregandoSlots(false)
      }
    }

    carregarSlots()
  }, [idProfissional, dataConsulta])

  const todosOsSlotsDoDia = useMemo(() => {
    if (!dataConsulta) return []
    const d = new Date(`${dataConsulta}T00:00:00.000Z`)
    const diaSemana = d.getUTCDay()

    const horarioConfig = horariosSemanais.find(
      (h) => Number(h.dia_da_semana) === diaSemana
    )

    if (!horarioConfig && !diasAtendimentoSet.has(diaSemana)) {
      return []
    }

    const abertura = horarioConfig?.horario_abertura || '08:00'
    const fechamento = horarioConfig?.horario_fechamento || '18:00'

    const slotsGerados = gerarSlotsPadrao(abertura, fechamento)

    const todos = Array.from(new Set([...slotsGerados, ...horariosLivres])).sort()
    return todos
  }, [dataConsulta, horariosSemanais, diasAtendimentoSet, horariosLivres])

  const diaSelecionadoInfo = proximosDias.find((d) => d.dataISO === dataConsulta)
  const podeAtenderNoDiaSelecionado = diaSelecionadoInfo?.podeAtender ?? false

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

    if (!podeAtenderNoDiaSelecionado) {
      setErro('O médico não realiza atendimentos nesta data. Escolha um dos dias em destaque.')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-100 my-8 overflow-hidden animate-[zoomIn_0.2s_ease-out] max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Agendar Consulta</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione um dos dias de atendimento do médico e escolha o melhor horário.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sucesso ? (
          <div className="py-12 text-center animate-[fadeIn_0.3s_ease]">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Consulta Agendada!</h4>
            <p className="text-sm text-slate-500 mt-1">Seu agendamento foi salvo com sucesso no sistema.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmar} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">

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
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
                  {medico?.iniciais || 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">{medico?.nome}</h4>
                  <p className="text-xs text-blue-700 font-semibold">{medico?.especialidade}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V21" />
                    </svg>
                    {medico?.clinica}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Dias de atendimento do médico:
                </span>
                <span className="text-[11px] text-blue-700 font-bold">
                  {diasAtendimentoSet.size} {diasAtendimentoSet.size === 1 ? 'dia na semana' : 'dias na semana'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {DIAS_SEMANA_NOMES.map((d) => {
                  const atende = diasAtendimentoSet.has(d.dia)
                  return (
                    <span
                      key={d.dia}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                        atende
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60'
                      }`}
                    >
                      {atende && (
                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      {d.nomeCompleto}
                    </span>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Escolha uma data disponível
                </label>
                <span className="text-[11px] text-slate-500">
                  Dias em destaque = <strong className="text-emerald-700 font-bold">Atendimento disponível</strong>
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {proximosDias.map((d) => {
                  const isSelecionado = dataConsulta === d.dataISO
                  const podeAtender = d.podeAtender

                  return (
                    <button
                      type="button"
                      key={d.dataISO}
                      onClick={() => {
                        if (podeAtender) {
                          setDataConsulta(d.dataISO)
                        }
                      }}
                      disabled={!podeAtender}
                      className={`min-w-[76px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-center transition-all border shrink-0 ${
                        isSelecionado
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold ring-2 ring-blue-400/30'
                          : podeAtender
                          ? 'bg-blue-50/60 border-blue-200 text-slate-800 hover:bg-blue-100 hover:border-blue-300 cursor-pointer shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {d.diaSemanaCurto}
                      </span>
                      <span className="text-base font-extrabold my-0.5 leading-none">
                        {d.diaNum}
                      </span>
                      <span className="text-[10px] capitalize opacity-85">
                        {d.mesNome}
                      </span>
                      <span
                        className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${
                          isSelecionado
                            ? 'bg-white/20 text-white'
                            : podeAtender
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {podeAtender ? 'Atende' : 'Folga'}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  value={dataConsulta}
                  onChange={(e) => {
                    const novaData = e.target.value
                    setDataConsulta(novaData)
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {!podeAtenderNoDiaSelecionado && dataConsulta && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  O médico não realiza atendimentos neste dia da semana. Por favor, clique em um dos dias destacados acima.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Horário do Atendimento
                </label>
                <div className="flex items-center gap-2.5 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Disponível
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                    Indisponível / Ocupado
                  </span>
                </div>
              </div>

              {carregandoSlots ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verificando horários livres e ocupados...</span>
                </div>
              ) : !podeAtenderNoDiaSelecionado ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                  Médico indisponível nesta data. Escolha outro dia em destaque acima.
                </div>
              ) : todosOsSlotsDoDia.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center font-medium">
                  Nenhum horário cadastrado para este dia da semana.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {todosOsSlotsDoDia.map((horario) => {
                    const isLivre = horariosLivres.includes(horario)
                    const isSelecionado = horarioSelecionado === horario

                    if (isLivre) {
                      return (
                        <button
                          type="button"
                          key={horario}
                          onClick={() => setHorarioSelecionado(horario)}
                          className={`py-2 px-2.5 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer border ${
                            isSelecionado
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm ring-2 ring-blue-400/30'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold shadow-2xs'
                          }`}
                        >
                          <span className="text-xs leading-tight">{horario}</span>
                          <span className={`text-[9px] mt-0.5 font-semibold ${isSelecionado ? 'text-blue-100' : 'text-emerald-700'}`}>
                            Disponível
                          </span>
                        </button>
                      )
                    }

                    return (
                      <button
                        type="button"
                        key={horario}
                        disabled
                        title="Este horário já está reservado ou indisponível"
                        className="py-2 px-2.5 rounded-xl text-xs flex flex-col items-center justify-center bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed opacity-70"
                      >
                        <span className="text-xs leading-tight line-through">{horario}</span>
                        <span className="text-[9px] mt-0.5 font-medium text-slate-400">
                          Ocupado
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observação / Motivo da Consulta
              </label>
              <textarea
                rows={2}
                value={resumoTriagem}
                onChange={(e) => setResumoTriagem(e.target.value)}
                placeholder="Descreva brevemente seus sintomas ou motivo da consulta..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {erro && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 animate-[fadeIn_0.2s_ease]">
                {erro}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  salvando ||
                  (!medicoPreSelecionado && lista.length === 0) ||
                  !horarioSelecionado ||
                  !podeAtenderNoDiaSelecionado
                }
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
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
