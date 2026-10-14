import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buscarProfissionais } from '../../../lib/profissionaisApi'
import { listarClinicas } from '../../../lib/clinicasApi'
import ModalAgendarConsulta from '../components/ModalAgendarConsulta'

export default function ProfissionaisPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const clinicaUrlParam = searchParams.get('clinica') || ''
  const clinicaNomeUrlParam = searchParams.get('nome') || ''

  const [profissionais, setProfissionais] = useState([])
  const [clinicas, setClinicas] = useState([])
  const [busca, setBusca] = useState('')
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState('Todos')
  const [clinicaSelecionada, setClinicaSelecionada] = useState(clinicaUrlParam || 'Todas')
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [medicoSelecionado, setMedicoSelecionado] = useState(null)

  // Sincroniza se o parâmetro de busca na URL mudar
  useEffect(() => {
    if (clinicaUrlParam) {
      setClinicaSelecionada(clinicaUrlParam)
    }
  }, [clinicaUrlParam])

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const [dadosProfs, dadosClinicas] = await Promise.all([
          buscarProfissionais(),
          listarClinicas().catch(() => [])
        ])
        setProfissionais(Array.isArray(dadosProfs) ? dadosProfs : [])
        setClinicas(Array.isArray(dadosClinicas) ? dadosClinicas : [])
      } catch (err) {
        console.error('Erro ao carregar profissionais e clínicas:', err)
        setProfissionais([])
        setClinicas([])
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  // Lista dinâmica de especialidades encontradas na base
  const especialidadesDisponiveis = [
    'Todos',
    ...Array.from(
      new Set(
        profissionais
          .map((p) => p.especialidade)
          .filter(Boolean)
          .concat(['Cardiologia', 'Neurologia', 'Ortopedia', 'Clínica Geral'])
      )
    ),
  ]

  // Filtro de profissionais com vínculo estrito de clínica
  const profissionaisFiltrados = profissionais.filter((p) => {
    const termo = busca.trim().toLowerCase()
    const matchBusca =
      !termo ||
      p.nome?.toLowerCase().includes(termo) ||
      p.clinica?.toLowerCase().includes(termo) ||
      p.especialidade?.toLowerCase().includes(termo) ||
      p.registro?.toLowerCase().includes(termo)

    const matchEsp =
      especialidadeSelecionada === 'Todos' ||
      p.especialidade?.toLowerCase() === especialidadeSelecionada.toLowerCase()

    let matchClinica = true
    if (clinicaSelecionada && clinicaSelecionada !== 'Todas') {
      const idFiltro = String(clinicaSelecionada)
      matchClinica =
        String(p.id_clinica) === idFiltro ||
        (Array.isArray(p.clinicas) && p.clinicas.some((c) => String(c.id_clinica) === idFiltro))
    }

    return matchBusca && matchEsp && matchClinica
  })

  // Nome da clínica atualmente selecionada no filtro
  const clinicaAtivaObj = clinicas.find(
    (c) => String(c.id_clinica) === String(clinicaSelecionada)
  )
  const nomeClinicaAtiva =
    clinicaAtivaObj?.nome || clinicaNomeUrlParam || 'Clínica Selecionada'

  function handleSelecionarClinica(idClinica) {
    setClinicaSelecionada(idClinica)
    if (idClinica === 'Todas') {
      setSearchParams({})
    } else {
      const encontrada = clinicas.find((c) => String(c.id_clinica) === String(idClinica))
      setSearchParams({
        clinica: idClinica,
        ...(encontrada?.nome ? { nome: encontrada.nome } : {}),
      })
    }
  }

  function handleLimparFiltroClinica() {
    setClinicaSelecionada('Todas')
    setSearchParams({})
  }

  function handleAgendar(medico) {
    setMedicoSelecionado(medico)
    setModalAberto(true)
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">

      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Profissionais
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Busque por médicos disponíveis na rede por clínica ou especialidade.
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 max-w-5xl">

        {/* Campo de Busca Livre */}
        <div className="relative md:col-span-5 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por médico ou clínica..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>

        {/* Filtro de Clínica */}
        <div className="md:col-span-4 w-full">
          <select
            value={clinicaSelecionada}
            onChange={(e) => handleSelecionarClinica(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
          >
            <option value="Todas">🏥 Todas as clínicas</option>
            {clinicas.map((cl) => (
              <option key={cl.id_clinica} value={String(cl.id_clinica)}>
                {cl.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Especialidade */}
        <div className="md:col-span-3 w-full">
          <select
            value={especialidadeSelecionada}
            onChange={(e) => setEspecialidadeSelecionada(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
          >
            {especialidadesDisponiveis.map((esp) => (
              <option key={esp} value={esp}>
                {esp === 'Todos' ? 'Todas as especialidades' : esp}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Banner de Filtro de Clínica Ativo */}
      {clinicaSelecionada !== 'Todas' && (
        <div className="mb-6 max-w-5xl p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Filtro por Clínica
                </span>
                <span className="text-xs text-slate-500">
                  {profissionaisFiltrados.length}{' '}
                  {profissionaisFiltrados.length === 1
                    ? 'profissional vinculado'
                    : 'profissionais vinculados'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Mostrando apenas os profissionais de:{' '}
                <span className="text-blue-700 font-extrabold">{nomeClinicaAtiva}</span>
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLimparFiltroClinica}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <span>✕</span>
            <span>Ver todos os profissionais</span>
          </button>
        </div>
      )}

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Carregando profissionais da rede...</span>
        </div>
      ) : profissionaisFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            👨‍⚕️
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhum profissional encontrado</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {clinicaSelecionada !== 'Todas'
              ? `Nenhum profissional está vinculado à clínica "${nomeClinicaAtiva}" no momento.`
              : 'Nenhum profissional corresponde aos filtros de busca selecionados.'}
          </p>
          {clinicaSelecionada !== 'Todas' && (
            <button
              onClick={handleLimparFiltroClinica}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Ver todos os médicos da rede
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
          {profissionaisFiltrados.map((medico) => {
            const temClinica = Boolean(medico.id_clinica)

            return (
              <div
                key={medico.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm tracking-wider shadow-2xs">
                      {medico.iniciais || 'DR'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                        {medico.nome}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        {medico.especialidade}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {medico.registro}
                        </span>
                        <span className="text-slate-300">•</span>
                        {temClinica ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                            🏥 {medico.clinica}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            Sem clínica vinculada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {temClinica ? (
                    <button
                      onClick={() => handleAgendar(medico)}
                      className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shadow-2xs"
                    >
                      Agendar consulta
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Este profissional ainda não possui clínica associada para agendamentos."
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-medium text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      Aguardando vínculo de clínica
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <ModalAgendarConsulta
          aberto={modalAberto}
          onFechar={() => {
            setModalAberto(false)
            setMedicoSelecionado(null)
          }}
          medicoPreSelecionado={medicoSelecionado}
          onSucesso={() => navigate('/paciente/agendamentos')}
        />
      )}

    </div>
  )
}
