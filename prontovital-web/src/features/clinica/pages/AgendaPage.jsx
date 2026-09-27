import React, { useState } from 'react'

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

// Gera a matriz (array de semanas) para o mês atual
function generateMonthMatrix(year, month) {
  const matrix = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  
  // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  let firstDayOfWeek = firstDay.getDay()
  // Ajusta para Segunda=0 ... Domingo=6
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
  const [visao, setVisao] = useState('mes') // 'semana' ou 'mes'

  // O início da semana visível na tela
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date(2026, 8, 21)))
  // O mês visível na tela
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 8, 1))

  // O dia selecionado (ativo)
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 8, 27))
  
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

  // --- SEMANA ---
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

  // --- MÊS ---
  const monthMatrix = generateMonthMatrix(monthDate.getFullYear(), monthDate.getMonth())
  const monthTitle = `${MESES_COMPLETOS[monthDate.getMonth()]} ${monthDate.getFullYear()}`

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Calendário</h2>
          <p className="text-[15px] text-slate-500 mt-1">Consultas agendadas pelos pacientes.</p>
        </div>

        {/* Toggle Semana / Mês */}
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

      {/* ── Navegação do Calendário ── */}
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

      {/* ── Grid do Calendário ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
        
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {visao === 'semana' ? (
            daysOfWeek.map((dayDate, i) => {
              const active = isSameDay(dayDate, selectedDate)
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

        {/* Corpo do Calendário */}
        {visao === 'semana' ? (
          <div className="grid grid-cols-7 flex-1">
            {daysOfWeek.map((dayDate, i) => {
              const active = isSameDay(dayDate, selectedDate)
              return (
                <div key={i} className={`border-r border-slate-100 last:border-r-0 p-2 transition-colors ${active ? 'bg-blue-50/20' : ''}`}></div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {monthMatrix.map((week, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 flex-1 border-b border-slate-100 last:border-b-0 min-h-[100px]">
                {week.map((dayDate, colIndex) => {
                  const active = isSameDay(dayDate, selectedDate)
                  // Mocks para ilustrar os horários do dia 15
                  const isMockDay = dayDate && dayDate.getDate() === 15 && dayDate.getMonth() === 8 && dayDate.getFullYear() === 2026

                  return (
                    <button
                      key={colIndex}
                      onClick={() => dayDate && setSelectedDate(dayDate)}
                      className={`border-r border-slate-100 last:border-r-0 p-2 text-left hover:bg-slate-50 transition-colors ${
                        !dayDate ? 'bg-slate-50/50' : ''
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
                          
                          {/* Badges de agendamentos no mês */}
                          {isMockDay && (
                            <div className="mt-2 pl-1 flex flex-wrap gap-1">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded">08:00</span>
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded">09:00</span>
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
      
      {/* Botão flutuante de ajuda */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-900 transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>

    </div>
  )
}
