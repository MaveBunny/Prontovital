import { useAuthContext } from '../context/AuthContext'

/**
 * Hook de autenticação — consume o AuthContext
 * @returns {{ usuario: object|null, autenticado: boolean, carregando: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  return useAuthContext()
}
