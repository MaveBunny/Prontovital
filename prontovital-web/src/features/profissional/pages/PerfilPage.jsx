import { useEffect, useState } from 'react'
import api from '../../../lib/api'
import { useAuth } from '../../../shared/hooks/useAuth'

function mapearFormulario(dados = {}) {
  const perfil = dados?.profissional ?? dados
  const usuarioDados =
    perfil?.User ??
    perfil?.user ??
    dados?.User ??
    dados?.user ??
    dados?.usuario ??
    dados

  return {
    nome: usuarioDados?.nome ?? '',
    email: usuarioDados?.email ?? '',
    telefone: usuarioDados?.telefone ?? '',
    endereco: usuarioDados?.endereco ?? '',
    cidade: usuarioDados?.cidade ?? '',
    estado: usuarioDados?.estado ?? '',
    cpf: perfil?.cpf ?? '',
    conselho: perfil?.conselho ?? '',
    registro_profissional: perfil?.registro_profissional ?? '',
    uf_registro: perfil?.uf_registro ?? '',
  }
}

const camposPessoais = [
  { name: 'nome', label: 'Nome completo', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'telefone', label: 'Telefone' },
  { name: 'endereco', label: 'Endereço residencial' },
  { name: 'cidade', label: 'Cidade' },
  { name: 'estado', label: 'Estado (UF)', maxLength: 2 },
]

const camposProfissionais = [
  { name: 'cpf', label: 'CPF', required: true },
  { name: 'conselho', label: 'Conselho profissional (ex: CRM)', required: true },
  {
    name: 'registro_profissional',
    label: 'Número do registro',
    required: true,
  },
  {
    name: 'uf_registro',
    label: 'UF do registro',
    maxLength: 2,
    required: true,
  },
]

