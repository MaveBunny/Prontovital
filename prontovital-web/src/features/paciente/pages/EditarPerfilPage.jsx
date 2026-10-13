import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import Select from '../../../components/shared/Select'
import { usePaciente } from '../../../shared/hooks/usePaciente'
import { getPerfilDinamico } from '../../../lib/pacientesApi'

export default function EditarPerfilPage() {
  const navigate = useNavigate()
  const { paciente, carregando: carregandoPerfil, atualizar } = usePaciente()

  const perfilInicial = getPerfilDinamico()

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cpf: '',
    data_nascimento: '',
    sexo: 'Masculino',
    observacoes: '',
  })

  useEffect(() => {
    const base = paciente || perfilInicial
    if (!base) return
    setForm((prev) => ({
      nome: prev.nome || base.nome || '',
      email: prev.email || base.email || '',
      telefone: prev.telefone || base.telefone || '',
      endereco: prev.endereco || base.endereco || '',
      cidade: prev.cidade || base.cidade || '',
      estado: prev.estado || base.estado || '',
      cpf: prev.cpf || base.cpf || '',
      data_nascimento: prev.data_nascimento
        ? prev.data_nascimento
        : base.data_nascimento
          ? String(base.data_nascimento).split('T')[0]
          : '',
      sexo: prev.sexo !== 'Masculino' && prev.sexo ? prev.sexo : base.sexo || 'Masculino',
      observacoes: prev.observacoes || base.observacoes || '',
    }))
  }, [paciente])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    setSucesso(false)
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await atualizar({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        paciente: {
          cpf: form.cpf,
          data_nascimento: form.data_nascimento,
          sexo: form.sexo,
          observacoes: form.observacoes,
        },
      })
      setSucesso(true)
      setTimeout(() => navigate('/paciente/perfil'), 1200)
    } catch (err) {
      setErro(
        err.response?.data?.erro ||
          err.response?.data?.mensagem ||
          err.response?.data?.message ||
          'Erro ao salvar. Tente novamente.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/paciente/perfil')}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-800">Editar Perfil</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dados Pessoais</p>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              name="nome"
              type="text"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={handleChange}
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Telefone"
              name="telefone"
              type="text"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={handleChange}
              required
            />
            <Input
              label="Endereço"
              name="endereco"
              type="text"
              placeholder="Rua e número"
              value={form.endereco}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cidade"
                name="cidade"
                type="text"
                placeholder="Sua cidade"
                value={form.cidade}
                onChange={handleChange}
                required
              />
              <Input
                label="Estado (UF)"
                name="estado"
                type="text"
                placeholder="Ex: PE"
                value={form.estado}
                onChange={handleChange}
                maxLength={2}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dados de Paciente</p>
          <div className="flex flex-col gap-4">
            <Input
              label="CPF"
              name="cpf"
              type="text"
              placeholder="Somente números"
              value={form.cpf}
              onChange={handleChange}
              required
            />
            <Input
              label="Data de Nascimento (AAAA-MM-DD)"
              name="data_nascimento"
              type="date"
              value={form.data_nascimento}
              onChange={handleChange}
              required
            />
            <Select
              label="Sexo"
              name="sexo"
              options={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Feminino', label: 'Feminino' },
                { value: 'Outro', label: 'Outro' },
              ]}
              value={form.sexo}
              onChange={handleChange}
              required
            />
            <Input
              label="Observações Médicas"
              name="observacoes"
              type="text"
              placeholder="Alergias, comorbidades..."
              value={form.observacoes}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}
        {sucesso && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Perfil atualizado com sucesso!
          </p>
        )}

        <Button type="submit" loading={salvando || carregandoPerfil} className="w-full">
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
