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
  { name: 'endereco', label: 'Endereço' },
  { name: 'cidade', label: 'Cidade' },
  { name: 'estado', label: 'Estado', maxLength: 2 },
]

const camposProfissionais = [
  { name: 'cpf', label: 'CPF', required: true },
  { name: 'conselho', label: 'Conselho profissional', required: true },
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

  const [formulario, setFormulario] = useState(() =>
    mapearFormulario(usuario)
  )
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

      // A API retorna os dados do usuário e do profissional no mesmo objeto.
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
      setSucesso('Perfil atualizado com sucesso.')
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

  function renderizarCampos(campos) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {campos.map((campo) => (
          <div key={campo.name}>
            <label
              htmlFor={campo.name}
              className="mb-2 block text-sm font-medium text-slate-700"
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
              value={formulario[campo.name]}
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
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-600">
          Área do profissional
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Meu perfil
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consulte e atualize seus dados pessoais e profissionais.
        </p>
      </header>

      {carregandoPerfil ? (
        <p className="text-sm text-slate-500">
          Carregando dados do perfil...
        </p>
      ) : (
        <form onSubmit={salvarPerfil} className="mx-auto max-w-4xl space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Dados pessoais
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informações básicas da sua conta.
              </p>
            </div>

            {renderizarCampos(camposPessoais)}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Dados profissionais
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informações do seu registro profissional.
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
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {sucesso}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}

      {!carregandoPerfil && erro && (
        <p className="mt-4 text-sm text-slate-500">
          Confira a mensagem acima antes de tentar novamente.
        </p>
      )}
    </div>
  )
}