export default function PerfilPage() {
  const { usuario, atualizarUsuario } = useAuth()

  const [abaAtiva, setAbaAtiva] = useState('perfil')
  const [formulario, setFormulario] = useState(() => mapearFormulario(usuario))
  const [clinicas, setClinicas] = useState([])
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    let cancelado = false

    async function carregarPerfil() {
      if (!usuario?.id_profissional) {
        setErro('Não foi possível identificar o profissional autenticado.')
        setCarregandoPerfil(false)
        return
      }

      setCarregandoPerfil(true)
      setErro('')

      try {
        const { data } = await api.get(
          `/profissionais/${usuario.id_profissional}`
        )

        if (!cancelado) {
          const dadosFormulario = mapearFormulario(data)
          setFormulario(dadosFormulario)

          if (Array.isArray(data.Clinicas)) {
            setClinicas(data.Clinicas)
          }

          atualizarUsuario({
            nome: dadosFormulario.nome || usuario?.nome,
            email: dadosFormulario.email || usuario?.email,
          })
        }
      } catch (error) {
        if (!cancelado) {
          setErro(
            error.response?.data?.erro ||
              error.response?.data?.mensagem ||
              'Não foi possível carregar os dados do perfil.'
          )
        }
      } finally {
        if (!cancelado) {
          setCarregandoPerfil(false)
        }
      }
    }

    carregarPerfil()

    return () => {
      cancelado = true
    }
  }, [usuario?.id_profissional, atualizarUsuario])

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))

    setErro('')
    setSucesso('')
  }

  async function salvarPerfil(event) {
    event.preventDefault()
    setErro('')
    setSucesso('')

    const nome = formulario.nome.trim()
    const email = formulario.email.trim()
    const cpf = formulario.cpf.trim()
    const conselho = formulario.conselho.trim()
    const registro = formulario.registro_profissional.trim()
    const ufRegistro = formulario.uf_registro.trim().toUpperCase()

    if (!nome || !email) {
      setErro('Preencha o nome completo e o e-mail.')
      return
    }

    if (!cpf || !conselho || !registro || !ufRegistro) {
      setErro('Preencha todos os campos profissionais obrigatórios.')
      return
    }

    if (ufRegistro.length !== 2) {
      setErro('Informe a UF do registro com duas letras.')
      return
    }

    const payload = {
      nome,
      email,
      telefone: formulario.telefone.trim(),
      endereco: formulario.endereco.trim(),
      cidade: formulario.cidade.trim(),
      estado: formulario.estado.trim().toUpperCase(),
      profissional: {
        cpf,
        conselho,
        registro_profissional: registro,
        uf_registro: ufRegistro,
      },
    }

    setSalvando(true)

    try {
      const { data } = await api.patch('/usuarios/perfil', payload)
      const dadosSalvos = mapearFormulario(data)

      atualizarUsuario({
        nome: dadosSalvos.nome || nome,
        email: dadosSalvos.email || email,
        telefone: dadosSalvos.telefone,
        endereco: dadosSalvos.endereco,
        cidade: dadosSalvos.cidade,
        estado: dadosSalvos.estado,
      })

      setFormulario(dadosSalvos)
      setSucesso('Perfil atualizado com sucesso!')
    } catch (error) {
      setErro(
        error.response?.data?.mensagem ||
          error.response?.data?.erro ||
          'Não foi possível atualizar seu perfil.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const nomeExibicao = formulario.nome || usuario?.nome || 'Profissional'
  const limpo = nomeExibicao.replace(/^(Dr\.|Dra\.)\s+/i, '').trim()
  const partes = limpo.split(' ').filter(Boolean)
  const iniciais = partes.length >= 2
    ? (partes[0][0] + partes[1][0]).toUpperCase()
    : limpo.substring(0, 2).toUpperCase() || 'DR'

  const crmFormatado = formulario.registro_profissional
    ? `${formulario.conselho || 'CRM'}: ${formulario.uf_registro ? `${formulario.uf_registro}-` : ''}${formulario.registro_profissional}`
    : 'Registro não informado'

  function renderizarCampos(campos) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {campos.map((campo) => (
          <div key={campo.name}>
            <label
              htmlFor={campo.name}
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {campo.label}
              {campo.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>

            <input
              id={campo.name}
              name={campo.name}
              type={campo.type || 'text'}
              value={formulario[campo.name] || ''}
              onChange={atualizarCampo}
              required={campo.required}
              maxLength={campo.maxLength}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12 w-full animate-[fadeIn_0.3s_ease-out]">
      <header className="mb-6">
        <p className="mb-1 text-sm font-semibold text-blue-600">
          Área do profissional
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Meu perfil
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Consulte e gerencie suas informações pessoais e profissionais.
        </p>
      </header>

      <div className="inline-flex p-1 bg-slate-100 rounded-xl mb-8 border border-slate-200/60 max-w-sm w-full">
        <button
          type="button"
          onClick={() => { setAbaAtiva('perfil'); setErro(''); setSucesso('') }}
          className={`flex-1 py-2.5 px-4 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'perfil'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          Meu Perfil
        </button>

        <button
          type="button"
          onClick={() => { setAbaAtiva('editar'); setErro(''); setSucesso('') }}
          className={`flex-1 py-2.5 px-4 text-center rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'editar'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
          Editar Perfil
        </button>
      </div>

      {carregandoPerfil ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {abaAtiva === 'perfil' && (
            <div className="max-w-4xl space-y-6 animate-[fadeIn_0.2s_ease-out]">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
                    <span className="text-xl font-bold tracking-wider">{iniciais}</span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {nomeExibicao}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {crmFormatado}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Ativo
                  </span>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva('editar')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                    Editar perfil
                  </button>
                </div>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">
                    Dados pessoais
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Informações básicas de contato e residência.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Nome completo</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.nome || '—'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">E-mail</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.email || '—'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Telefone</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.telefone || 'Não informado'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Cidade / Estado</span>
                    <span className="block text-sm font-bold text-slate-800">
                      {[formulario.cidade, formulario.estado].filter(Boolean).join(' - ') || 'Não informado'}
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Endereço residencial</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.endereco || 'Não informado'}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">
                    Dados profissionais
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Registro de classe e conselho regional de saúde.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">CPF</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.cpf || '—'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Conselho profissional</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.conselho || 'CRM'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Número do registro</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.registro_profissional || '—'}</span>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">UF do registro</span>
                    <span className="block text-sm font-bold text-slate-800">{formulario.uf_registro || '—'}</span>
                  </div>
                </div>
              </section>

              {clinicas.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">
                      Clínicas vinculadas
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Locais de atendimento associados ao seu perfil.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {clinicas.map((c, i) => (
                      <div
                        key={c.id_clinica || i}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-700 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A1.167 1.167 0 0 0 18.333 9.167H5.667A1.167 1.167 0 0 0 4.5 10.333V21" />
                        </svg>
                        {c.User?.nome || c.nome || 'Clínica Parceira'}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}

          {abaAtiva === 'editar' && (
            <form onSubmit={salvarPerfil} className="max-w-4xl space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    Dados pessoais
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Altere suas informações cadastrais e de contato.
                  </p>
                </div>

                {renderizarCampos(camposPessoais)}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    Dados profissionais
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Altere as informações do seu registro de classe.
                  </p>
                </div>

                {renderizarCampos(camposProfissionais)}
              </section>

              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {erro}
                </div>
              )}

              {sucesso && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{sucesso}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva('perfil')}
                    className="font-bold text-emerald-700 hover:text-emerald-900 underline text-xs cursor-pointer"
                  >
                    Ver perfil atualizado →
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAbaAtiva('perfil')}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-xs cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {!carregandoPerfil && erro && abaAtiva === 'perfil' && (
        <p className="mt-4 text-sm text-slate-500">
          Confira a mensagem acima antes de tentar novamente.
        </p>
      )}
    </div>
  )
}
