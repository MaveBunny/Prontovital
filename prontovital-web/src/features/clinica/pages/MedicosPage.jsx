import React, { useState, useEffect } from 'react'
import { buscarProfissionais } from '../../../lib/profissionaisApi'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function MedicosPage() {
  const { usuario } = useAuth()
  const [medicos, setMedicos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const nomeClinica = usuario?.nome || usuario?.User?.nome || 'Clínica ProntoVital'

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const data = await buscarProfissionais()
        setMedicos(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Profissionais cadastrados no sistema e vinculados a {nomeClinica}.
        </p>
      </div>

      {/* ── Lista de Médicos ── */}
      {carregando ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : medicos.length === 0 ? (
        <p className="text-sm text-slate-500 py-10">Nenhum profissional encontrado.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {medicos.map((medico) => (
            <div 
              key={medico.id_profissional || medico.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <span className="text-[15px] font-bold tracking-wider">{medico.iniciais || 'DR'}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">{medico.nome}</h3>
                  <p className="text-[14px] text-slate-500 mt-0.5">
                    {medico.especialidade} · {medico.conselho || 'CRM'} {medico.registro || medico.registro_profissional}
                  </p>
                </div>
              </div>

              <div>
                <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Ativo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
