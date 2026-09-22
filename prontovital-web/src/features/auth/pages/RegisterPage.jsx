import { useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import Select from '../../../components/shared/Select'
import { cadastrarPaciente } from '../../../lib/pacientesApi'
import { cadastrarClinica } from '../../../lib/clinicasApi'
import { cadastrarProfissional } from '../../../lib/profissionaisApi'
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
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
]

// ─── Ícones das features ──────────────────────────────────────────────────────

function IconeTriagem() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15" />
    </svg>
  )
}

function IconeAgendamento() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function IconeRede() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  )
}

// ─── Painel Esquerdo ──────────────────────────────────────────────────────────

function PainelEsquerdo() {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-[#1B2438] text-white flex-col justify-between p-10 xl:p-14 min-h-screen rounded-r-3xl">
      <div>
        <div className="mb-16">
          <h2 className="text-xl font-bold tracking-tight">
            Pronto<span className="text-blue-400">Vital</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Plataforma de Saúde Digital</p>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
            Do primeiro sintoma ao atendimento.
          </h1>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-sm">
            Faça seu cadastro, organize seus sintomas com apoio da IA e encontre profissionais para agendar sua consulta de forma simples e rápida.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <IconeTriagem />
            </div>
            <span className="text-sm font-medium">Pré-triagem com inteligência artificial</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <IconeAgendamento />
            </div>
            <span className="text-sm font-medium">Agendamento de consultas online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <IconeRede />
            </div>
            <span className="text-sm font-medium">Rede de clínicas e especialistas</span>
          </div>
        </div>
      </div>

      <div className="pt-10">
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            ProntoVital — cuidado conectado em um só lugar.
          </p>
        </div>
      </div>
    </div>
  )
}

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
    nome: '', email: '', senha: '',
    endereco: '', cidade: '', estado: '', telefone: '',
    cpf: '', data_nascimento: '', sexo: 'Masculino', observacoes: ''
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
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        telefone: form.telefone.replace(/\D/g, ''),
        perfil: "paciente",
        paciente: {
          cpf: form.cpf.replace(/\D/g, ''),
          data_nascimento: form.data_nascimento,
          sexo: form.sexo,
          observacoes: form.observacoes || "Nenhuma observação"
        }
      }
      await cadastrarPaciente(payload)
      onSuccess(form.email, `Conta de Paciente criada com sucesso para ${form.nome}!`)
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
      <Input label="Nome completo" name="nome" type="text" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} required />
      <Input label="E-mail" name="email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={handleChange} required />
      <Input label="Senha" name="senha" type="password" placeholder="Crie uma senha" value={form.senha} onChange={handleChange} required minLength={6} />
      
      <div className="grid grid-cols-2 gap-3">
        <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} required />
        <Input label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} maxLength={14} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <Input label="Endereço" name="endereco" type="text" placeholder="Sua rua e número" value={form.endereco} onChange={handleChange} required />
        </div>
        <div className="col-span-2">
          <Input label="Cidade" name="cidade" type="text" placeholder="Sua cidade" value={form.cidade} onChange={handleChange} required />
        </div>
        <Input label="Estado (UF)" name="estado" type="text" placeholder="PE" value={form.estado} onChange={handleChange} maxLength={2} required />
      </div>

      <div className="pt-2 border-t border-slate-100 mt-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados de Paciente</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data de Nasc." name="data_nascimento" type="text" placeholder="AAAA-MM-DD ou DD/MM/AAAA" value={form.data_nascimento} onChange={handleChange} required />
          <Select label="Sexo" name="sexo" options={[{value: 'Masculino', label: 'Masculino'}, {value: 'Feminino', label: 'Feminino'}, {value: 'Outro', label: 'Outro'}]} value={form.sexo} onChange={handleChange} required />
        </div>
        <div className="mt-3">
          <Input label="Observações Médicas" name="observacoes" type="text" placeholder="Alergias, medicamentos, comorbidades..." value={form.observacoes} onChange={handleChange} />
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mt-1">{erro}</p>}
      <Button type="submit" loading={loading} className="w-full mt-3">Criar conta de Paciente</Button>
    </form>
  )
}

function FormProfissional({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '',
    endereco: '', cidade: '', estado: '', telefone: '',
    cpf: '', conselho: 'CRM', registro_profissional: '', uf_registro: ''
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
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        telefone: form.telefone.replace(/\D/g, ''),
        perfil: "profissional",
        profissional: {
          cpf: form.cpf.replace(/\D/g, ''),
          conselho: form.conselho,
          registro_profissional: form.registro_profissional,
          uf_registro: form.uf_registro
        }
      }
      await cadastrarProfissional(payload)
      onSuccess(form.email, `Conta de Profissional criada com sucesso para ${form.nome}!`)
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
      <Input label="Nome Completo" name="nome" type="text" placeholder="Dr. Nome Sobrenome" value={form.nome} onChange={handleChange} required />
      <Input label="E-mail" name="email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={handleChange} required />
      <Input label="Criar Senha" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} required minLength={6} />
      
      <div className="grid grid-cols-2 gap-3">
        <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} required />
        <Input label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} maxLength={14} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <Input label="Endereço" name="endereco" type="text" placeholder="Rua do Consultório" value={form.endereco} onChange={handleChange} required />
        </div>
        <div className="col-span-2">
          <Input label="Cidade" name="cidade" type="text" placeholder="Recife" value={form.cidade} onChange={handleChange} required />
        </div>
        <Input label="Estado (UF)" name="estado" type="text" placeholder="PE" value={form.estado} onChange={handleChange} maxLength={2} required />
      </div>

      <div className="pt-2 border-t border-slate-100 mt-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados Profissionais</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 sm:col-span-1">
            <Select label="Conselho" name="conselho" options={[{value: 'CRM', label: 'CRM'}, {value: 'COREN', label: 'COREN'}, {value: 'CRO', label: 'CRO'}, {value: 'CRP', label: 'CRP'}]} value={form.conselho} onChange={handleChange} required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input label="Registro" name="registro_profissional" type="text" placeholder="Ex: 12345" value={form.registro_profissional} onChange={handleChange} required />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <Input label="UF Reg." name="uf_registro" type="text" placeholder="Ex: PE" value={form.uf_registro} onChange={handleChange} maxLength={2} required />
          </div>
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mt-1">{erro}</p>}
      <Button type="submit" loading={loading} className="w-full mt-3">Criar conta de Profissional</Button>
    </form>
  )
}

