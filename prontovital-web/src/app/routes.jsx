import { Navigate, Route, Routes } from 'react-router-dom'
import RegisterPage from '../features/auth/pages/RegisterPage'
import AdminRoutes from '../features/admin/routes'
import ClinicaRoutes from '../features/clinica/routes'
import PacienteRoutes from '../features/paciente/routes'
import ProfissionalRoutes from '../features/profissional/routes'
import { useAuth } from '../shared/hooks/useAuth'

function RotaProtegida({ children }) {
  const { autenticado } = useAuth()
  return autenticado ? children : <Navigate to="/" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />

      <Route
        path="/paciente/*"
        element={
          <RotaProtegida>
            <PacienteRoutes />
          </RotaProtegida>
        }
      />

      <Route
        path="/profissional/*"
        element={
          <RotaProtegida>
            <ProfissionalRoutes />
          </RotaProtegida>
        }
      />

      <Route
        path="/clinica/*"
        element={
          <RotaProtegida>
            <ClinicaRoutes />
          </RotaProtegida>
        }
      />

      <Route
        path="/admin/*"
        element={
          <RotaProtegida>
            <AdminRoutes />
          </RotaProtegida>
        }
      />

      <Route path="/triagem/*" element={<Navigate to="/paciente/clinicas" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
