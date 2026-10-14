import { useState, useEffect } from 'react'
import api from '../../../lib/api'
import { obterEspecialidadeSalva } from '../../../lib/profissionaisApi'

export default function AdminAgendamentosPage() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [agendamentos, setAgendamentos] = useState([])

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos os status')

  const [modalAberto, setModalAberto] = useState(false)
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [clinicas, setClinicas] = useState([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [erroNovo, setErroNovo] = useState('')

  const [formNovo, setFormNovo] = useState({
    id_paciente: '',
    id_profissional: '',
    id_clinica: '',
    data_agendamento: '',
    horario_agendamento: '08:00',
    observacao: ''
  })

  useEffect(() => {
    carregarAgendamentos()
  }, [])

  async function carregarAgendamentos() {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get('/agendamentos')
      if (Array.isArray(data)) {
        const formatados = data.map((item) => {
          const nomePaciente = item.Paciente?.User?.nome || 'Paciente'
          const nomeProfissional = item.Profissional?.User?.nome || 'Profissional'
          const idProf = item.Profissional?.id_profissional || item.id_profissional
          const espSalva = idProf ? (obterEspecialidadeSalva(idProf)?.nome || '') : ''
          const especialidade = item.Profissional?.Especialidade?.nome || espSalva || ''
          const subInfo = especialidade ? `${nomeProfissional} · ${especialidade}` : nomeProfissional

          let dataFormatada = item.data_agendamento || ''
          if (dataFormatada.includes('-')) {
            const [ano, mes, dia] = dataFormatada.split('-')
            dataFormatada = `${dia}/${mes}/${ano}`
          }

          const horarioFormatado = item.horario_agendamento?.substring(0, 5) || '--:--'

          const statusOriginal = item.status || 'Confirmado'
          const statusFormatado = statusOriginal.charAt(0).toUpperCase() + statusOriginal.slice(1).toLowerCase()

          return {
            id: item.id_agendamento,
            id_agendamento: item.id_agendamento,
            id_paciente: item.id_paciente || item.Paciente?.id_paciente,
            paciente: nomePaciente,
            profissional: subInfo,
            data: dataFormatada,
            horario: horarioFormatado,
            status: statusFormatado,
            ia: item.observacao?.toLowerCase().includes('ia') || false
          }
        })
        setAgendamentos(formatados)
      } else {
        setAgendamentos([])
      }
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err)
      setErro('Não foi possível carregar os agendamentos do servidor.')
    } finally {
      setLoading(false)
    }
  }

  function openDeleteModal(item) {
    setAgendamentoParaExcluir(item)
    setModalAberto(true)
  }

  function closeDeleteModal() {
    setModalAberto(false)
    setAgendamentoParaExcluir(null)
  }

  async function confirmDelete() {
    if (!agendamentoParaExcluir) return
    setExcluindo(true)

    try {
      if (agendamentoParaExcluir.id_paciente && agendamentoParaExcluir.id_agendamento) {
        await api.patch(`/pacientes/${agendamentoParaExcluir.id_paciente}/agendamentos/${agendamentoParaExcluir.id_agendamento}/cancelar`)
      }
      setAgendamentos(prev => prev.map(a =>
        a.id === agendamentoParaExcluir.id ? { ...a, status: 'Cancelado' } : a
      ))
      closeDeleteModal()
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err)
      setAgendamentos(prev => prev.filter(a => a.id !== agendamentoParaExcluir.id))
      closeDeleteModal()
    } finally {
      setExcluindo(false)
    }
  }

  async function abrirModalNovo() {
    setErroNovo('')

    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const dataAmanha = amanha.toISOString().split('T')[0]

    setFormNovo({
      id_paciente: '',
      id_profissional: '',
      id_clinica: '',
      data_agendamento: dataAmanha,
      horario_agendamento: '08:00',
      observacao: 'Consulta agendada pelo administrador'
    })
    setHorariosDisponiveis([])
    setModalNovoAberto(true)

    try {
      const [resPacientes, resProfissionais, resClinicas] = await Promise.all([
        api.get('/pacientes'),
        api.get('/profissionais'),
        api.get('/clinicas')
      ])

      const listaPac = Array.isArray(resPacientes.data) ? resPacientes.data : []
      const listaProf = Array.isArray(resProfissionais.data) ? resProfissionais.data : []
      const listaClinicas = Array.isArray(resClinicas.data) ? resClinicas.data : []

      setPacientes(listaPac)
      setProfissionais(listaProf)
      setClinicas(listaClinicas)

      const primProf = listaProf.length > 0 ? listaProf[0] : null
      const idProfInicial = primProf ? String(primProf.id_profissional) : ''

      let idClinicaInicial = ''
      if (primProf?.Clinicas && primProf.Clinicas.length > 0) {
        idClinicaInicial = String(primProf.Clinicas[0].id_clinica)
      } else if (listaClinicas.length > 0) {
        idClinicaInicial = String(listaClinicas[0].id_clinica)
      }

      setFormNovo(prev => ({
        ...prev,
        id_paciente: listaPac.length > 0 ? String(listaPac[0].id_paciente) : '',
        id_profissional: idProfInicial,
        id_clinica: idClinicaInicial
      }))

      if (idProfInicial) {
        carregarDisponibilidade(idProfInicial, dataAmanha)
      }
    } catch (err) {
      console.error('Erro ao buscar dados para novo agendamento:', err)
      setErroNovo('Erro ao carregar dados do servidor.')
    }
  }

  async function carregarDisponibilidade(idProf, dataAgend) {
    if (!idProf || !dataAgend) return
    setCarregandoHorarios(true)
    try {
      const { data } = await api.get(`/profissionais/${idProf}/disponibilidade?data=${dataAgend}`)
      if (Array.isArray(data) && data.length > 0) {
        setHorariosDisponiveis(data)
        setFormNovo(prev => ({ ...prev, horario_agendamento: data[0] }))
      } else {
        setHorariosDisponiveis([])
      }
    } catch (e) {
      setHorariosDisponiveis([])
    } finally {
      setCarregandoHorarios(false)
    }
  }

  function handleProfissionalChange(idProf) {
    const prof = profissionais.find(p => String(p.id_profissional) === String(idProf))
    let idClinica = formNovo.id_clinica
    if (prof?.Clinicas && prof.Clinicas.length > 0) {
      idClinica = String(prof.Clinicas[0].id_clinica)
    }
    setFormNovo(prev => ({
      ...prev,
      id_profissional: idProf,
      id_clinica: idClinica
    }))
    carregarDisponibilidade(idProf, formNovo.data_agendamento)
  }

  function handleDataChange(novaData) {
    setFormNovo(prev => ({ ...prev, data_agendamento: novaData }))
    if (formNovo.id_profissional) {
      carregarDisponibilidade(formNovo.id_profissional, novaData)
    }
  }


  async function handleSalvarNovoAgendamento(e) {
    e.preventDefault()
    setSalvandoNovo(true)
    setErroNovo('')

    if (!formNovo.id_paciente) {
      setErroNovo('Selecione um paciente para o agendamento.')
      setSalvandoNovo(false)
      return
    }

    if (!formNovo.id_profissional) {
      setErroNovo('Selecione um profissional de saúde.')
      setSalvandoNovo(false)
      return
    }

    if (!formNovo.id_clinica) {
      setErroNovo('Selecione uma clínica para o atendimento.')
      setSalvandoNovo(false)
      return
    }

    try {
      const prof = profissionais.find(p => String(p.id_profissional) === String(formNovo.id_profissional))
      const jaVinculado = prof?.Clinicas?.some(c => String(c.id_clinica) === String(formNovo.id_clinica))
      if (!jaVinculado) {
        await api.patch(`/clinicas/${formNovo.id_clinica}/profissionais/${formNovo.id_profissional}`).catch(() => {})
      }

      const payload = {
        id_paciente: Number(formNovo.id_paciente),
        id_clinica: Number(formNovo.id_clinica),
        data_agendamento: formNovo.data_agendamento,
        horario_agendamento: formNovo.horario_agendamento,
        observacao: formNovo.observacao || 'Agendado pelo Administrador'
      }

      await api.post(`/profissionais/${formNovo.id_profissional}/agendamentos`, payload)
      await carregarAgendamentos()
      setModalNovoAberto(false)
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      const msg = err.response?.data?.erro || 'Erro ao criar agendamento. Verifique se o médico tem disponibilidade neste horário.'
      setErroNovo(msg)
    } finally {
      setSalvandoNovo(false)
    }
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'confirmado': return 'bg-green-100 text-green-700'
      case 'concluído':
      case 'concluido': return 'bg-blue-100 text-blue-700'
      case 'cancelado': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  function getIniciais(nome) {
    if (!nome) return '??'
    const partes = nome.split(' ')
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return nome.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 tracking-tight">Todos os Agendamentos</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1">Visão completa da rede.</p>
          </div>
          <button
            onClick={abrirModalNovo}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Agendamento
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {erro}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
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
              placeholder="Buscar por paciente, profissional ou especialidade..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full sm:w-[200px] shrink-0 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
          >
            <option value="Todos os status">Todos os status</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {agendamentos.filter((item) => {
              const termo = busca.toLowerCase()
              const matchBusca =
                item.paciente.toLowerCase().includes(termo) ||
                item.profissional.toLowerCase().includes(termo)
              const matchStatus = filtroStatus === 'Todos os status' || item.status.toLowerCase() === filtroStatus.toLowerCase()
              return matchBusca && matchStatus
            }).length > 0 ? (
              agendamentos
                .filter((item) => {
                  const termo = busca.toLowerCase()
                  const matchBusca =
                    item.paciente.toLowerCase().includes(termo) ||
                    item.profissional.toLowerCase().includes(termo)
                  const matchStatus = filtroStatus === 'Todos os status' || item.status.toLowerCase() === filtroStatus.toLowerCase()
                  return matchBusca && matchStatus
                })
                .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-shadow overflow-hidden"
                >

                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="text-[13px] sm:text-[14px] font-bold text-blue-600">
                        {getIniciais(item.paciente)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] sm:text-[16px] font-bold text-slate-900 truncate">
                          {item.paciente}
                        </h4>
                        {item.ia && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                            IA
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium truncate mt-0.5">
                        {item.profissional}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-[13px] sm:text-[14px] text-slate-600 font-medium">
                      {item.data} - {item.horario}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-start">
                      <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>

                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Cancelar Agendamento"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 font-medium">Nenhum agendamento encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-[zoomIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cancelar agendamento?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Tem certeza que deseja cancelar o agendamento de <span className="font-semibold text-slate-800">{agendamentoParaExcluir?.paciente}</span>? O status passará para "Cancelado".
              </p>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#dc2626] text-white font-bold text-sm hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {excluindo ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Confirmar Cancelamento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-[zoomIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Novo Agendamento</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Criar consulta diretamente pela administração.</p>
                </div>
                <button
                  onClick={() => setModalNovoAberto(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {erroNovo && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-semibold">
                  {erroNovo}
                </div>
              )}

              <form onSubmit={handleSalvarNovoAgendamento} className="flex flex-col gap-4">

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Paciente
                  </label>
                  <select
                    required
                    value={formNovo.id_paciente}
                    onChange={(e) => setFormNovo({ ...formNovo, id_paciente: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {pacientes.length === 0 ? (
                      <option value="">Nenhum paciente cadastrado no sistema</option>
                    ) : (
                      <>
                        <option value="">Selecione um paciente...</option>
                        {pacientes.map((p) => (
                          <option key={p.id_paciente} value={p.id_paciente}>
                            {p.User?.nome || `Paciente #${p.id_paciente}`} {p.cpf ? `(CPF: ${p.cpf})` : ''}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Profissional de Saúde
                  </label>
                  <select
                    required
                    value={formNovo.id_profissional}
                    onChange={(e) => handleProfissionalChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {profissionais.length === 0 ? (
                      <option value="">Nenhum profissional cadastrado</option>
                    ) : (
                      profissionais.map((prof) => {
                        const espNome = prof.Especialidade?.nome || obterEspecialidadeSalva(prof.id_profissional)?.nome || ''
                        return (
                          <option key={prof.id_profissional} value={prof.id_profissional}>
                            {prof.User?.nome || `Médico #${prof.id_profissional}`} {prof.registro_profissional ? `(CRM: ${prof.registro_profissional})` : ''}{espNome ? ` - ${espNome}` : ''}
                          </option>
                        )
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Clínica do Atendimento
                  </label>
                  <select
                    required
                    value={formNovo.id_clinica}
                    onChange={(e) => setFormNovo({ ...formNovo, id_clinica: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {clinicas.length === 0 ? (
                      <option value="">Nenhuma clínica cadastrada</option>
                    ) : (
                      clinicas.map((c) => (
                        <option key={c.id_clinica} value={c.id_clinica}>
                          {c.User?.nome?.trim() || `Clínica #${c.id_clinica}`} ({c.bairro || c.User?.cidade || 'Recife'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Data da Consulta
                    </label>
                    <input
                      type="date"
                      required
                      value={formNovo.data_agendamento}
                      onChange={(e) => handleDataChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Horário {carregandoHorarios && '(verificando agenda...)'}
                    </label>
                    {horariosDisponiveis.length > 0 ? (
                      <select
                        value={formNovo.horario_agendamento}
                        onChange={(e) => setFormNovo({ ...formNovo, horario_agendamento: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      >
                        {horariosDisponiveis.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="time"
                        required
                        value={formNovo.horario_agendamento}
                        onChange={(e) => setFormNovo({ ...formNovo, horario_agendamento: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Observações Clínicas
                  </label>
                  <textarea
                    rows={2}
                    value={formNovo.observacao}
                    onChange={(e) => setFormNovo({ ...formNovo, observacao: e.target.value })}
                    placeholder="Ex: Consulta de rotina / encaminhamento..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalNovoAberto(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoNovo}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {salvandoNovo ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Criar Agendamento'
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
