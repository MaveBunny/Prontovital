import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

export default function ClinicaRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
    </Routes>
  )
}
