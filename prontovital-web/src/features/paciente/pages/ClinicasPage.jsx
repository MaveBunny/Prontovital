import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarClinicas, MOCK_CLINICAS } from '../../../lib/clinicasApi'

export default function ClinicasPage() {
  const navigate = useNavigate()
  const [clinicas, setClinicas] = useState(MOCK_CLINICAS)
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const dados = await listarClinicas()
        setClinicas(dados || [])
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const clinicasFiltradas = clinicas.filter((c) => {
    const termo = busca.toLowerCase()
    const nomeMatch = c.nome?.toLowerCase().includes(termo)
    const bairroMatch = c.bairro?.toLowerCase().includes(termo)
    const enderecoMatch = c.endereco?.toLowerCase().includes(termo)
    const espMatch = c.especialidades?.some((e) => e.toLowerCase().includes(termo))
    return nomeMatch || bairroMatch || enderecoMatch || espMatch
  })

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Clínicas
        </h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Selecione uma clínica para ver os profissionais e agendar sua consulta.
        </p>
      </div>

      {/* ── Barra de Busca ── */}
      <div className="mb-8 max-w-4xl">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou bairro..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* ── Grid de Clínicas ── */}
      {carregando ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : clinicasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            🔍
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhuma clínica encontrada</h4>
          <p className="text-xs text-slate-400 mt-1">Tente buscar por outro termo ou bairro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
          {clinicasFiltradas.map((clinica) => {
            const qtdProf = clinica.totalProfissionais || (clinica.id === 1 ? 2 : 1)
            const labelProf = qtdProf === 1 ? '1 profissional >' : `${qtdProf} profissionais >`

            return (
              <div
                key={clinica.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Topo do Card: Ícone e Títulos */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                        {clinica.nome}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {clinica.bairro} — {clinica.endereco}
                      </p>
                    </div>
                  </div>

                  {/* Tags de Especialidades */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(clinica.especialidades || ['Clínica Geral']).map((esp) => (
                      <span
                        key={esp}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rodapé do Card: Telefone e Link */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {clinica.telefone || '(81) 3333-0000'}
                  </span>
                  <button
                    onClick={() => navigate(`/paciente/profissionais?clinica=${encodeURIComponent(clinica.nome)}`)}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {labelProf}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
