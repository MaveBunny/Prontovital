import React, { useState, useEffect } from 'react'
import { buscarProfissionais } from '../../../lib/profissionaisApi'
import { consultarHorarios, criarHorario } from '../../../lib/agendaApi'
import { useAuth } from '../../../shared/hooks/useAuth'

const DIAS_SEMANA_MAP = [
  { label: 'Domingo', val: 0 },
  { label: 'Segunda-feira', val: 1 },
  { label: 'Terça-feira', val: 2 },
  { label: 'Quarta-feira', val: 3 },
  { label: 'Quinta-feira', val: 4 },
  { label: 'Sexta-feira', val: 5 },
  { label: 'Sábado', val: 6 },
]

const HORARIOS_OPCOES = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', 
  '19:00', '19:30', '20:00'
]

export default function DisponibilidadePage() {
  const { usuario } = useAuth()
  const [medicos, setMedicos] = useState([])
  const [medicoAtivo, setMedicoAtivo] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Form state
  const [formDiaVal, setFormDiaVal] = useState(1) // Segunda
  const [formInicio, setFormInicio] = useState('08:00')
  const [formFim, setFormFim] = useState('17:00')

  useEffect(() => {
    async function carregarProfissionais() {
      setCarregando(true)
      try {
        const list = await buscarProfissionais()
        setMedicos(list)
        if (list.length > 0) {
          setMedicoAtivo(list[0].id_profissional || list[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarProfissionais()
  }, [])

  useEffect(() => {
    async function carregarAgenda() {
      if (!medicoAtivo) return
      try {
        const data = await consultarHorarios({ id_profissional: medicoAtivo })
        setHorarios(data)
      } catch (err) {
        console.error(err)
      }
    }
    carregarAgenda()
  }, [medicoAtivo])

  const medicoSelecionado = medicos.find(m => String(m.id_profissional || m.id) === String(medicoAtivo))

  async function handleAddHorario(e) {
    e.preventDefault()
    if (!medicoAtivo) return
    setSalvando(true)
    setErro('')

    try {
      await criarHorario({
        id_profissional: Number(medicoAtivo),
        dias_da_semana: [Number(formDiaVal)],
        horario_abertura: formInicio,
        horario_fechamento: formFim,
      })
      const atualizados = await consultarHorarios({ id_profissional: medicoAtivo })
      setHorarios(atualizados)
    } catch (err) {
      setErro(err.response?.data?.erro || err.message || 'Erro ao cadastrar horário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out] relative min-h-screen">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Disponibilidade dos Médicos</h2>
        <p className="text-[15px] text-slate-500 mt-1">Configure os horários de atendimento dos médicos desta clínica no banco de dados.</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* ── Seleção de Médicos ── */}
          <div className="flex flex-wrap gap-3 mb-10">
            {medicos.map(medico => {
              const idProf = medico.id_profissional || medico.id
              const isAtivo = String(idProf) === String(medicoAtivo)
              return (
                <button
                  key={idProf}
                  onClick={() => setMedicoAtivo(idProf)}
                  className={`px-5 py-2.5 rounded-full text-[14.5px] font-bold transition-colors border cursor-pointer ${
                    isAtivo 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {medico.nome} ({medico.especialidade})
                </button>
              )
            })}
          </div>

          {/* ── Formulário Adicionar ── */}
          {medicoSelecionado && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">
                Adicionar horário — {medicoSelecionado.nome}
              </h3>
              
              <form onSubmit={handleAddHorario} className="flex flex-col md:flex-row items-end gap-4">
                
                <div className="w-full md:w-1/3">
                  <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Dia da semana</label>
                  <select 
                    value={formDiaVal}
                    onChange={(e) => setFormDiaVal(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    {DIAS_SEMANA_MAP.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                </div>

                <div className="w-full md:w-1/4">
                  <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Início</label>
                  <select 
                    value={formInicio}
                    onChange={(e) => setFormInicio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    {HORARIOS_OPCOES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="w-full md:w-1/4">
                  <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Fim</label>
                  <select 
                    value={formFim}
                    onChange={(e) => setFormFim(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    {HORARIOS_OPCOES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={salvando}
                  className="w-full md:w-auto mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : '+ Adicionar horário'}
                </button>
              </form>

              {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
            </div>
          )}

          {/* ── Lista de Horários ── */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Horários no Banco de Dados ({medicoSelecionado?.nome})
            </h3>
            
            <div className="flex flex-col gap-3">
              {horarios.length === 0 ? (
                <p className="text-sm text-slate-500 py-6">Nenhum horário cadastrado para este médico.</p>
              ) : (
                horarios.map((horario) => {
                  const diaObj = DIAS_SEMANA_MAP.find(d => d.val === horario.dia_da_semana)
                  return (
                    <div 
                      key={horario.id_horario || horario.id} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">
                          {diaObj?.label || `Dia ${horario.dia_da_semana}`}
                        </p>
                        <p className="text-[13px] text-slate-500 mt-0.5">
                          {horario.horario_abertura?.substring(0, 5)} – {horario.horario_fechamento?.substring(0, 5)}
                        </p>
                      </div>

                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 w-fit">
                        Ativo
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