function FormClinica({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '',
    endereco: '', cidade: '', estado: '', telefone: '',
    cnpj: ''
  })

  function handleChange(e) {
    const { name, value } = e.target
    setErro('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        telefone: form.telefone.replace(/\D/g, ''),
        perfil: "clinica",
        clinica: {
          cnpj: form.cnpj.replace(/\D/g, '')
        }
      }
      await cadastrarClinica(payload)
      onSuccess(form.email, `Conta da Clínica "${form.nome}" criada com sucesso!`)
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao criar conta da clínica. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
      <Input label="Nome da Clínica" name="nome" type="text" placeholder="Razão Social ou Nome Fantasia" value={form.nome} onChange={handleChange} required />
      <Input label="E-mail" name="email" type="email" placeholder="contato@clinica.com" value={form.email} onChange={handleChange} required />
      <Input label="Criar Senha" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} required minLength={6} />
      
      <div className="grid grid-cols-2 gap-3">
        <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} required />
        <Input label="CNPJ" name="cnpj" type="text" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <Input label="Endereço" name="endereco" type="text" placeholder="Rua, Número" value={form.endereco} onChange={handleChange} required />
        </div>
        <div className="col-span-2">
          <Input label="Cidade" name="cidade" type="text" placeholder="Ex: Recife" value={form.cidade} onChange={handleChange} required />
        </div>
        <Input label="Estado (UF)" name="estado" type="text" placeholder="Ex: PE" value={form.estado} onChange={handleChange} maxLength={2} required />
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mt-1">{erro}</p>}
      <Button type="submit" loading={loading} className="w-full mt-3">Criar conta da Clínica</Button>
    </form>
  )
}

// ─── RegisterPage — Container principal da autenticação ───────────────────────

export default function RegisterPage() {
  const [aba, setAba] = useState('entrar')
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [emailCadastrado, setEmailCadastrado] = useState('')

  const tipo = TIPOS.find((t) => t.id === tipoSelecionado)

  function handleSucessoCadastro(email, detalhe) {
    setMensagemSucesso(detalhe || 'Cadastro realizado com sucesso! Faça login para continuar.')
    setEmailCadastrado(email || '')
    setAba('entrar')
    setTipoSelecionado(null)
  }

  function handleMudarAba(novaAba) {
    setAba(novaAba)
    setTipoSelecionado(null)
    if (novaAba === 'cadastrar') {
      setMensagemSucesso('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      {/* ── Painel Esquerdo (desktop) ── */}
      <PainelEsquerdo />

      {/* ── Painel Direito ── */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile */}
        <div className="lg:hidden px-6 pt-10 pb-4 bg-[#1B2438] text-white">
          <h2 className="text-lg font-bold tracking-tight">
            Pronto<span className="text-blue-400">Vital</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Plataforma de Saúde Digital</p>
          <h1 className="text-xl font-extrabold mt-6 leading-tight">
            Do primeiro sintoma ao atendimento.
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Faça seu cadastro, organize seus sintomas com apoio da IA e encontre profissionais para agendar sua consulta de forma simples e rápida.
          </p>
        </div>

        {/* Card de formulário */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-4 py-8 lg:px-12 lg:py-0">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:my-8">
            
            {/* Mensagem de Cadastro Realizado com Sucesso */}
            {mensagemSucesso && (
              <div className="mx-6 mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-[fadeIn_0.3s_ease-in-out]">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-950">Cadastro realizado com sucesso!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{mensagemSucesso}</p>
                </div>
              </div>
            )}

            {/* Abas */}
            <div className="flex border-b border-slate-100 mt-2">
              {[
                { id: 'entrar', label: 'Entrar' },
                { id: 'cadastrar', label: 'Cadastrar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleMudarAba(tab.id)}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    aba === tab.id
                      ? 'text-slate-900 border-b-2 border-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* ── ABA ENTRAR ── */}
              {aba === 'entrar' && (
                <LoginPage 
                  emailInicial={emailCadastrado}
                  onClearMensagemSucesso={() => setMensagemSucesso('')}
                />
              )}

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
                  {tipoSelecionado === 'profissional' && <FormProfissional onSuccess={handleSucessoCadastro} />}
                  {tipoSelecionado === 'clinica' && <FormClinica onSuccess={handleSucessoCadastro} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
