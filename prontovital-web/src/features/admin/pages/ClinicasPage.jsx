import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { cadastrarClinica, listarClinicas } from '../../../lib/clinicasApi'

const MOCK_CLINICAS = [
  { id: '1', nome: 'Clínica Saúde Total', cnpj: '12.345.678/0001-99', endereco: 'Rua das Flores, 123', telefone: '(11) 98765-4321', email: 'contato@saudetotal.com', horario: '08:00 - 18:00', especialidades: 'Clínica Geral, Pediatria', ativa: true },
  { id: '2', nome: 'Centro Médico Vida', cnpj: '98.765.432/0001-11', endereco: 'Av. Paulista, 1000', telefone: '(11) 91234-5678', email: 'atendimento@vidamedica.com.br', horario: '24 Horas', especialidades: 'Cardiologia, Ortopedia', ativa: true },
]

export default function ClinicasPage() {
  const [clinicas, setClinicas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ 
    nome: '', 
    cnpj: '', 
    endereco: '', 
    telefone: '', 
    email: '', 
    horario: '', 
    especialidades: '', 
    ativa: true 
  })

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarClinicas()
        setClinicas(data)
      } catch {
        setClinicas(MOCK_CLINICAS)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleCadastrar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const nova = await cadastrarClinica(form)
      setClinicas((prev) => [...prev, nova])
      resetForm()
    } catch {
      // Em mock, adiciona localmente
      setClinicas((prev) => [...prev, { id: String(Date.now()), ...form }])
      resetForm()
    } finally {
      setSalvando(false)
    }
  }

  function resetForm() {
    setForm({ nome: '', cnpj: '', endereco: '', telefone: '', email: '', horario: '', especialidades: '', ativa: true })
    setMostraForm(false)
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Gerenciamento de Clínicas</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{clinicas.length} clínica(s) cadastrada(s) na plataforma</p>
        </div>
        <Button size="md" onClick={() => { if(mostraForm) resetForm(); else setMostraForm(true) }} className="shadow-sm">
          {mostraForm ? 'Cancelar' : '+ Cadastrar Clínica'}
        </Button>
      </div>

      {/* Formulário de Cadastro (Alta Fidelidade) */}
      {mostraForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100 flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-bold text-slate-800">Nova Clínica</h3>
            <p className="text-sm text-slate-500">Preencha as informações do estabelecimento.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome da Clínica" name="nome" type="text" placeholder="Razão Social ou Nome Fantasia" value={form.nome} onChange={handleInputChange} required />
            <Input label="CNPJ" name="cnpj" type="text" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={handleInputChange} required />
            
            <div className="md:col-span-2">
              <Input label="Endereço Completo" name="endereco" type="text" placeholder="Rua, Número, Bairro, Cidade" value={form.endereco} onChange={handleInputChange} required />
            </div>

            <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleInputChange} required />
            <Input label="E-mail Corporativo" name="email" type="email" placeholder="contato@clinica.com" value={form.email} onChange={handleInputChange} required />
            
            <Input label="Horário de Funcionamento" name="horario" type="text" placeholder="Ex: Seg-Sex, 08:00 - 18:00" value={form.horario} onChange={handleInputChange} required />
            <Input label="Especialidades Atendidas" name="especialidades" type="text" placeholder="Ex: Cardiologia, Pediatria" value={form.especialidades} onChange={handleInputChange} required />
            
            <div className="flex flex-col justify-center">
              <label className="block text-sm font-bold text-slate-700 mb-2">Status da Clínica</label>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="ativa" className="sr-only" checked={form.ativa} onChange={handleInputChange} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${form.ativa ? 'bg-primary' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${form.ativa ? 'transform translate-x-5' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-semibold text-slate-700">
                  {form.ativa ? 'Clínica Ativa' : 'Clínica Inativa'}
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

      {/* Lista / Tabela */}
      {carregando ? (
        <LoadingSpinner size="md" className="py-12" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clínica</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Horário / Especialidades</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinicas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{c.nome}</p>
                      <p className="text-slate-500 font-mono text-xs mt-1">{c.cnpj}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{c.endereco}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 font-medium">{c.telefone}</p>
                      <p className="text-slate-500 text-xs mt-1">{c.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 text-xs font-medium bg-slate-100 inline-block px-2 py-1 rounded-md mb-1">{c.horario}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{c.especialidades}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {c.ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clinicas.length === 0 && (
            <div className="p-8 text-center text-slate-500">Nenhuma clínica cadastrada.</div>
          )}
        </div>
      )}
    </div>
  )
}
