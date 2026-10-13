import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

export default function MedicosPage() {
  const { usuario } = useAuth()
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [medicoSelecionado, setMedicoSelecionado] = useState(null)

  const nomeClinica = usuario?.nome || 'Clínica'
  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user

  useEffect(() => {
    async function carregarMedicosDaClinica() {
      setLoading(true)
      try {
        const { data } = await api.get('/profissionais')
        if (Array.isArray(data)) {
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
              conselho: p.conselho || 'CRM',
              registro: p.registro_profissional || 'Não informado',
              uf: p.uf_registro || '',
              cpf: p.cpf || 'Não informado',
              email: p.User?.email || 'Não informado',
              telefone: p.User?.telefone || 'Não informado',
              cidade: p.User?.cidade || '',
              estado: p.User?.estado || '',
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

      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">
          Profissionais vinculados a {nomeClinica}.
        </p>
      </div>

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
                onClick={() => setMedicoSelecionado(medico)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-[15px] font-bold tracking-wider">{medico.iniciais}</span>
                  </div>

                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {medico.nome}
                    </h3>
                    <p className="text-[14px] text-slate-500 mt-0.5">
                      CRM: {medico.crm}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {medico.status}
                  </span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
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

      {/* ── Modal de Detalhes do Profissional (sem o campo de endereço) ── */}
      {medicoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMedicoSelecionado(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-[zoomIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                  <span className="text-[16px] font-bold tracking-wider">{medicoSelecionado.iniciais}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{medicoSelecionado.nome}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 font-medium">
                      {medicoSelecionado.conselho || 'CRM'}: {medicoSelecionado.crm}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                      {medicoSelecionado.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMedicoSelecionado(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Informações (exceto endereço residencial) */}
            <div className="py-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Dados Profissionais
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Conselho</span>
                    <span className="block text-sm font-bold text-slate-800">{medicoSelecionado.conselho || 'CRM'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Nº Registro / UF</span>
                    <span className="block text-sm font-bold text-slate-800">
                      {medicoSelecionado.registro} {medicoSelecionado.uf ? `(${medicoSelecionado.uf})` : ''}
                    </span>
                  </div>
                  {medicoSelecionado.cpf && medicoSelecionado.cpf !== 'Não informado' && (
                    <div className="col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="block text-xs text-slate-500 font-medium">CPF</span>
                      <span className="block text-sm font-bold text-slate-800">{medicoSelecionado.cpf}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Contato e Cidade
                </h4>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] text-slate-500 font-medium">E-mail</span>
                      <span className="block text-sm font-semibold text-slate-800 truncate">{medicoSelecionado.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] text-slate-500 font-medium">Telefone</span>
                      <span className="block text-sm font-semibold text-slate-800">{medicoSelecionado.telefone}</span>
                    </div>
                  </div>

                  {(medicoSelecionado.cidade || medicoSelecionado.estado) && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] text-slate-500 font-medium">Cidade / UF</span>
                        <span className="block text-sm font-semibold text-slate-800">
                          {[medicoSelecionado.cidade, medicoSelecionado.estado].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setMedicoSelecionado(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

    </div>
  )
}
