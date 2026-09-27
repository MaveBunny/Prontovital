import { Navigate, Route, Routes } from 'react-router-dom'
import ClinicaLayout from './components/ClinicaLayout'
import VisaoGeralPage from './pages/VisaoGeralPage'
import AgendaPage from './pages/AgendaPage'
import AgendamentosPage from './pages/AgendamentosPage'
import PerfilClinicaPage from './pages/PerfilClinicaPage'
import DisponibilidadePage from './pages/DisponibilidadePage'
import MedicosPage from './pages/MedicosPage'

export default function ClinicaRoutes() {
  return (
    <Routes>
      <Route element={<ClinicaLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VisaoGeralPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="medicos" element={<MedicosPage />} />
        <Route path="disponibilidade" element={<DisponibilidadePage />} />
        <Route path="perfil" element={<PerfilClinicaPage />} />
      </Route>
    </Routes>
  )
}
