import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/shared/Badge'
import Button from '../../../components/shared/Button'
import LoadingSpinner from '../../../components/shared/LoadingSpinner'
import { deletarPerfil } from '../../../lib/pacientesApi'
import { useAuth } from '../../../shared/hooks/useAuth'
import { usePaciente } from '../../../shared/hooks/usePaciente'
import { formatarData } from '../../../shared/utils/formatDate'
import { useState } from 'react'

// Dados mockados para quando não houver backend
const MOCK_PACIENTE = {
  id: '1',
  nome: 'Maria Silva Santos',
  email: 'maria.silva@email.com',
  cpf: '123.456.789-00',
  criadoEm: '2024-01-15T10:00:00Z',
  dadosSaude: {
    tipoSanguineo: 'O+',
    alergias: 'Penicilina, Dipirona',
    medicamentos: 'Losartana 50mg',
    comorbidades: 'Hipertensão',
  },
}

function InfoCard({ titulo, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{titulo}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-slate-700 text-right font-medium">{value || '—'}</span>
    </div>
  )
}

export default function PerfilPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { paciente: dadosApi, carregando } = usePaciente()
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false)
  const [deletando, setDeletando] = useState(false)

  // Usa mock como fallback quando não há backend
  const paciente = dadosApi || MOCK_PACIENTE

  async function handleDeletar() {
    setDeletando(true)
    try {
      await deletarPerfil(paciente.id)
      logout()
      navigate('/')
    } catch {
      setDeletando(false)
      setConfirmandoDeletar(false)
    }
  }

  if (carregando) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  const iniciais = paciente.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="px-4 py-6 flex flex-col gap-4">
      {/* Avatar + nome */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-blue-600">{iniciais}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{paciente.nome}</h2>
        <p className="text-sm text-slate-400">{paciente.email}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge color="blue">Paciente</Badge>
          <Badge color="green">Ativo</Badge>
        </div>
        <p className="text-xs text-slate-300 mt-2">
          Membro desde {formatarData(paciente.criadoEm)}
        </p>
      </div>

      {/* Dados pessoais */}
      <InfoCard titulo="Dados Pessoais">
        <InfoRow label="Nome completo" value={paciente.nome} />
        <InfoRow label="CPF" value={paciente.cpf} />
        <InfoRow label="E-mail" value={paciente.email} />
      </InfoCard>

      {/* Dados de saúde */}
      {paciente.dadosSaude && (
        <InfoCard titulo="Dados de Saúde">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">Tipo sanguíneo</span>
            {paciente.dadosSaude.tipoSanguineo ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-50 text-red-600">
                🩸 {paciente.dadosSaude.tipoSanguineo}
              </span>
            ) : (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
          <InfoRow label="Alergias" value={paciente.dadosSaude.alergias} />
          <InfoRow label="Medicamentos" value={paciente.dadosSaude.medicamentos} />
          <InfoRow label="Comorbidades" value={paciente.dadosSaude.comorbidades} />
        </InfoCard>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/paciente/editar-perfil')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
          Editar Perfil
        </Button>

        <Button variant="ghost" className="w-full text-slate-500" onClick={() => { logout(); navigate('/') }}>
          Sair da conta
        </Button>

        {!confirmandoDeletar ? (
          <button
            onClick={() => setConfirmandoDeletar(true)}
            className="text-xs text-red-400 hover:text-red-600 text-center py-2 transition-colors"
          >
            Excluir minha conta
          </button>
        ) : (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-1">Tem certeza?</p>
            <p className="text-xs text-red-400 mb-3">Esta ação é irreversível. Todos os seus dados serão excluídos.</p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" className="flex-1" loading={deletando} onClick={handleDeletar}>
                Sim, excluir
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirmandoDeletar(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
