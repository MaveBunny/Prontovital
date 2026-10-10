import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { buscarProfissionais, MOCK_PROFISSIONAIS } from '../../../lib/profissionaisApi'
import ModalAgendarConsulta from '../components/ModalAgendarConsulta'

const ESPECIALIDADES = [
  'Todos',
  'Cardiologia',
  'Neurologia',
  'Ortopedia',
  'Clínica Geral',
]

export default function ProfissionaisPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const clinicaFiltroInicial = searchParams.get('clinica') || ''

  const [profissionais, setProfissionais] = useState(MOCK_PROFISSIONAIS)
  const [busca, setBusca] = useState(clinicaFiltroInicial)
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState('Todos')
  const [carregando, setCarregando] = useState(false)

  // Modal Agendamento
  const [modalAberto, setModalAberto] = useState(false)
  const [medicoSelecionado, setMedicoSelecionado] = useState(null)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const dados = await buscarProfissionais()
        setProfissionais(dados || [])
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const profissionaisFiltrados = profissionais.filter((p) => {
    const termo = busca.toLowerCase()
    const matchBusca =
      p.nome?.toLowerCase().includes(termo) ||
      p.clinica?.toLowerCase().includes(termo) ||
      p.especialidade?.toLowerCase().includes(termo)
    const matchEsp =
      especialidadeSelecionada === 'Todos' ||
      p.especialidade?.toLowerCase() === especialidadeSelecionada.toLowerCase()
    return matchBusca && matchEsp
  })

  function handleAgendar(medico) {
    setMedicoSelecionado(medico)
    setModalAberto(true)
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Profissionais
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Busque por médicos disponíveis na rede.
        </p>
      </div>

      {/* ── Barra de Filtros ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 max-w-5xl">
        
        {/* Input de Busca */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou clínica..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>

        {/* Select de Especialidades */}
        <div className="w-full sm:w-56">
          <select
            value={especialidadeSelecionada}
            onChange={(e) => setEspecialidadeSelecionada(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:16px]"
          >
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* ── Grid de Cards de Profissionais (2 colunas como na imagem 3) ── */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : profissionaisFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            👨‍⚕️
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhum profissional encontrado</h4>
          <p className="text-xs text-slate-400 mt-1">Tente remover os filtros ou buscar por outra especialidade.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
          {profissionaisFiltrados.map((medico) => (
            <div
              key={medico.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                {/* Avatar e Informações */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm tracking-wider">
                    {medico.iniciais || 'DR'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-900 leading-tight">
                      {medico.nome}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1">
                      {medico.especialidade}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">
                      {medico.registro} — {medico.clinica}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão Agendar Consulta */}
              <div className="pt-2">
                <button
                  onClick={() => handleAgendar(medico)}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  Agendar consulta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal de Agendamento ── */}
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
