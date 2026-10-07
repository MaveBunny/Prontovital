import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import {
  listarAgendamentosProfissional,
  toDataHora,
} from '../../../lib/profissionalAgendaApi'

/** Adapta o item do mock centralizado para o shape consumido pela página. */
function normalizar(ag) {
  return {
    id: String(ag.id_agendamento),
    paciente: { nome: ag.Paciente.User.nome },
    especialidade: ag.Especialidade.nome,
    dataHora: toDataHora(ag),
    status: ag.status,
  }
}

const DIAS = [
  { indice: 1, nome: 'SEG' },
  { indice: 2, nome: 'TER' },
  { indice: 3, nome: 'QUA' },
  { indice: 4, nome: 'QUI' },
  { indice: 5, nome: 'SEX' },
  { indice: 6, nome: 'SÁB' },
  { indice: 0, nome: 'DOM' },
]

function inicioDaSemana(data) {
  const resultado = new Date(data)
  const dia = resultado.getDay()
  const diferenca = dia === 0 ? -6 : 1 - dia

  resultado.setDate(resultado.getDate() + diferenca)
  resultado.setHours(0, 0, 0, 0)

  return resultado
}

function adicionarDias(data, quantidade) {
  const resultado = new Date(data)
  resultado.setDate(resultado.getDate() + quantidade)
  return resultado
}

function mesmaData(dataA, dataB) {
  return (
    dataA.getFullYear() === dataB.getFullYear() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getDate() === dataB.getDate()
  )
}

function formatarPeriodo(inicio, fim) {
  const mesmoMes = inicio.getMonth() === fim.getMonth()
  const mesmoAno = inicio.getFullYear() === fim.getFullYear()

  const diaInicio = inicio.getDate()
  const diaFim = fim.getDate()

  const nomeMesInicio = inicio.toLocaleDateString('pt-BR', {
    month: 'short',
  })
  const nomeMesFim = fim.toLocaleDateString('pt-BR', {
    month: 'short',
  })

  if (mesmoMes && mesmoAno) {
    return `${diaInicio} - ${diaFim} de ${nomeMesFim.replace('.', '')} ${fim.getFullYear()}`
  }

  if (mesmoAno) {
    return `${diaInicio} ${nomeMesInicio.replace('.', '')} - ${diaFim} ${nomeMesFim.replace('.', '')} ${fim.getFullYear()}`
  }

  return `${diaInicio} ${nomeMesInicio.replace('.', '')} ${inicio.getFullYear()} - ${diaFim} ${nomeMesFim.replace('.', '')} ${fim.getFullYear()}`
}

