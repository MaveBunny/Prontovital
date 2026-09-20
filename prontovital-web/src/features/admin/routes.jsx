import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ClinicasPage from './pages/ClinicasPage'
import EspecialidadesPage from './pages/EspecialidadesPage'
import ProfissionaisPage from './pages/ProfissionaisPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="clinicas" replace />} />
        <Route path="clinicas" element={<ClinicasPage />} />
        <Route path="especialidades" element={<EspecialidadesPage />} />
        <Route path="profissionais" element={<ProfissionaisPage />} />
      </Route>
    </Routes>
  )
}
