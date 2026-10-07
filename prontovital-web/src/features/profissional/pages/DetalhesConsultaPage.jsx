import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { formatarData } from '../../../shared/utils/formatDate'
import {
  obterAgendamentoPorId,
  toDataHora,
} from '../../../lib/profissionalAgendaApi'

function normalizarConsulta(ag) {
  return {
    id: String(ag.id_agendamento),
    dataHora: toDataHora(ag),
    status: ag.status,
    especialidade: ag.Especialidade.nome,
    clinica: ag.Clinica.nome,
    paciente: {
      nome: ag.Paciente.User.nome,
    },
    triagem: ag.PreTriagem
      ? {
          sintomas: ag.PreTriagem.queixa,
          duracao: ag.PreTriagem.duracao,
          intensidade: ag.PreTriagem.intensidade,
          criadoEm: ag.PreTriagem.registradoEm,
        }
      : null,
  }
}

function formatarHorario(dataHora) {
  return new Date(dataHora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarDataCompleta(dataHora) {
  return new Date(dataHora).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function DetalhesConsultaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [consulta, setConsulta] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const agendamento = await obterAgendamentoPorId(id)

        setConsulta(
          agendamento ? normalizarConsulta(agendamento) : null,
        )
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [id])

  function voltar() {
    const origem = location.state?.origem

    if (origem === 'mes') {
      navigate('/profissional/agenda?visao=mes')
      return
    }

    if (origem === 'semana') {
      navigate('/profissional/agenda')
      return
    }

    navigate('/profissional/agenda')
  }

  if (carregando) {
    return (
      <LoadingSpinner
        size="lg"
        className="h-screen"
      />
    )
  }

  if (!consulta) {
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="text-sm text-slate-500">
            Consulta não encontrada.
          </p>

          <button
            type="button"
            onClick={voltar}
            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Voltar ao calendário
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-6 flex flex-col gap-5">
      <button
        type="button"
        onClick={voltar}
        className="self-start flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>

        Voltar ao calendário
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {consulta.paciente.nome}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
          <span>{consulta.especialidade}</span>
          <span className="text-slate-300">•</span>
          <span>{formatarDataCompleta(consulta.dataHora)}</span>
          <span className="text-slate-300">•</span>
          <span>{formatarHorario(consulta.dataHora)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Pré-Triagem do Paciente
          </h2>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
              consulta.status === 'confirmado'
                ? 'bg-emerald-50 text-emerald-600'
                : consulta.status === 'cancelado'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-blue-50 text-blue-600'
            }`}
          >
            {consulta.status}
          </span>
        </div>

        {consulta.triagem ? (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Queixa / impressão clínica
              </p>

              <p className="text-sm text-slate-700 leading-relaxed">
                {consulta.triagem.sintomas}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400">
                  Duração
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {consulta.triagem.duracao || '—'}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-orange-400">
                  Intensidade
                </p>

                <p className="mt-1 text-lg font-bold text-orange-600">
                  {consulta.triagem.intensidade
                    ? `${consulta.triagem.intensidade}/10`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Nenhuma informação de pré-triagem registrada.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Clínica
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-700">
            {consulta.clinica}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Horário
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-700">
            {formatarHorario(consulta.dataHora)}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        As informações desta tela são somente para consulta.
      </p>
    </div>
  )
}