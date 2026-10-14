import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'
import {
  listarEspecialidades,
  vincularEspecialidade,
  LISTA_ESPECIALIDADES_PADRAO
} from '../../../lib/profissionaisApi'

export default function MedicosPage() {
  const { usuario } = useAuth()
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [medicoSelecionado, setMedicoSelecionado] = useState(null)

  const [listaEspecialidades, setListaEspecialidades] = useState(LISTA_ESPECIALIDADES_PADRAO)
  const [modoEdicaoEsp, setModoEdicaoEsp] = useState(false)
  const [espSelecionada, setEspSelecionada] = useState('1')
  const [salvandoEsp, setSalvandoEsp] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [erroEsp, setErroEsp] = useState('')

  const nomeClinica = usuario?.nome || 'Clínica'
  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user

  useEffect(() => {
    async function carregarEspecialidades() {
      try {
        const dados = await listarEspecialidades()
        if (Array.isArray(dados) && dados.length > 0) {
          setListaEspecialidades(dados)
        }
      } catch {
        setListaEspecialidades(LISTA_ESPECIALIDADES_PADRAO)
      }
    }
    carregarEspecialidades()
  }, [])

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

            const espNome = p.Especialidade?.nome || p.especialidade || 'Sem especialidade vinculada'
            const idEsp = p.Especialidade?.id_especialidade || p.id_especialidade || null

            return {
              id: p.id_profissional,
              iniciais,
              nome: p.User?.nome || 'Médico(a)',
              crm: crmFormatado,
              conselho: p.conselho || 'CRM',
              registro: p.registro_profissional || 'Não informado',
              uf: p.uf_registro || '',
              cpf: p.cpf || 'Não informado',
              id_especialidade: idEsp,
              especialidade: espNome,
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

  function handleAbrirModal(medico) {
    setMedicoSelecionado(medico)
    setEspSelecionada(String(medico.id_especialidade || '1'))
    setModoEdicaoEsp(false)
    setMensagemSucesso('')
    setErroEsp('')
  }

  async function handleSalvarEspecialidade() {
    if (!medicoSelecionado || !espSelecionada) return
    setSalvandoEsp(true)
    setErroEsp('')
    setMensagemSucesso('')

    try {
      await vincularEspecialidade(medicoSelecionado.id, espSelecionada)

      const espEncontrada = listaEspecialidades.find(
        (e) => String(e.id_especialidade) === String(espSelecionada)
      )
      const novoNome = espEncontrada?.nome || 'Especialidade vinculada'

      setMedicoSelecionado((prev) => ({
        ...prev,
        id_especialidade: Number(espSelecionada),
        especialidade: novoNome,
      }))

      setMedicos((prev) =>
        prev.map((m) =>
          m.id === medicoSelecionado.id
            ? { ...m, id_especialidade: Number(espSelecionada), especialidade: novoNome }
            : m
        )
      )

      setMensagemSucesso('Especialidade vinculada com sucesso!')
      setModoEdicaoEsp(false)
    } catch (err) {
      console.error('Erro ao vincular especialidade:', err)
      const msg = err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao vincular especialidade ao médico.'
      setErroEsp(msg)
    } finally {
      setSalvandoEsp(false)
    }
  }

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
                onClick={() => handleAbrirModal(medico)}
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
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-[13px] text-slate-500">
                        CRM: {medico.crm}
                      </p>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
                        {medico.especialidade}
                      </span>
                    </div>
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

      {medicoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMedicoSelecionado(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-[zoomIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {mensagemSucesso && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {mensagemSucesso}
              </div>
            )}

            {erroEsp && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
                <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {erroEsp}
              </div>
            )}

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

                  <div className="col-span-2 pt-2.5 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs text-slate-500 font-medium">Especialidade</span>
                        <span className="block text-sm font-bold text-blue-700 mt-0.5">
                          {medicoSelecionado.especialidade}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModoEdicaoEsp((prev) => !prev)}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                        <span>{modoEdicaoEsp ? 'Cancelar' : 'Vincular Especialidade'}</span>
                      </button>
                    </div>

                    {modoEdicaoEsp && (
                      <div className="mt-3 p-3 bg-white border border-blue-200 rounded-xl space-y-2.5 shadow-xs animate-[fadeIn_0.2s_ease]">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Escolha a nova especialidade:
                        </label>
                        <select
                          value={espSelecionada}
                          onChange={(e) => setEspSelecionada(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {listaEspecialidades.map((esp) => (
                            <option key={esp.id_especialidade} value={esp.id_especialidade}>
                              {esp.nome}
                            </option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setModoEdicaoEsp(false)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSalvarEspecialidade}
                            disabled={salvandoEsp}
                            className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg shadow-sm cursor-pointer"
                          >
                            {salvandoEsp ? 'Salvando...' : 'Confirmar Vínculo'}
                          </button>
                        </div>
                      </div>
                    )}
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

    </div>
  )
}
