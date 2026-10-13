import { Navigate, Route, Routes } from 'react-router-dom'
import PacienteLayout from './components/PacienteLayout'
import PreTriagemPage from './pages/PreTriagemPage'
import ClinicasPage from './pages/ClinicasPage'
import ProfissionaisPage from './pages/ProfissionaisPage'
import MeusAgendamentosPage from './pages/MeusAgendamentosPage'
import HistoricoTriagensPage from './pages/HistoricoTriagensPage'
import MeuPerfilPage from './pages/MeuPerfilPage'
import EditarPerfilPage from './pages/EditarPerfilPage'

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route element={<PacienteLayout />}>
        {/* Redirecionamento inicial: Tela Inicial (Busca rápida + Pré-triagem com IA) */}
        <Route index element={<Navigate to="pre-triagem" replace />} />
        <Route path="pre-triagem" element={<PreTriagemPage />} />
        <Route path="clinicas" element={<ClinicasPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
        <Route path="agendamentos" element={<MeusAgendamentosPage />} />
        <Route path="historico-triagens" element={<HistoricoTriagensPage />} />
        <Route path="perfil" element={<MeuPerfilPage />} />
        <Route path="editar-perfil" element={<EditarPerfilPage />} />
        {/* Compatibilidade de rotas antigas */}
        <Route path="dashboard" element={<Navigate to="pre-triagem" replace />} />
        <Route path="triagem" element={<Navigate to="pre-triagem" replace />} />
      </Route>
    </Routes>
  )
}
