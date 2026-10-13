import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/hooks/useAuth'
import api from '../../../lib/api'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MESES_COMPLETOS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear()
}

function formatDateToIso(d) {
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateMonthMatrix(year, month) {
  const matrix = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()

  let firstDayOfWeek = firstDay.getDay()
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  let currentDay = 1
  for (let row = 0; row < 6; row++) {
    const week = []
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < firstDayOfWeek) {
        week.push(null)
      } else if (currentDay > lastDay) {
        week.push(null)
      } else {
        week.push(new Date(year, month, currentDay))
        currentDay++
      }
    }
    matrix.push(week)
    if (currentDay > lastDay) break
  }
  return matrix
}

export default function AgendaPage() {
  const { usuario } = useAuth()
  const [visao, setVisao] = useState('mes')
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [monthDate, setMonthDate] = useState(() => {
    const hoje = new Date()
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const idClinica = usuario?.id_clinica || usuario?.id || usuario?.id_user

  useEffect(() => {
    async function carregarAgendamentos() {
      if (!idClinica) return
      setLoading(true)
      try {
        const { data } = await api.get(`/clinicas/${idClinica}/agendamentos`)
        if (Array.isArray(data)) {
          setAgendamentos(data)
        } else {
          setAgendamentos([])
        }
      } catch (err) {
        console.error('Erro ao buscar agendamentos na Agenda:', err)
        setAgendamentos([])
      } finally {
        setLoading(false)
      }
    }

    carregarAgendamentos()
  }, [idClinica])

  function goPrev() {
    if (visao === 'semana') {
      setWeekStart(addDays(weekStart, -7))
    } else {
      setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
    }
  }

  function goNext() {
    if (visao === 'semana') {
      setWeekStart(addDays(weekStart, 7))
    } else {
      setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
    }
  }

  function getAgendamentosDoDia(date) {
    if (!date) return []
    const iso = formatDateToIso(date)
    return agendamentos.filter(a => a.data_agendamento === iso)
  }

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  const weekEnd = daysOfWeek[6]
  const weekTitle = (() => {
    const startM = weekStart.getMonth()
    const endM = weekEnd.getMonth()
    const year = weekEnd.getFullYear()
    if (startM === endM) {
      return `${weekStart.getDate()} – ${weekEnd.getDate()} de ${MESES[endM]} ${year}`
    } else {
      return `${weekStart.getDate()} de ${MESES[startM]} – ${weekEnd.getDate()} de ${MESES[endM]} ${year}`
    }
  })()

  const monthMatrix = generateMonthMatrix(monthDate.getFullYear(), monthDate.getMonth())
  const monthTitle = `${MESES_COMPLETOS[monthDate.getMonth()]} ${monthDate.getFullYear()}`

  const agendamentosDiaSelecionado = getAgendamentosDoDia(selectedDate)

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Calendário</h2>
          <p className="text-[15px] text-slate-500 mt-1">Consultas agendadas pelos pacientes.</p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setVisao('semana')}
            className={`px-6 py-2 text-[14px] font-bold rounded-full transition-colors ${
              visao === 'semana' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setVisao('mes')}
            className={`px-6 py-2 text-[14px] font-bold rounded-full transition-colors ${
              visao === 'mes' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h3 className="text-[16px] font-bold text-slate-900">
          {visao === 'semana' ? weekTitle : monthTitle}
        </h3>

        <button onClick={goNext} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">

        <div className="grid grid-cols-7 border-b border-slate-200">
          {visao === 'semana' ? (
            daysOfWeek.map((dayDate, i) => {
              const active = isSameDay(dayDate, selectedDate)
              const count = getAgendamentosDoDia(dayDate).length
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`flex flex-col items-center justify-center py-4 border-r border-slate-200 last:border-r-0 transition-colors ${
                    active ? 'bg-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>
                    {DIAS_SEMANA[i]}
                  </span>
                  <span className={`text-[26px] font-bold leading-none mt-1 ${active ? 'text-white' : 'text-slate-900'}`}>
                    {dayDate.getDate()}
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {count} {count === 1 ? 'consulta' : 'consultas'}
                    </span>
                  )}
                </button>
              )
            })
          ) : (
            DIAS_SEMANA.map((dia, i) => (
              <div key={i} className="flex items-center justify-center py-4 border-r border-slate-200 last:border-r-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{dia}</span>
              </div>
            ))
          )}
        </div>

        {visao === 'semana' ? (
          <div className="grid grid-cols-7 flex-1 min-h-[220px]">
            {daysOfWeek.map((dayDate, i) => {
              const active = isSameDay(dayDate, selectedDate)
              const ags = getAgendamentosDoDia(dayDate)
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`border-r border-slate-100 last:border-r-0 p-2 cursor-pointer transition-colors ${
                    active ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col gap-1.5 mt-1">
                    {ags.map((ag) => (
                      <div key={ag.id_agendamento} className="bg-blue-50 border border-blue-100 rounded-lg p-1.5 text-left">
                        <span className="block text-[11px] font-bold text-blue-700">
                          {ag.horario_agendamento?.substring(0, 5)}
                        </span>
                        <span className="block text-[11px] text-slate-700 truncate font-medium">
                          {ag.Paciente?.User?.nome || 'Paciente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {monthMatrix.map((week, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 flex-1 border-b border-slate-100 last:border-b-0 min-h-[90px]">
                {week.map((dayDate, colIndex) => {
                  const active = isSameDay(dayDate, selectedDate)
                  const ags = getAgendamentosDoDia(dayDate)

                  return (
                    <button
                      key={colIndex}
                      onClick={() => dayDate && setSelectedDate(dayDate)}
                      className={`border-r border-slate-100 last:border-r-0 p-2 text-left hover:bg-slate-50 transition-colors ${
                        !dayDate ? 'bg-slate-50/50 cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      {dayDate && (
                        <>
                          <div className="flex justify-start pt-1 pl-2">
                            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                              active ? 'bg-blue-600 text-white' : 'text-slate-900'
                            }`}>
                              {dayDate.getDate()}
                            </span>
                          </div>

                          {ags.length > 0 && (
                            <div className="mt-2 pl-1 flex flex-wrap gap-1">
                              {ags.slice(0, 3).map((ag) => (
                                <span
                                  key={ag.id_agendamento}
                                  className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded"
                                >
                                  {ag.horario_agendamento?.substring(0, 5)}
                                </span>
                              ))}
                              {ags.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-bold">
                                  +{ags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

      </div>

      <div className="mt-8">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Consultas em {selectedDate.toLocaleDateString('pt-BR')} ({agendamentosDiaSelecionado.length})
        </h3>

        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : agendamentosDiaSelecionado.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-6 text-center">
            Nenhuma consulta agendada para este dia.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {agendamentosDiaSelecionado.map((ag) => (
              <div key={ag.id_agendamento} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[15px] font-bold text-slate-900">
                    {ag.Paciente?.User?.nome || 'Paciente'}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {ag.Profissional?.User?.nome || 'Médico(a)'} · às {ag.horario_agendamento?.substring(0, 5)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full capitalize">
                  {ag.status || 'Confirmado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

    </div>
  )
}
