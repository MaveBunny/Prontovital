import { useEffect, useState } from 'react'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { listarEspecialidades } from '../../../lib/especialidadesApi'

export default function EspecialidadesPage() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const data = await listarEspecialidades()
        setLista(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Especialidades Médicas</h1>
          <p className="text-sm text-slate-400">{lista.length} especialidade(s) cadastrada(s) no banco de dados</p>
        </div>
      </div>

      {carregando ? (
        <LoadingSpinner size="md" className="py-8" />
      ) : (
        <div className="grid gap-3">
          {lista.map((e) => (
            <div key={e.id_especialidade || e.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-sm font-bold text-slate-800">{e.nome}</p>
                <p className="text-xs text-slate-500 mt-0.5">{e.descricao || 'Atendimento especializado'}</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">Ativa</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
