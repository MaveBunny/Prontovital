import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import Select from '../../../components/shared/Select'
import { usePaciente } from '../../../shared/hooks/usePaciente'

const TIPOS_SANGUINEOS = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
]

export default function EditarPerfilPage() {
  const navigate = useNavigate()
  const { paciente, carregando: carregandoPerfil, atualizar } = usePaciente()

  const [form, setForm] = useState({
    nome: paciente?.nome || '',
    email: paciente?.email || '',
    tipoSanguineo: paciente?.dadosSaude?.tipoSanguineo || '',
    alergias: paciente?.dadosSaude?.alergias || '',
    medicamentos: paciente?.dadosSaude?.medicamentos || '',
    comorbidades: paciente?.dadosSaude?.comorbidades || '',
  })
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
        dadosSaude: {
          tipoSanguineo: form.tipoSanguineo || undefined,
          alergias: form.alergias || undefined,
          medicamentos: form.medicamentos || undefined,
          comorbidades: form.comorbidades || undefined,
        },
      })
      setSucesso(true)
      setTimeout(() => navigate('/paciente/perfil'), 1200)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
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
        {/* Dados pessoais */}
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
          </div>
        </div>

        {/* Dados de saúde */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dados de Saúde</p>
          <div className="flex flex-col gap-4">
            <Select
              label="Tipo sanguíneo"
              name="tipoSanguineo"
              options={TIPOS_SANGUINEOS}
              placeholder="Selecione"
              value={form.tipoSanguineo}
              onChange={handleChange}
            />
            <Input
              label="Alergias"
              name="alergias"
              type="text"
              placeholder="Ex: Penicilina, Dipirona"
              value={form.alergias}
              onChange={handleChange}
            />
            <Input
              label="Medicamentos em uso"
              name="medicamentos"
              type="text"
              placeholder="Ex: Losartana 50mg, Metformina"
              value={form.medicamentos}
              onChange={handleChange}
            />
            <Input
              label="Comorbidades"
              name="comorbidades"
              type="text"
              placeholder="Ex: Diabetes, Hipertensão"
              value={form.comorbidades}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Feedback */}
        {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}
        {sucesso && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Perfil atualizado com sucesso!
          </p>
        )}

        <Button type="submit" loading={salvando} className="w-full">
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}
