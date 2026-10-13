import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

export default function MedicosPage() {
  const { usuario } = useAuth()
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Nome da clínica para exibir no subtítulo
  const nomeClinica = usuario?.nome || 'Clínica'
  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user

  useEffect(() => {
    async function carregarMedicosDaClinica() {
      setLoading(true)
      try {
        const { data } = await api.get('/profissionais')
        if (Array.isArray(data)) {
          // Filtra profissionais vinculados a esta clínica específica
          const vinculados = data.filter((p) => 
            p.Clinicas?.some((c) => String(c.id_clinica) === String(idClinica) || c.User?.nome?.trim() === nomeClinica.trim())
          ).map((p) => {
            const limpo = (p.User?.nome || 'Médico').replace(/^(Dr\.|Dra\.)\s+/i, '').trim()
            const partes = limpo.split(' ').filter(Boolean)
            const iniciais = partes.length >= 2 
              ? (partes[0][0] + partes[1][0]).toUpperCase()
              : limpo.substring(0, 2).toUpperCase()

            const crmFormatado = p.uf_registro && p.registro_profissional
              ? `${p.uf_registro}-${p.registro_profissional}`
              : (p.registro_profissional || 'Não informado')

            return {
              id: p.id_profissional,
              iniciais,
              nome: p.User?.nome || 'Médico(a)',
              crm: crmFormatado,
              status: p.User?.ativo !== false ? 'Ativo' : 'Inativo'
            }
          })

          setMedicos(vinculados)
        }
      } catch (err) {
        console.error('Erro ao carregar médicos vinculados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarMedicosDaClinica()
  }, [idClinica, nomeClinica])

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Profissionais vinculados a {nomeClinica}.
        </p>
      </div>

      {/* ── Lista de Médicos ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {medicos.length > 0 ? (
            medicos.map((medico) => (
              <div 
                key={medico.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between"
              >
                
                <div className="flex items-center gap-4">
                  {/* Badge Iniciais */}
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <span className="text-[15px] font-bold tracking-wider">{medico.iniciais}</span>
                  </div>
                  
                  {/* Informações */}
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">{medico.nome}</h3>
                    <p className="text-[14px] text-slate-500 mt-0.5">
                      CRM: {medico.crm}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {medico.status}
                  </span>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 font-medium">Nenhum profissional vinculado a esta clínica.</p>
            </div>
          )}
        </div>
      )}

      {/* Botão flutuante de ajuda */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

    </div>
  )
}
