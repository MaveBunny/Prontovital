import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import Select from '../../../components/shared/Select'
import { cadastrarPaciente } from '../../../lib/pacientesApi'
import { mascaraCPF } from '../../../shared/utils/cpfMask'
import LoginPage from './LoginPage'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS = [
  {
    id: 'paciente',
    titulo: 'Paciente',
    descricao: 'Pré-triagem e agendamento',
    badge: { texto: 'Paciente', cor: 'text-blue-700 bg-blue-100' },
    icone: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    id: 'profissional',
    titulo: 'Profissional de Saúde',
    descricao: 'Médico ou especialista de clínica',
    badge: { texto: 'Profissional', cor: 'text-green-700 bg-green-100' },
    icone: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15" />
      </svg>
    ),
  },
  {
    id: 'clinica',
    titulo: 'Clínica',
    descricao: 'Cadastro de estabelecimento',
    badge: { texto: 'Clínica', cor: 'text-purple-700 bg-purple-100' },
    icone: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
]

const TIPOS_SANGUINEOS = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
]

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function BotaoVoltar({ onVoltar, tipo }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button onClick={onVoltar} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </button>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tipo.badge.cor}`}>
        {tipo.badge.texto}
      </span>
    </div>
  )
}

function FormPaciente({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', senha: '',
    tipoSanguineo: '', alergias: '', medicamentos: '', comorbidades: '',
  })

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
    setLoading(true)
    try {
      await cadastrarPaciente({
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ''),
        email: form.email,
        senha: form.senha,
        dadosSaude: {
          tipoSanguineo: form.tipoSanguineo || undefined,
          alergias: form.alergias || undefined,
          medicamentos: form.medicamentos || undefined,
          comorbidades: form.comorbidades || undefined,
        },
      })
      onSuccess()
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Nome completo" name="nome" type="text" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />
      <Input label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} maxLength={14} required />
      <Input label="E-mail" name="email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={handleChange} required />
      <Input label="Senha" name="senha" type="password" placeholder="Crie uma senha" value={form.senha} onChange={handleChange} required minLength={6} />

      <div className="pt-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados de Saúde (Opcional)</p>
        <div className="flex flex-col gap-4">
          <Select label="Tipo sanguíneo" name="tipoSanguineo" options={TIPOS_SANGUINEOS} placeholder="Selecione" value={form.tipoSanguineo} onChange={handleChange} />
          <Input label="Alergias" name="alergias" type="text" placeholder="Ex: Penicilina, Dipirona" value={form.alergias} onChange={handleChange} />
          <Input label="Medicamentos em uso" name="medicamentos" type="text" placeholder="Ex: Losartana 50mg, Metformina" value={form.medicamentos} onChange={handleChange} />
          <Input label="Comorbidades" name="comorbidades" type="text" placeholder="Ex: Diabetes, Hipertensão" value={form.comorbidades} onChange={handleChange} />
        </div>
      </div>

      {erro && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>}
      <Button type="submit" loading={loading} className="w-full mt-2">Criar conta</Button>
    </form>
  )
}

function MensagemEmBreve({ mensagem, detalhe }) {
  return (
    <div className="flex flex-col items-center py-10 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <p className="text-sm text-slate-600 font-medium">{mensagem}</p>
      {detalhe && <p className="text-xs text-slate-400">{detalhe}</p>}
    </div>
  )
}

// ─── RegisterPage — Container principal da autenticação ───────────────────────

export default function RegisterPage() {
  const [aba, setAba] = useState('entrar')
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const navigate = useNavigate()

  const tipo = TIPOS.find((t) => t.id === tipoSelecionado)

  function handleSucessoCadastro() {
    setAba('entrar')
    setTipoSelecionado(null)
  }

  function handleMudarAba(novaAba) {
    setAba(novaAba)
    setTipoSelecionado(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          Do primeiro sintoma ao<br />atendimento.
        </h1>
        <p className="text-sm text-blue-600 mt-1">
          Pré-triagem, busca e agendamento em um só lugar.
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 mx-4 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Abas */}
        <div className="flex border-b border-slate-100">
          {[
            { id: 'entrar', label: 'Entrar' },
            { id: 'cadastrar', label: 'Cadastrar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMudarAba(tab.id)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                aba === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-6 py-6">
          {/* ── ABA ENTRAR ── */}
          {aba === 'entrar' && <LoginPage />}

          {/* ── ABA CADASTRAR: seleção de tipo ── */}
          {aba === 'cadastrar' && !tipoSelecionado && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500 mb-1">Selecione o tipo de cadastro:</p>
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipoSelecionado(t.id)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    {t.icone}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{t.titulo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.descricao}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* ── ABA CADASTRAR: formulário do tipo selecionado ── */}
          {aba === 'cadastrar' && tipoSelecionado && tipo && (
            <div>
              <BotaoVoltar tipo={tipo} onVoltar={() => setTipoSelecionado(null)} />
              {tipoSelecionado === 'paciente' && <FormPaciente onSuccess={handleSucessoCadastro} />}
              {tipoSelecionado === 'profissional' && (
                <MensagemEmBreve
                  mensagem="Cadastro realizado pelo administrador da clínica."
                  detalhe="Entre em contato com sua clínica para solicitar o acesso."
                />
              )}
              {tipoSelecionado === 'clinica' && (
                <MensagemEmBreve
                  mensagem="Cadastro de clínica disponível em breve."
                  detalhe="Entre em contato com nossa equipe."
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}
