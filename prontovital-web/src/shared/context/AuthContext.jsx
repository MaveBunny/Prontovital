import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  getUsuarioLocal,
  isAuthenticated,
  login as loginService,
  logout as logoutService,
} from '../../lib/authService'
import api from '../../lib/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getUsuarioLocal())
  const [autenticado, setAutenticado] = useState(() => isAuthenticated())
  const [carregando, setCarregando] = useState(false)

  const atualizarUsuario = useCallback((dadosAtualizados) => {
    const usuarioAtual = getUsuarioLocal() || {}

    const usuarioAtualizado = {
      ...usuarioAtual,
      ...dadosAtualizados,
    }

    localStorage.setItem(
      '@prontovital:user',
      JSON.stringify(usuarioAtualizado)
    )

    setUsuario(usuarioAtualizado)

    return usuarioAtualizado
  }, [])

  useEffect(() => {
    const user = getUsuarioLocal()

    if (user) {
      setUsuario(user)
      setAutenticado(true)
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    async function carregarDadosProfissional() {
      if (!usuario?.id_profissional) {
        return
      }

      try {
        const { data } = await api.get(
          `/profissionais/${usuario.id_profissional}`
        )

        if (cancelado) {
          return
        }

        const dadosUsuario =
          data?.User ??
          data?.user ??
          data?.usuario ??
          data

        const dadosAtualizados = {}

        if (dadosUsuario?.nome) {
          dadosAtualizados.nome = dadosUsuario.nome
        }

        if (dadosUsuario?.email) {
          dadosAtualizados.email = dadosUsuario.email
        }

        if (Object.keys(dadosAtualizados).length > 0) {
          atualizarUsuario(dadosAtualizados)
        }
      } catch {
        // A falha ao carregar o perfil não impede o acesso à área profissional.
      }
    }

    carregarDadosProfissional()

    return () => {
      cancelado = true
    }
  }, [usuario?.id_profissional, atualizarUsuario])

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
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        carregando,
        login,
        logout,
        atualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>')
  }

  return ctx
}
