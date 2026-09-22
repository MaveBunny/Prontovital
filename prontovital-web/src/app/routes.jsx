import { Navigate, Route, Routes } from 'react-router-dom'
import RegisterPage from '../features/auth/pages/RegisterPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Tela Principal de Login e Cadastro ── */}
      <Route path="/" element={<RegisterPage />} />

      {/* ── Redirecionamento padrão para a tela de autenticação ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
