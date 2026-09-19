import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function LoginPage() {
  const { login, carregando } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const data = await login(form)
      const tipo = data.usuario?.tipo
      if (tipo === 'profissional') return navigate('/profissional/dashboard')
      if (tipo === 'clinica') return navigate('/clinica/dashboard')
      if (tipo === 'admin') return navigate('/admin/clinicas')
      navigate('/paciente/dashboard')
    } catch (err) {
      setErro(err.response?.data?.message || 'E-mail/CPF ou senha incorretos.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="E-mail ou CPF"
        name="email"
        type="text"
        placeholder="email@exemplo.com"
        value={form.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Senha"
        name="senha"
        type="password"
        placeholder="Sua senha"
        value={form.senha}
        onChange={handleChange}
        required
      />

      {erro && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>
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
