import { useState, useEffect } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function LoginPage({ emailInicial = '', onClearMensagemSucesso }) {
  const { login, logout, usuario, autenticado, carregando } = useAuth()
  const [form, setForm] = useState({ loginId: emailInicial, senha: '' })
  const [erro, setErro] = useState('')
  const [sucessoLogin, setSucessoLogin] = useState(false)

  useEffect(() => {
    if (emailInicial) {
      setForm((prev) => ({ ...prev, loginId: emailInicial }))
    }
  }, [emailInicial])

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    if (onClearMensagemSucesso) onClearMensagemSucesso()
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await login({ email: form.loginId, senha: form.senha })
      setSucessoLogin(true)
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'E-mail/CPF ou senha incorretos.')
    }
  }

  function handleSair() {
    logout()
    setSucessoLogin(false)
    setForm({ loginId: '', senha: '' })
  }

  // Se o usuário estiver autenticado
  if (autenticado && usuario) {
    return (
      <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-emerald-950">Login realizado com sucesso!</h3>
          <p className="text-sm text-emerald-800 mt-1 font-medium">
            Bem-vindo(a), <span className="font-bold text-emerald-950">{usuario.nome || 'Usuário'}</span>
          </p>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs text-emerald-700 space-y-1">
            <p><span className="font-semibold">Perfil:</span> <span className="uppercase font-bold tracking-wider">{usuario.tipo || 'paciente'}</span></p>
            {usuario.email && <p><span className="font-semibold">E-mail:</span> {usuario.email}</p>}
          </div>
        </div>

        <Button onClick={handleSair} variant="secondary" className="w-full mt-2">
          Desconectar / Sair
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="E-mail ou CPF"
        name="loginId"
        type="text"
        placeholder="email@exemplo.com ou 000.000.000-00"
        value={form.loginId}
        onChange={handleChange}
        required
      />
      <Input
        label="Senha"
        name="senha"
        type="password"
        placeholder="••••••••"
        value={form.senha}
        onChange={handleChange}
        required
      />

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{erro}</p>
      )}

      <Button type="submit" loading={carregando} className="w-full mt-1">
        Entrar
      </Button>

      <button
        type="button"
        className="text-sm text-blue-600 hover:underline text-center"
      >
        Esqueceu a senha?
      </button>
    </form>
  )
}
