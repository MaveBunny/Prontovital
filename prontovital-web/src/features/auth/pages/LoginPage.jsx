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
  const [mostrarSenha, setMostrarSenha] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const data = await login({ email: form.email, senha: form.senha })
      const tipo = data.usuario?.perfil || data.usuario?.tipo || 'paciente'
      if (tipo === 'profissional') return navigate('/profissional/agenda')
      if (tipo === 'clinica') return navigate('/clinica/dashboard')
      if (tipo === 'admin') return navigate('/admin/agendamentos')
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
        label="E-mail"
        name="email"
        type="text"
        placeholder="email@exemplo.com"
        value={form.email}
        onChange={handleChange}
        required
      />
      <div className="relative">
        <Input
          label="Senha"
          name="senha"
          type={mostrarSenha ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.senha}
          onChange={handleChange}
          required
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setMostrarSenha((v) => !v)}
          aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {mostrarSenha ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          )}
        </button>
      </div>

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
