import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { buscarProfissionais, cadastrarProfissional } from '../../../lib/profissionaisApi'
import { listarClinicas } from '../../../lib/clinicasApi'

export default function ProfissionaisPage() {
  const [lista, setLista] = useState([])
  const [clinicasDisponiveis, setClinicasDisponiveis] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '', email: '', senha: '',
    endereco: '', cidade: '', estado: 'PE', telefone: '',
    cpf: '', conselho: 'CRM', registro_profissional: '', uf_registro: 'PE'
  })

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const [dadosProfissionais, dadosClinicas] = await Promise.all([
        buscarProfissionais().catch(() => []),
        listarClinicas().catch(() => [])
      ])
      setLista(dadosProfissionais)
      setClinicasDisponiveis(dadosClinicas)
    } finally {
      setCarregando(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setErro('')
    setForm(p => ({ ...p, [name]: value }))
  }

  async function handleCadastrar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha || '123456',
        endereco: form.endereco,
        cidade: form.cidade || 'Recife',
        estado: (form.estado || 'PE').substring(0, 2).toUpperCase(),
        telefone: form.telefone.replace(/\D/g, '') || '81999999999',
        perfil: "profissional",
        profissional: {
          cpf: form.cpf.replace(/\D/g, ''),
          conselho: form.conselho,
          registro_profissional: form.registro_profissional,
          uf_registro: (form.uf_registro || form.estado || 'PE').substring(0, 2).toUpperCase()
        }
      }

      await cadastrarProfissional(payload)
      await carregar()
      resetForm()
    } catch (err) {
      setErro(err.response?.data?.erro || err.response?.data?.mensagem || err.message || 'Erro ao cadastrar profissional.')
    } finally {
      setSalvando(false)
    }
  }

  function resetForm() {
    setForm({
      nome: '', email: '', senha: '',
      endereco: '', cidade: '', estado: 'PE', telefone: '',
      cpf: '', conselho: 'CRM', registro_profissional: '', uf_registro: 'PE'
    })
    setMostraForm(false)
    setErro('')
  }

  const filtrados = lista.filter((p) =>
    p.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
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
            <p className="text-sm text-slate-500">Cadastre um profissional médico no banco de dados do sistema.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo" name="nome" type="text" placeholder="Ex: Dr. Carlos Lima" value={form.nome} onChange={handleInputChange} required />
            <Input label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={handleInputChange} required />
            
            <Input label="E-mail de Contato" name="email" type="email" placeholder="medico@exemplo.com" value={form.email} onChange={handleInputChange} required />
            <Input label="Senha de Acesso" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleInputChange} required minLength={6} />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Conselho</label>
                <select name="conselho" value={form.conselho} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-400" required>
                  <option value="CRM">CRM</option>
                  <option value="COREN">COREN</option>
                  <option value="CRO">CRO</option>
                  <option value="CRP">CRP</option>
                </select>
              </div>
              <Input label="Registro" name="registro_profissional" type="text" placeholder="Ex: 12345" value={form.registro_profissional} onChange={handleInputChange} required />
              <Input label="UF Reg." name="uf_registro" type="text" placeholder="PE" value={form.uf_registro} onChange={handleInputChange} maxLength={2} required />
            </div>

            <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleInputChange} required />
            <Input label="Cidade" name="cidade" type="text" placeholder="Ex: Recife" value={form.cidade} onChange={handleInputChange} required />
            <Input label="Estado (UF)" name="estado" type="text" placeholder="PE" value={form.estado} onChange={handleInputChange} maxLength={2} required />
            
            <div className="md:col-span-2">
              <Input label="Endereço Consultório" name="endereco" type="text" placeholder="Rua do Consultório, Número" value={form.endereco} onChange={handleInputChange} required />
            </div>
          </div>

          {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{erro}</p>}

          <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button type="submit" loading={salvando} className="px-8 shadow-md">Salvar Cadastro no Banco</Button>
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
            <div key={p.id_profissional || p.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <span className="text-sm font-bold text-blue-600">
                  {p.iniciais || 'DR'}
                </span>
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.nome}</p>
                  <p className="text-xs text-slate-500 font-medium">{p.especialidade} · {p.conselho || 'CRM'} {p.registro || p.registro_profissional}</p>
                </div>
                <div className="hidden md:flex flex-col justify-center">
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Clínica:</span> {p.clinica}</p>
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Contato:</span> {p.telefone || p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  ATIVO
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
