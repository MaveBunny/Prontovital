import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/shared/Badge'
import Button from '../../../components/shared/Button'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { historicoTriagens } from '../../../lib/triagemApi'
import { formatarData } from '../../../shared/utils/formatDate'

const MOCK = [
  {
    id: '1',
    sintomas: 'Dor de cabeça intensa, febre há 2 dias.',
    duracao: '2 dias',
    intensidade: 7,
    criadoEm: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'concluido',
  },
  {
    id: '2',
    sintomas: 'Tosse seca persistente, cansaço ao subir escadas.',
    duracao: '5 dias',
    intensidade: 4,
    criadoEm: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'concluido',
  },
]

function IntensidadeBar({ valor }) {
  const cor = valor <= 3 ? 'bg-green-400' : valor <= 6 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${cor} rounded-full`} style={{ width: `${(valor / 10) * 100}%` }} />
      </div>
      <span className={`text-xs font-bold ${valor <= 3 ? 'text-green-600' : valor <= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
        {valor}/10
      </span>
    </div>
  )
}

export default function HistoricoTriagem() {
  const navigate = useNavigate()
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const data = await historicoTriagens()
        setLista(data)
      } catch {
        setLista(MOCK)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Triagem</h1>
          <p className="text-sm text-slate-400">{lista.length} registro(s)</p>
        </div>
        <Button size="sm" onClick={() => navigate('/triagem/iniciar')}>
          + Nova triagem
        </Button>
      </div>

      {carregando ? (
        <LoadingSpinner size="md" className="py-12" />
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">Nenhuma triagem realizada</p>
          <p className="text-xs text-slate-400">Inicie uma triagem para descrever seus sintomas</p>
          <Button size="sm" onClick={() => navigate('/triagem/iniciar')} className="mt-2">
            Iniciar primeira triagem
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
              {/* Cabeçalho do card */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">{t.sintomas}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatarData(t.criadoEm)}</p>
                </div>
                <Badge color="green">Concluída</Badge>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">Duração</p>
                  <p className="text-sm font-bold text-slate-700">{t.duracao}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">Intensidade</p>
                  <IntensidadeBar valor={t.intensidade} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
