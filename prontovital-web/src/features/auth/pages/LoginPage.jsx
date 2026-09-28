import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function LoginPage() {
  const { login, carregando } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ loginId: '', senha: '' })
  const [erro, setErro] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const data = await login({ email: form.loginId, senha: form.senha })
      const tipo = data.usuario?.tipo || 'paciente'
      if (tipo === 'profissional') return navigate('/profissional/dashboard')
      if (tipo === 'clinica') return navigate('/clinica/dashboard')
      if (tipo === 'admin') return navigate('/admin/clinicas')
      navigate('/paciente/pre-triagem')
    } catch (err) {
      setErro(
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        'E-mail/CPF ou senha incorretos.'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl animate-[fadeIn_0.2s_ease]">
          {erro}
        </p>
      )}

      <Button type="submit" loading={carregando} className="w-full mt-1">
        Entrar
      </Button>

      <button
        type="button"
        className="text-xs text-blue-600 hover:underline text-center mt-1"
      >
        Esqueceu a senha?
      </button>
    </form>
  )
}
