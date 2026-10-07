import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { cadastrarClinica, listarClinicas } from '../../../lib/clinicasApi'

export default function ClinicasPage() {
  const [clinicas, setClinicas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ 
    nome: '', 
    cnpj: '', 
    endereco: '', 
    bairro: '',
    cidade: '',
    estado: 'PE',
    telefone: '', 
    email: '', 
    senha: ''
  })

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const data = await listarClinicas()
      setClinicas(data)
    } catch (err) {
      console.error(err)
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
        telefone: form.telefone.replace(/\D/g, '') || '8133330000',
        perfil: "clinica",
        clinica: {
          cnpj: form.cnpj.replace(/\D/g, ''),
          bairro: form.bairro || form.cidade || 'Centro'
        }
      }
      await cadastrarClinica(payload)
      await carregar()
      resetForm()
    } catch (err) {
      setErro(err.response?.data?.erro || err.response?.data?.mensagem || err.message || 'Erro ao cadastrar clínica.')
    } finally {
      setSalvando(false)
    }
  }

  function resetForm() {
    setForm({ nome: '', cnpj: '', endereco: '', bairro: '', cidade: '', estado: 'PE', telefone: '', email: '', senha: '' })
    setMostraForm(false)
    setErro('')
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

      {/* Formulário de Cadastro */}
      {mostraForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100 flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-bold text-slate-800">Nova Clínica</h3>
            <p className="text-sm text-slate-500">Preencha as informações da clínica para salvamento no banco de dados.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome da Clínica" name="nome" type="text" placeholder="Razão Social ou Nome Fantasia" value={form.nome} onChange={handleInputChange} required />
            <Input label="CNPJ" name="cnpj" type="text" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={handleInputChange} required />
            <Input label="E-mail Corporativo" name="email" type="email" placeholder="contato@clinica.com" value={form.email} onChange={handleInputChange} required />
            <Input label="Senha de Acesso" name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleInputChange} required minLength={6} />
            <Input label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleInputChange} required />
            <Input label="Bairro" name="bairro" type="text" placeholder="Ex: Boa Viagem" value={form.bairro} onChange={handleInputChange} required />
            <Input label="Cidade" name="cidade" type="text" placeholder="Ex: Recife" value={form.cidade} onChange={handleInputChange} required />
            <Input label="Estado (UF)" name="estado" type="text" placeholder="PE" value={form.estado} onChange={handleInputChange} maxLength={2} required />
            <div className="md:col-span-2">
              <Input label="Endereço Completo" name="endereco" type="text" placeholder="Av Conselheiro Aguiar, 100" value={form.endereco} onChange={handleInputChange} required />
            </div>
          </div>

          {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{erro}</p>}

          <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button type="submit" loading={salvando} className="px-8 shadow-md">Salvar Cadastro no Banco</Button>
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
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Localidade</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinicas.map((c) => (
                  <tr key={c.id_clinica || c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{c.nome}</p>
                      <p className="text-slate-500 font-mono text-xs mt-1">{c.cnpj || 'CNPJ Registrado'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 font-medium">{c.telefone}</p>
                      <p className="text-slate-500 text-xs mt-1">{c.email || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700 text-xs font-medium">{c.bairro} — {c.cidade} / {c.estado}</p>
                      <p className="text-slate-400 text-xs">{c.endereco}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Ativo
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
