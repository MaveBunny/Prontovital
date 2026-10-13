import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminAgendamentosPage from './pages/AdminAgendamentosPage'
import ClinicasPage from './pages/ClinicasPage'
import ProfissionaisPage from './pages/ProfissionaisPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="agendamentos" replace />} />
        <Route path="agendamentos" element={<AdminAgendamentosPage />} />
        <Route path="clinicas" element={<ClinicasPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
      </Route>
    </Routes>
  )
}
