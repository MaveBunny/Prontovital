import { useState, useEffect } from 'react'
import api from '../../../lib/api'
import {
  listarEspecialidades,
  vincularEspecialidade,
  obterEspecialidadeSalva,
  salvarEspecialidadeLocal,
  LISTA_ESPECIALIDADES_PADRAO
} from '../../../lib/profissionaisApi'

export default function ProfissionaisPage() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [profissionais, setProfissionais] = useState([])
  const [clinicasDisponiveis, setClinicasDisponiveis] = useState([])
  const [especialidadesDisponiveis, setEspecialidadesDisponiveis] = useState(LISTA_ESPECIALIDADES_PADRAO)
  const [busca, setBusca] = useState('')

  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    crm: '',
    email: '',
    senha: '',
    telefone: '',
    id_clinica: '',
    id_especialidade: '1',
    status: 'Ativo'
  })

  const [modalVincularAberto, setModalVincularAberto] = useState(false)
  const [medicoParaVincular, setMedicoParaVincular] = useState(null)
  const [especialidadeSelecionadaModal, setEspecialidadeSelecionadaModal] = useState('1')
  const [salvandoEspecialidade, setSalvandoEspecialidade] = useState(false)

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [itemParaExcluir, setItemParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarDados(busca)
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  async function carregarDados(termo = '') {
    setLoading(true)
    setErro('')
    try {
      const params = termo.trim() ? { busca: termo.trim() } : {}
      const [resProfissionais, resClinicas, resEspecialidades] = await Promise.all([
        api.get('/profissionais', { params }),
        api.get('/clinicas'),
        listarEspecialidades().catch(() => LISTA_ESPECIALIDADES_PADRAO)
      ])

      const listaClinicas = Array.isArray(resClinicas.data) ? resClinicas.data.map(c => ({
        id_clinica: c.id_clinica,
        nome: c.User?.nome || `Clínica #${c.id_clinica}`
      })) : []
      setClinicasDisponiveis(listaClinicas)

      const listaEsp = Array.isArray(resEspecialidades) && resEspecialidades.length > 0
        ? resEspecialidades
        : LISTA_ESPECIALIDADES_PADRAO
      setEspecialidadesDisponiveis(listaEsp)

      if (listaClinicas.length > 0 && !form.id_clinica) {
        setForm(prev => ({ ...prev, id_clinica: String(listaClinicas[0].id_clinica) }))
      }

      if (Array.isArray(resProfissionais.data)) {
        const formatados = resProfissionais.data.map((p) => {
          const clinicaVinculada = p.Clinicas && p.Clinicas.length > 0
            ? p.Clinicas[0].User?.nome || `Clínica #${p.Clinicas[0].id_clinica}`
            : 'Sem clínica vinculada'

          const crmFormatado = p.uf_registro && p.registro_profissional
            ? `${p.uf_registro}-${p.registro_profissional}`
            : (p.registro_profissional || 'Não informado')

          const vinculoLocal = obterEspecialidadeSalva(p.id_profissional)
          const idEsp = p.Especialidade?.id_especialidade || p.id_especialidade || vinculoLocal?.id_especialidade || null
          const espObj = listaEsp.find(e => String(e.id_especialidade) === String(idEsp))
          const espNome = p.Especialidade?.nome || vinculoLocal?.nome || espObj?.nome || p.especialidade || 'Sem especialidade'

          return {
            id: p.id_profissional,
            id_profissional: p.id_profissional,
            nome: p.User?.nome || 'Médico(a)',
            crm: crmFormatado,
            clinica: clinicaVinculada,
            id_especialidade: idEsp,
            especialidade: espNome,
            email: p.User?.email || '',
            status: p.User?.ativo !== false ? 'Ativo' : 'Inativo',
            iniciais: getIniciais(p.User?.nome)
          }
        })
        setProfissionais(formatados)
      } else {
        setProfissionais([])
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setErro('Não foi possível carregar os profissionais do servidor.')
      setProfissionais([])
    } finally {
      setLoading(false)
    }
  }

  function getIniciais(nome) {
    if (!nome) return 'PR'
    const limpo = nome.replace(/^(Dr\.|Dra\.)\s+/i, '').trim()
    const partes = limpo.split(' ').filter(Boolean)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return limpo.substring(0, 2).toUpperCase()
  }

  async function handleCadastrar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const crmLimpo = form.crm.trim()
      let uf = 'PE'
      let registro = crmLimpo
      if (crmLimpo.includes('-')) {
        const [ufPart, regPart] = crmLimpo.split('-')
        uf = ufPart.trim().toUpperCase()
        registro = regPart.trim()
      }

      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: 'Endereço não informado',
        cidade: 'Recife',
        estado: 'PE',
        telefone: form.telefone,
        perfil: 'profissional',
        profissional: {
          cpf: form.cpf.replace(/\D/g, ''),
          conselho: 'CRM',
          registro_profissional: registro,
          uf_registro: uf,
          id_especialidade: Number(form.id_especialidade) || 1
        }
      }

      const { data: usuarioCriado } = await api.post('/usuarios', payload)
      const idProfissionalCriado = usuarioCriado?.id_profissional || usuarioCriado?.profissional?.id_profissional || usuarioCriado?.id

      const espObjSelecionada = especialidadesDisponiveis.find(
        (e) => String(e.id_especialidade) === String(form.id_especialidade)
      )
      const nomeEspSelecionada = espObjSelecionada?.nome || 'Especialidade vinculada'

      if (idProfissionalCriado) {
        salvarEspecialidadeLocal(idProfissionalCriado, form.id_especialidade, nomeEspSelecionada)
      }

      if (form.id_clinica && idProfissionalCriado) {
        try {
          await api.patch(`/clinicas/${form.id_clinica}/profissionais/${idProfissionalCriado}`)
        } catch (vinculoErr) {
          console.warn('Profissional criado, mas erro ao vincular clínica:', vinculoErr)
        }
      }

      if (form.id_especialidade && idProfissionalCriado) {
        try {
          await vincularEspecialidade(idProfissionalCriado, form.id_especialidade)
        } catch (espErr) {
          console.warn('Erro ao garantir vínculo de especialidade:', espErr)
        }
      }

      await carregarDados(busca)
      resetForm()
    } catch (err) {
      console.error('Erro ao cadastrar profissional:', err)
      const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao cadastrar profissional no banco de dados.'
      alert(msg)
    } finally {
      setSalvando(false)
    }
  }

  function resetForm() {
    setForm({
      nome: '',
      cpf: '',
      crm: '',
      email: '',
      senha: '',
      telefone: '',
      id_clinica: clinicasDisponiveis.length > 0 ? String(clinicasDisponiveis[0].id_clinica) : '',
      id_especialidade: '1',
      status: 'Ativo'
    })
    setMostraForm(false)
  }

  function abrirModalVincular(item) {
    setMedicoParaVincular(item)
    setEspecialidadeSelecionadaModal(String(item.id_especialidade || '1'))
    setModalVincularAberto(true)
  }

  function fecharModalVincular() {
    setModalVincularAberto(false)
    setMedicoParaVincular(null)
  }

  async function handleConfirmarVinculoEspecialidade(e) {
    e.preventDefault()
    if (!medicoParaVincular || !especialidadeSelecionadaModal) return
    setSalvandoEspecialidade(true)
    try {
      const espObj = especialidadesDisponiveis.find(
        (e) => String(e.id_especialidade) === String(especialidadeSelecionadaModal)
      )
      const novoNome = espObj?.nome || 'Especialidade vinculada'

      salvarEspecialidadeLocal(medicoParaVincular.id, especialidadeSelecionadaModal, novoNome)

      setProfissionais(prev =>
        prev.map(p =>
          p.id === medicoParaVincular.id
            ? { ...p, id_especialidade: Number(especialidadeSelecionadaModal), especialidade: novoNome }
            : p
        )
      )

      await vincularEspecialidade(medicoParaVincular.id, especialidadeSelecionadaModal)
      await carregarDados(busca)
      fecharModalVincular()
    } catch (err) {
      console.error('Erro ao vincular especialidade:', err)
      const msg = err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao vincular especialidade ao profissional.'
      alert(msg)
    } finally {
      setSalvandoEspecialidade(false)
    }
  }

  function abrirModalExcluir(id) {
    setItemParaExcluir(id)
    setModalExcluirAberto(true)
  }

  function fecharModalExcluir() {
    setModalExcluirAberto(false)
    setItemParaExcluir(null)
  }

  async function confirmarExclusao() {
    if (!itemParaExcluir) return
    setExcluindo(true)
    try {
      setProfissionais(prev => prev.filter(p => p.id !== itemParaExcluir))
      fecharModalExcluir()
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 tracking-tight">Profissionais</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1">
              Vincule médicos às clínicas parceiras e gerencie suas especialidades.
            </p>
          </div>
          <button
            onClick={() => setMostraForm(prev => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            <span>+</span> Novo Profissional
          </button>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{erro}</div>}

        {mostraForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-6">
              Vincular Profissional
            </h3>

            <form onSubmit={handleCadastrar} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="Dr. Nome Sobrenome"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    CRM
                  </label>
                  <input
                    type="text"
                    required
                    value={form.crm}
                    onChange={e => setForm({ ...form, crm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="PE-00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={14}
                    value={form.cpf}
                    onChange={e => setForm({ ...form, cpf: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    required
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="(81) 98888-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="medico@prontovital.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Clínica Vinculada
                  </label>
                  <select
                    value={form.id_clinica}
                    onChange={e => setForm({ ...form, id_clinica: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
                  >
                    {clinicasDisponiveis.length > 0 ? (
                      clinicasDisponiveis.map((c) => (
                        <option key={c.id_clinica} value={c.id_clinica}>{c.nome}</option>
                      ))
                    ) : (
                      <option value="">Nenhuma clínica cadastrada</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Especialidade do Médico
                  </label>
                  <select
                    value={form.id_especialidade}
                    onChange={e => setForm({ ...form, id_especialidade: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
                  >
                    {especialidadesDisponiveis.map((esp) => (
                      <option key={esp.id_especialidade} value={esp.id_especialidade}>
                        {esp.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2 flex flex-row gap-3">
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-lg bg-[#2563eb] text-white font-bold text-[14px] hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {salvando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg border border-[#2563eb] text-[#2563eb] font-bold text-[14px] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome do profissional, especialidade ou clínica vinculada..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profissionais.length > 0 ? (
              profissionais.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-shadow overflow-hidden"
                >

                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 tracking-wider">
                        {item.iniciais || getIniciais(item.nome)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 truncate">
                        {item.nome}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[12px] sm:text-[13px] text-slate-500 font-medium">
                          CRM: {item.crm}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                          {item.especialidade}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[13px] text-slate-400 truncate mt-0.5">
                        {item.clinica}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto pt-3 md:pt-0 border-t border-slate-100 md:border-t-0">
                    <span className="px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => abrirModalVincular(item)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Vincular ou alterar especialidade"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                      <span>Vincular Especialidade</span>
                    </button>

                    <button
                      onClick={() => abrirModalExcluir(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Excluir Profissional"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 font-medium">Nenhum profissional encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modalVincularAberto && medicoParaVincular && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
          onClick={fecharModalVincular}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-[zoomIn_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {medicoParaVincular.iniciais}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Vincular Especialidade</h3>
                  <p className="text-xs text-slate-500">{medicoParaVincular.nome}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fecharModalVincular}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmarVinculoEspecialidade} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selecione a Especialidade Médica
                </label>
                <select
                  value={especialidadeSelecionadaModal}
                  onChange={e => setEspecialidadeSelecionadaModal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                >
                  {especialidadesDisponiveis.map(esp => (
                    <option key={esp.id_especialidade} value={esp.id_especialidade}>
                      {esp.nome}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Especialidade atual: <strong className="text-blue-700">{medicoParaVincular.especialidade}</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={fecharModalVincular}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEspecialidade}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {salvandoEspecialidade ? 'Salvando...' : 'Salvar Especialidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-[zoomIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Remover profissional?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Tem certeza que deseja desvincular este profissional da rede? Esta ação não pode ser desfeita.
              </p>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={fecharModalExcluir}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#dc2626] text-white font-bold text-sm hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {excluindo ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover profissional
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
