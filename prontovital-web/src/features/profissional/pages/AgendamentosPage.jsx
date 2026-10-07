import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { listarAgendamentosProfissional, toDataHora } from '../../../lib/profissionalAgendaApi'

function normalizarAgendamento(ag) {
  const dataHora = new Date(toDataHora(ag))

  return {
    id: String(ag.id_agendamento),
    paciente: ag.Paciente.User.nome,
    dataHora,
    status: ag.status,
  }
}

function formatarData(dataHora) {
  return new Intl.DateTimeFormat('pt-BR').format(dataHora)
}

function formatarHorario(dataHora) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dataHora)
}

function formatarStatus(status) {
  const statusMap = {
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }

  return statusMap[status] || status
}

function classeStatus(status) {
  const classes = {
    confirmado: 'bg-emerald-50 text-emerald-700',
    concluido: 'bg-blue-50 text-blue-700',
    cancelado: 'bg-red-50 text-red-700',
  }

  return classes[status] || 'bg-slate-100 text-slate-600'
}

export default function AgendamentosPage() {
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarAgendamentosProfissional()

        setAgendamentos(dados.map(normalizarAgendamento))
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  if (carregando) {
    return <LoadingSpinner size="lg" className="h-screen" />
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Agendamentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suas consultas agendadas, concluídas e canceladas.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                  PACIENTE
                </th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                  DATA
                </th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                  HORÁRIO
                </th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody>
              {agendamentos.map((agendamento) => (
                <tr
                  key={agendamento.id}
                  onClick={() =>
                    navigate(`/profissional/consulta/${agendamento.id}`, {
                      state: { origem: 'agendamentos' },
                    })
                  }
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    {agendamento.paciente}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatarData(agendamento.dataHora)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatarHorario(agendamento.dataHora)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classeStatus(agendamento.status)}`}
                    >
                      {formatarStatus(agendamento.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {agendamentos.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhum agendamento encontrado.
          </div>
        )}
      </div>
    </div>
  )
}