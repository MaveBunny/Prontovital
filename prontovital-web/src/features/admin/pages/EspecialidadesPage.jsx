import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { cadastrarEspecialidade, listarEspecialidades } from '../../../lib/especialidadesApi'

const MOCK = [
  { id: '1', nome: 'Clínica Geral', descricao: 'Atendimento geral' },
  { id: '2', nome: 'Dermatologia', descricao: 'Cuidados com a pele' },
  { id: '3', nome: 'Cardiologia', descricao: 'Sistema cardiovascular' },
]

export default function EspecialidadesPage() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '' })

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarEspecialidades()
        setLista(data)
      } catch {
        setLista(MOCK)
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
      const nova = await cadastrarEspecialidade(form)
      setLista((prev) => [...prev, nova])
    } catch {
      setLista((prev) => [...prev, { id: String(Date.now()), ...form }])
    } finally {
      setSalvando(false)
      setForm({ nome: '', descricao: '' })
      setMostraForm(false)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Especialidades</h1>
          <p className="text-sm text-slate-400">{lista.length} especialidade(s)</p>
        </div>
        <Button size="sm" onClick={() => setMostraForm(!mostraForm)}>
          {mostraForm ? 'Cancelar' : '+ Nova especialidade'}
        </Button>
      </div>

      {mostraForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-700">Nova Especialidade</h3>
          <Input label="Nome" name="nome" type="text" placeholder="Ex: Cardiologia" value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} required />
          <Input label="Descrição" name="descricao" type="text" placeholder="Breve descrição" value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} />
          <Button type="submit" loading={salvando} size="sm" className="self-end">Cadastrar</Button>
        </form>
      )}

      {carregando ? (
        <LoadingSpinner size="md" className="py-8" />
      ) : (
        <div className="grid gap-3">
          {lista.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{e.nome}</p>
                <p className="text-xs text-slate-400">{e.descricao || '—'}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ativa</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
