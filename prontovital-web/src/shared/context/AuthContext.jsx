import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getUsuarioLocal, isAuthenticated, login as loginService, logout as logoutService } from '../../lib/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getUsuarioLocal())
  const [autenticado, setAutenticado] = useState(() => isAuthenticated())
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const user = getUsuarioLocal()
    if (user) {
      setUsuario(user)
      setAutenticado(true)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    setCarregando(true)
    try {
      const data = await loginService(credentials)
      setUsuario(data.usuario)
      setAutenticado(true)
      return data
    } finally {
      setCarregando(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setUsuario(null)
    setAutenticado(false)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, autenticado, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>')
  return ctx
}
