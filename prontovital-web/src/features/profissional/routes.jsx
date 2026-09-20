import { Navigate, Route, Routes } from 'react-router-dom'
import AgendaPage from './pages/AgendaPage'
import DetalhesConsultaPage from './pages/DetalhesConsultaPage'
import Dashboard from './pages/Dashboard'

export default function ProfissionalRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="agenda" element={<AgendaPage />} />
      <Route path="consulta/:id" element={<DetalhesConsultaPage />} />
    </Routes>
  )
}
