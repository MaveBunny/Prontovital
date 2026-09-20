import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import { useAuth } from '../../../shared/hooks/useAuth'
import { mascaraCPF } from '../../../shared/utils/cpfMask'

export default function LoginPage() {
  const { login, carregando } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ cpf: '', senha: '' })
  const [erro, setErro] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    setForm((prev) => ({
      ...prev,
      [name]: name === 'cpf' ? mascaraCPF(value) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const data = await login({ email: form.cpf.replace(/\D/g, ''), senha: form.senha })
      const tipo = data.usuario?.tipo
      if (tipo === 'profissional') return navigate('/profissional/dashboard')
      if (tipo === 'clinica') return navigate('/clinica/dashboard')
      if (tipo === 'admin') return navigate('/admin/clinicas')
      navigate('/paciente/dashboard')
    } catch (err) {
      setErro(err.response?.data?.message || 'CPF ou senha incorretos.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="CPF"
        name="cpf"
        type="text"
        placeholder="000.000.000-00"
        value={form.cpf}
        onChange={handleChange}
        maxLength={14}
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
