import { Navigate, Route, Routes } from 'react-router-dom'
import PacienteLayout from './components/PacienteLayout'
import PreTriagemPage from './pages/PreTriagemPage'
import ClinicasPage from './pages/ClinicasPage'
import ProfissionaisPage from './pages/ProfissionaisPage'
import MeusAgendamentosPage from './pages/MeusAgendamentosPage'
import HistoricoTriagensPage from './pages/HistoricoTriagensPage'
import MeuPerfilPage from './pages/MeuPerfilPage'

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route element={<PacienteLayout />}>
        {/* Redirecionamento inicial: Clínicas (Pré-Triagem oculta — sem backend) */}
        <Route index element={<Navigate to="clinicas" replace />} />
        {/* Rotas futuras mantidas para histórico — ocultas do menu, sem link visível */}
        <Route path="pre-triagem" element={<PreTriagemPage />} />
        <Route path="clinicas" element={<ClinicasPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
        <Route path="agendamentos" element={<MeusAgendamentosPage />} />
        <Route path="historico-triagens" element={<HistoricoTriagensPage />} />
        <Route path="perfil" element={<MeuPerfilPage />} />
        {/* Compatibilidade de rotas antigas */}
        <Route path="dashboard" element={<Navigate to="clinicas" replace />} />
        <Route path="triagem" element={<Navigate to="clinicas" replace />} />
      </Route>
    </Routes>
  )
}
