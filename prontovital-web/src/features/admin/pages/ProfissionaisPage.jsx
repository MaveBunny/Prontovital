import { useEffect, useState } from 'react'
import Badge from '../../../components/shared/Badge'
import Button from '../../../components/shared/Button'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { buscarProfissionais, cadastrarProfissional } from '../../../lib/profissionaisApi'

const MOCK = [
  { id: '1', nome: 'Dr. Carlos Lima', crm: '12345-SP', especialidade: 'Cardiologia', status: 'aprovado' },
  { id: '2', nome: 'Dra. Fernanda Melo', crm: '67890-RJ', especialidade: 'Dermatologia', status: 'pendente' },
]

export default function ProfissionaisPage() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const data = await buscarProfissionais()
        setLista(data)
      } catch {
        setLista(MOCK)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  async function handleAprovar(id) {
    setLista((prev) => prev.map((p) => p.id === id ? { ...p, status: 'aprovado' } : p))
  }

  const filtrados = lista.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.especialidade?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Profissionais</h1>
          <p className="text-sm text-slate-400">{lista.filter(p => p.status === 'pendente').length} pendente(s) de aprovação</p>
        </div>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou especialidade..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {carregando ? (
        <LoadingSpinner size="md" className="py-8" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-slate-500">
                  {p.nome.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{p.nome}</p>
                <p className="text-xs text-slate-400">{p.especialidade} · CRM {p.crm}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge color={p.status === 'aprovado' ? 'green' : 'yellow'}>
                  {p.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                </Badge>
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
