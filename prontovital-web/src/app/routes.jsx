import { Navigate, Route, Routes } from 'react-router-dom'
import RegisterPage from '../features/auth/pages/RegisterPage'
import AdminRoutes from '../features/admin/routes'
import ClinicaRoutes from '../features/clinica/routes'
import PacienteRoutes from '../features/paciente/routes'
import ProfissionalRoutes from '../features/profissional/routes'
import { useAuth } from '../shared/hooks/useAuth'

/**
 * Rota protegida — redireciona para / se não autenticado
 */
function RotaProtegida({ children }) {
  const { autenticado } = useAuth()
  return autenticado ? children : <Navigate to="/" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Público ── */}
      <Route path="/" element={<RegisterPage />} />

      {/* ── Paciente ── */}
      <Route
        path="/paciente/*"
        element={
          <RotaProtegida>
            <PacienteRoutes />
          </RotaProtegida>
        }
      />

      {/* ── Profissional ── */}
      <Route
        path="/profissional/*"
        element={
          <RotaProtegida>
            <ProfissionalRoutes />
          </RotaProtegida>
        }
      />

      {/* ── Clínica ── */}
      <Route
        path="/clinica/*"
        element={
          <RotaProtegida>
            <ClinicaRoutes />
          </RotaProtegida>
        }
      />

      {/* ── Admin ── */}
      <Route
        path="/admin/*"
        element={
          <RotaProtegida>
            <AdminRoutes />
          </RotaProtegida>
        }
      />

      {/* ── Redirecionamento da Triagem para a Pré-Triagem do Paciente ── */}
      <Route path="/triagem/*" element={<Navigate to="/paciente/pre-triagem" replace />} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
