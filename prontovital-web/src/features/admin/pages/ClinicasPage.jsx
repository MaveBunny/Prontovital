import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { cadastrarClinica, listarClinicas } from '../../../lib/clinicasApi'

const MOCK_CLINICAS = [
  { id: '1', nome: 'Clínica Saúde Total', cnpj: '12.345.678/0001-99', cidade: 'São Paulo', ativa: true },
  { id: '2', nome: 'Centro Médico Vida', cnpj: '98.765.432/0001-11', cidade: 'Rio de Janeiro', ativa: true },
]

export default function ClinicasPage() {
  const [clinicas, setClinicas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', cnpj: '', cidade: '' })

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

  async function handleCadastrar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const nova = await cadastrarClinica(form)
      setClinicas((prev) => [...prev, nova])
      setForm({ nome: '', cnpj: '', cidade: '' })
      setMostraForm(false)
    } catch {
      // em mock, adiciona localmente
      setClinicas((prev) => [...prev, { id: String(Date.now()), ...form, ativa: true }])
      setForm({ nome: '', cnpj: '', cidade: '' })
      setMostraForm(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Clínicas</h1>
          <p className="text-sm text-slate-400">{clinicas.length} clínica(s) cadastrada(s)</p>
        </div>
        <Button size="sm" onClick={() => setMostraForm(!mostraForm)}>
          {mostraForm ? 'Cancelar' : '+ Nova clínica'}
        </Button>
      </div>

      {/* Formulário de cadastro */}
      {mostraForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-700">Nova Clínica</h3>
          <Input label="Nome" name="nome" type="text" placeholder="Nome da clínica" value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} required />
          <Input label="CNPJ" name="cnpj" type="text" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm(p => ({ ...p, cnpj: e.target.value }))} required />
          <Input label="Cidade" name="cidade" type="text" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm(p => ({ ...p, cidade: e.target.value }))} required />
          <Button type="submit" loading={salvando} size="sm" className="self-end">Cadastrar</Button>
        </form>
      )}

      {/* Tabela */}
      {carregando ? (
        <LoadingSpinner size="md" className="py-8" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">CNPJ</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Cidade</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {clinicas.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.cnpj}</td>
                  <td className="px-4 py-3 text-slate-500">{c.cidade}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {c.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
