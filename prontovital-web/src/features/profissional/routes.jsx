import { Navigate, Route, Routes } from 'react-router-dom'
import ProfissionalLayout from './components/ProfissionalLayout'
import AgendaPage from './pages/AgendaPage'
import AgendamentosPage from './pages/AgendamentosPage'

export default function ProfissionalRoutes() {
  return (
    <Routes>
      {/* Redireciona dashboard para agenda (o fluxo do profissional começa direto na agenda) */}
      <Route path="dashboard" element={<Navigate to="/profissional/agenda" replace />} />

      {/* Layout com sidebar do profissional */}
      <Route element={<ProfissionalLayout />}>
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        {/* Qualquer rota de consulta volta para a agenda */}
        <Route path="consulta/*" element={<Navigate to="/profissional/agenda" replace />} />
      </Route>
    </Routes>
  )
}
