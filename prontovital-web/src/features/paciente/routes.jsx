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
        <Route index element={<Navigate to="pre-triagem" replace />} />
        <Route path="pre-triagem" element={<PreTriagemPage />} />
        <Route path="clinicas" element={<ClinicasPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
        <Route path="agendamentos" element={<MeusAgendamentosPage />} />
        <Route path="historico-triagens" element={<HistoricoTriagensPage />} />
        <Route path="perfil" element={<MeuPerfilPage />} />
        {/* Compatibilidade de rotas antigas */}
        <Route path="dashboard" element={<Navigate to="pre-triagem" replace />} />
        <Route path="triagem" element={<Navigate to="pre-triagem" replace />} />
      </Route>
    </Routes>
  )
}
