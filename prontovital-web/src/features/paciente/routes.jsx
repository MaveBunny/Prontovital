import { Navigate, Route, Routes } from 'react-router-dom'
import PacienteLayout from './components/PacienteLayout'
import Dashboard from './pages/Dashboard'
import EditarPerfilPage from './pages/EditarPerfilPage'
import PerfilPage from './pages/PerfilPage'

export default function PacienteRoutes() {
  return (
    <Routes>
      <Route element={<PacienteLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="editar-perfil" element={<EditarPerfilPage />} />
        <Route path="triagem" element={<Navigate to="/triagem/iniciar" replace />} />
        <Route path="agendamentos" element={<div className="p-6 text-slate-400 text-center mt-10">Agendamentos em breve</div>} />
      </Route>
    </Routes>
  )
}
