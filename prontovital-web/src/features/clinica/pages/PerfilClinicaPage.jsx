import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

export default function PerfilClinicaPage() {
  const { usuario } = useAuth()
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)

  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user
  const nomeClinica = usuario?.nome

  useEffect(() => {
    async function carregarDadosClinica() {
      setLoading(true)
      try {
        const { data } = await api.get('/clinicas')
        if (Array.isArray(data)) {
          const encontrada = data.find(c =>
            String(c.id_clinica) === String(idClinica) ||
            String(c.id_user) === String(idClinica) ||
            c.User?.nome?.trim().toLowerCase() === nomeClinica?.trim().toLowerCase()
          )
          if (encontrada) {
            setClinica(encontrada)
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados da clínica:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosClinica()
  }, [idClinica, nomeClinica])

  const nome = clinica?.User?.nome || usuario?.nome || 'Clínica'
  const cnpj = clinica?.cnpj || usuario?.cnpj || 'Não informado'
  const endereco = clinica?.User?.endereco || usuario?.endereco || 'Não informado'
  const bairro = clinica?.bairro || usuario?.bairro || 'Não informado'
  const telefone = clinica?.User?.telefone || usuario?.telefone || 'Não informado'
  const email = clinica?.User?.email || usuario?.email || 'Não informado'

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">

      <div className="mb-10">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Perfil da Clínica</h2>
        <p className="text-[15px] text-slate-500 mt-1">Informações cadastrais da clínica.</p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Carregando perfil...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl overflow-hidden">

          <div className="p-8 flex items-center gap-6">
            <div className="w-[72px] h-[72px] rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{nome}</h3>
              <p className="text-[15px] text-slate-500 mt-1">CNPJ: {cnpj}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-8"></div>

          <div className="p-8 flex flex-col gap-6">

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                <p className="text-[15px] font-bold text-slate-800 mt-0.5">{endereco}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bairro</p>
                <p className="text-[15px] font-bold text-slate-800 mt-0.5">{bairro}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.077-7.077l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Telefone</p>
                <p className="text-[15px] font-bold text-slate-800 mt-0.5">{telefone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-mail</p>
                <p className="text-[15px] font-bold text-slate-800 mt-0.5">{email}</p>
              </div>
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
