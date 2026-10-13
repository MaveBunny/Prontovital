
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
    const { name, value } = e.target

    setErro('')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    try {
      const data = await login({
        email: form.email.trim(),
        senha: form.senha,
      })

      const perfil = data.usuario?.perfil

      if (perfil === 'profissional') {
        navigate('/profissional/agenda')
      } else if (perfil === 'clinica') {
        navigate('/clinica/dashboard')
      } else if (perfil === 'admin') {
        navigate('/admin/clinicas')
      } else if (perfil === 'paciente') {
        navigate('/paciente/dashboard')
      } else {
        setErro('O perfil retornado pela API não é reconhecido.')
      }
    } catch (err) {
      setErro(
        err.response?.data?.erro ||
        err.response?.data?.message ||
        err.message ||
        'Não foi possível realizar o login. Tente novamente.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="seu@email.com"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        required
      />

      <Input
        label="Senha"
        name="senha"
        type="password"
        placeholder="Digite sua senha"
        value={form.senha}
        onChange={handleChange}
        autoComplete="current-password"
        required
      />

      {erro && (
        <p
          role="alert"
          className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl"
        >
          {erro}
        </p>
      )}

      <Button type="submit" loading={carregando} className="w-full mt-1">
        Entrar
      </Button>

      <button
        type="button"
        className="text-sm text-blue-600 hover:underline text-center"
        onClick={() => {
          setErro('A recuperação de senha ainda não está disponível nesta tela.')
        }}
      >
        Esqueceu a senha?
      </button>
    </form>
  )
}
