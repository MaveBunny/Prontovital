
import { Navigate, Route, Routes } from 'react-router-dom'
import ProfissionalLayout from './components/ProfissionalLayout'
import AgendaPage from './pages/AgendaPage'
import AgendamentosPage from './pages/AgendamentosPage'
import DetalhesConsultaPage from './pages/DetalhesConsultaPage'
import Dashboard from './pages/Dashboard'
import PerfilPage from './pages/PerfilPage'

export default function ProfissionalRoutes() {
  return (
    <Routes>
      {/* Rotas fora do layout (mantidas por compatibilidade) */}
      <Route path="dashboard" element={<Dashboard />} />

      {/* Layout com sidebar do profissional */}
      <Route element={<ProfissionalLayout />}>
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="consulta/:id" element={<DetalhesConsultaPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>
    </Routes>
  )
}
