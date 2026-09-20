import { Navigate, Route, Routes } from 'react-router-dom'
import HistoricoTriagem from './pages/HistoricoTriagem'
import IniciarTriagem from './pages/IniciarTriagem'

export default function TriagemRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="iniciar" replace />} />
      <Route path="iniciar" element={<IniciarTriagem />} />
      <Route path="historico" element={<HistoricoTriagem />} />
    </Routes>
  )
}
