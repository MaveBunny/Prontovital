import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@prontovital:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: redireciona para login se token expirar
// (não deve disparar na própria requisição de login — erro 401 de
// credenciais inválidas precisa chegar ao formulário)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ehLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !ehLogin) {
      localStorage.removeItem('@prontovital:token')
      localStorage.removeItem('@prontovital:user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