function formatarHorario(dataHora) {
  return new Date(dataHora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarDataCompleta(data) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function nomeDoMes(data) {
  const nome = data.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

function inicioDoMes(data) {
  const resultado = new Date(data)
  resultado.setDate(1)
  resultado.setHours(0, 0, 0, 0)
  return resultado
}

function adicionarMeses(data, quantidade) {
  const resultado = new Date(data)
  resultado.setDate(1)
  resultado.setMonth(resultado.getMonth() + quantidade)
  resultado.setHours(0, 0, 0, 0)
  return resultado
}

function gerarDiasDoMes(data) {
  const primeiroDiaDoMes = inicioDoMes(data)
  const ultimoDiaDoMes = new Date(
    primeiroDiaDoMes.getFullYear(),
    primeiroDiaDoMes.getMonth() + 1,
    0,
  )

  const primeiroDiaDoCalendario = inicioDaSemana(primeiroDiaDoMes)
  const ultimoDiaDoCalendario = adicionarDias(
    inicioDaSemana(ultimoDiaDoMes),
    6,
  )

  const dias = []
  let atual = new Date(primeiroDiaDoCalendario)

  while (atual <= ultimoDiaDoCalendario) {
    dias.push(new Date(atual))
    atual = adicionarDias(atual, 1)
  }

  return dias
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const visao = searchParams.get('visao') === 'mes' ? 'mes' : 'semana'

  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [semanaAtual, setSemanaAtual] = useState(() =>
    inicioDaSemana(new Date()),
  )

  const [mesAtual, setMesAtual] = useState(() =>
    inicioDoMes(new Date()),
  )

  const [diaSelecionado, setDiaSelecionado] = useState(() =>
    new Date(),
  )

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarAgendamentosProfissional()
        setAgendamentos(data.map(normalizar))
      } catch {
        setAgendamentos([])
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  const diasDaSemana = useMemo(
    () =>
      DIAS.map((dia) => ({
        ...dia,
        data: adicionarDias(
          semanaAtual,
          dia.indice === 0 ? 6 : dia.indice - 1,
        ),
      })),
    [semanaAtual],
  )

  const diasDoMes = useMemo(
    () => gerarDiasDoMes(mesAtual),
    [mesAtual],
  )

  const fimDaSemana = diasDaSemana[diasDaSemana.length - 1].data
  const hoje = new Date()

  function alterarSemana(direcao) {
    setSemanaAtual((atual) => adicionarDias(atual, direcao * 7))
  }

  function voltarParaSemanaAtual() {
    setSemanaAtual(inicioDaSemana(new Date()))
  }

  function alterarMes(direcao) {
    setMesAtual((atual) => adicionarMeses(atual, direcao))
  }

  function voltarParaMesAtual() {
    const atual = inicioDoMes(new Date())

    setMesAtual(atual)
    setDiaSelecionado(new Date())
  }

  function alterarVisao(novaVisao) {
    if (novaVisao === 'mes') {
      setSearchParams({ visao: 'mes' })
      setMesAtual(inicioDoMes(new Date()))
      setDiaSelecionado(new Date())
      return
    }

    setSearchParams({})
    setSemanaAtual(inicioDaSemana(new Date()))
  }

  function obterAgendamentosDoDia(data) {
    return agendamentos
      .filter((agendamento) =>
        mesmaData(new Date(agendamento.dataHora), data),
      )
      .sort(
        (a, b) =>
          new Date(a.dataHora).getTime() -
          new Date(b.dataHora).getTime(),
      )
  }

  const consultasDoDiaSelecionado = obterAgendamentosDoDia(
    diaSelecionado,
  )

  return (
    <div className="px-4 py-6 md:px-6 flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Calendário</h1>

        <p className="text-sm text-slate-400 mt-1">
          Consultas agendadas pelos pacientes.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => alterarVisao('semana')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                visao === 'semana'
                  ? 'bg-white text-slate-700 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semana
            </button>

            <button
              type="button"
              onClick={() => alterarVisao('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                visao === 'mes'
                  ? 'bg-white text-slate-700 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mês
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                visao === 'mes'
                  ? alterarMes(-1)
                  : alterarSemana(-1)
              }
              aria-label={
                visao === 'mes'
                  ? 'Mês anterior'
                  : 'Semana anterior'
              }
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              &lt;
            </button>

            <button
              type="button"
              onClick={
                visao === 'mes'
                  ? voltarParaMesAtual
                  : voltarParaSemanaAtual
              }
              className="px-3 h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() =>
                visao === 'mes'
                  ? alterarMes(1)
                  : alterarSemana(1)
              }
              aria-label={
                visao === 'mes'
                  ? 'Próximo mês'
                  : 'Próxima semana'
              }
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="text-sm font-semibold text-slate-700">
          {visao === 'mes'
            ? nomeDoMes(mesAtual)
            : formatarPeriodo(semanaAtual, fimDaSemana)}
        </div>
      </div>

      {carregando ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <LoadingSpinner size="md" className="py-8" />
        </div>
      ) : visao === 'semana' ? (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {diasDaSemana.map((dia) => {
              const diaEhHoje = mesmaData(dia.data, hoje)

              return (
                <div
                  key={dia.data.toISOString()}
                  className={`min-w-0 px-2 py-3 text-center border-r last:border-r-0 border-slate-100 ${
                    diaEhHoje ? 'bg-blue-50' : ''
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold ${
                      diaEhHoje
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {dia.nome}
                  </p>

                  <div
                    className={`mt-1 mx-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      diaEhHoje
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {dia.data.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-7 min-h-[360px]">
            {diasDaSemana.map((dia) => {
              const consultas = obterAgendamentosDoDia(dia.data)
              const diaEhHoje = mesmaData(dia.data, hoje)

              return (
                <div
                  key={dia.data.toISOString()}
                  className={`min-w-0 p-2 border-r last:border-r-0 border-slate-100 ${
                    diaEhHoje ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    {consultas.map((consulta) => (
                      <button
                        key={consulta.id}
                        type="button"
                        onClick={() =>
                          navigate(`/profissional/consulta/${consulta.id}`, {
                            state: { origem: 'semana' },
                          })
                        }
                        className="w-full text-left rounded-lg bg-blue-50 border border-blue-100 p-2 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                      >
                        <p className="text-xs font-bold text-blue-700">
                          {formatarHorario(consulta.dataHora)}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700 truncate">
                          {consulta.paciente.nome.split(' ')[0]}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DIAS.map((dia) => (
                <div
                  key={dia.indice}
                  className="px-2 py-3 text-center border-r last:border-r-0 border-slate-100"
                >
                  <p className="text-[10px] font-bold text-slate-400">
                    {dia.nome}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {diasDoMes.map((data) => {
                const pertenceAoMes =
                  data.getMonth() === mesAtual.getMonth()

                const diaEhHoje = mesmaData(data, hoje)
                const diaEstaSelecionado = mesmaData(
                  data,
                  diaSelecionado,
                )

                const consultas = obterAgendamentosDoDia(data)

                return (
                  <button
                    key={data.toISOString()}
                    type="button"
                    onClick={() => setDiaSelecionado(data)}
                    className={`min-h-24 md:min-h-28 p-2 text-left border-r border-b border-slate-100 transition-colors ${
                      diaEstaSelecionado
                        ? 'bg-blue-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        diaEhHoje
                          ? 'bg-blue-600 text-white'
                          : pertenceAoMes
                            ? 'text-slate-700'
                            : 'text-slate-300'
                      }`}
                    >
                      {data.getDate()}
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      {consultas.slice(0, 3).map((consulta) => (
                        <div
                          key={consulta.id}
                          className="rounded-md bg-blue-50 border border-blue-100 px-1.5 py-1"
                        >
                          <p className="text-[10px] font-bold text-blue-700 truncate">
                            {formatarHorario(consulta.dataHora)}
                          </p>

                          <p className="text-[10px] text-slate-600 truncate">
                            {consulta.paciente.nome.split(' ')[0]}
                          </p>
                        </div>
                      ))}

                      {consultas.length > 3 && (
                        <p className="text-[10px] font-semibold text-blue-600">
                          +{consultas.length - 3} consulta(s)
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">
                {formatarDataCompleta(diaSelecionado)} —{' '}
                {consultasDoDiaSelecionado.length} CONSULTA(S)
              </h2>
            </div>

            {consultasDoDiaSelecionado.length === 0 ? (
              <div className="px-4 py-8 text-sm text-slate-400">
                Nenhuma consulta neste dia.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {consultasDoDiaSelecionado.map((consulta) => (
                  <button
                    key={consulta.id}
                    type="button"
                    onClick={() =>
                      navigate(`/profissional/consulta/${consulta.id}`, {
                        state: { origem: 'mes' },
                      })
                    }
                    className="w-full px-4 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-700">
                          {formatarHorario(consulta.dataHora)}
                        </p>

                        <p className="text-sm font-semibold text-slate-700">
                          {consulta.paciente.nome}
                        </p>

                        <p className="text-xs text-slate-400">
                          {consulta.especialidade}
                        </p>
                      </div>

                      <span
                        className={`self-start md:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          consulta.status === 'confirmado'
                            ? 'bg-emerald-50 text-emerald-600'
                            : consulta.status === 'concluido'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {consulta.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}