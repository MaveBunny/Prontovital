import { useEffect, useState } from 'react'
import Badge from '../../../components/shared/Badge'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { buscarProfissionais, cadastrarProfissional } from '../../../lib/profissionaisApi'
import { listarClinicas } from '../../../lib/clinicasApi'

const MOCK = [
  { id: '1', nome: 'Dr. Carlos Lima', cpf: '123.456.789-00', conselho: 'CRM', registro: '12345-SP', especialidade: 'Cardiologia', telefone: '(11) 98765-4321', email: 'carlos@exemplo.com', clinica: 'Clínica Saúde Total', status: 'ativo' },
  { id: '2', nome: 'Dra. Fernanda Melo', cpf: '098.765.432-11', conselho: 'CRM', registro: '67890-RJ', especialidade: 'Dermatologia', telefone: '(21) 91234-5678', email: 'fernanda@exemplo.com', clinica: 'Centro Médico Vida', status: 'pendente' },
]

export default function ProfissionaisPage() {
  const [lista, setLista] = useState([])
  const [clinicasDisponiveis, setClinicasDisponiveis] = useState(['Clínica Saúde Total', 'Centro Médico Vida'])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    nome: '', cpf: '', conselho: 'CRM', registro: '', especialidade: '', telefone: '', email: '', clinica: '', status: 'ativo'
  })

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosProfissionais, dadosClinicas] = await Promise.all([
          buscarProfissionais().catch(() => MOCK),
          listarClinicas().catch(() => [])
        ])
        setLista(dadosProfissionais.length ? dadosProfissionais : MOCK)
        if (dadosClinicas.length) {
          setClinicasDisponiveis(dadosClinicas.map(c => c.nome))
        }
      } catch {
        setLista(MOCK)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? (checked ? 'ativo' : 'inativo') : value }))
  }

  async function handleCadastrar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      // Mock de salvamento
      await new Promise(r => setTimeout(r, 800));
      setLista(prev => [{ id: String(Date.now()), ...form }, ...prev])
      resetForm()
    } catch {
      setLista(prev => [{ id: String(Date.now()), ...form }, ...prev])
      resetForm()
    } finally {
      setSalvando(false)
    }
  }

  function resetForm() {
    setForm({ nome: '', cpf: '', conselho: 'CRM', registro: '', especialidade: '', telefone: '', email: '', clinica: '', status: 'ativo' })
    setMostraForm(false)
  }

  async function handleAprovar(id) {
    setLista((prev) => prev.map((p) => p.id === id ? { ...p, status: 'ativo' } : p))
  }

  const filtrados = lista.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.especialidade?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.clinica?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Profissionais de Saúde</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{lista.length} profissional(is) cadastrado(s) na plataforma</p>
        </div>
        <Button size="md" onClick={() => { if(mostraForm) resetForm(); else setMostraForm(true) }} className="shadow-sm">
          {mostraForm ? 'Cancelar' : '+ Cadastrar Profissional'}
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      {mostraForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100 flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-bold text-slate-800">Novo Profissional</h3>
            <p className="text-sm text-slate-500">Cadastre um profissional e vincule a uma clínica.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo" name="nome" type="text" placeholder="Ex: Dr. Carlos Lima" value={form.nome} onChange={handleInputChange} required />
            <Input label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={handleInputChange} required />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Conselho</label>
                <select name="conselho" value={form.conselho} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required>
                  <option value="CRM">CRM (Médico)</option>
                  <option value="COREN">COREN (Enfermeiro)</option>
                  <option value="CRO">CRO (Odontologia)</option>
                  <option value="CRP">CRP (Psicologia)</option>
                </select>
              </div>
              <Input label="Registro Profissional" name="registro" type="text" placeholder="Ex: 12345-SP" value={form.registro} onChange={handleInputChange} required />
            </div>

            <Input label="Especialidade" name="especialidade" type="text" placeholder="Ex: Cardiologia, Pediatria" value={form.especialidade} onChange={handleInputChange} required />
            
            <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleInputChange} required />
            <Input label="E-mail de Contato" name="email" type="email" placeholder="medico@exemplo.com" value={form.email} onChange={handleInputChange} required />
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Clínica Vinculada</label>
              <select name="clinica" value={form.clinica} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required>
                <option value="">Selecione uma clínica...</option>
                {clinicasDisponiveis.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center mt-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Status do Profissional</label>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="status" className="sr-only" checked={form.status === 'ativo'} onChange={handleInputChange} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${form.status === 'ativo' ? 'bg-primary' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${form.status === 'ativo' ? 'transform translate-x-5' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-semibold text-slate-700">
                  {form.status === 'ativo' ? 'Ativo na Plataforma' : 'Inativo / Pendente'}
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button type="submit" loading={salvando} className="px-8 shadow-md">Salvar Cadastro</Button>
          </div>
        </form>
      )}

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome, especialidade ou clínica..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
      />

      {carregando ? (
        <LoadingSpinner size="md" className="py-12" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.length === 0 ? (
             <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">Nenhum profissional encontrado.</div>
          ) : filtrados.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <span className="text-sm font-bold text-blue-600">
                  {p.nome.split(' ').filter(n => n.length > 2).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.nome}</p>
                  <p className="text-xs text-slate-500 font-medium">{p.especialidade} · {p.conselho} {p.registro}</p>
                </div>
                <div className="hidden md:flex flex-col justify-center">
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Clínica:</span> {p.clinica}</p>
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Contato:</span> {p.telefone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {p.status.toUpperCase()}
                </span>
                {p.status === 'pendente' && (
                  <Button size="sm" variant="secondary" onClick={() => handleAprovar(p.id)}>
                    Aprovar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
