import axios from 'axios'

function normalizarBaseUrl(url) {
  if (!url) return url
  const semBarra = url.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(semBarra)) {
    return `https://${semBarra}`
  }
  return semBarra
}

const api = axios.create({
  baseURL: normalizarBaseUrl(import.meta.env.VITE_API_URL || 'https://prontovital-api.onrender.com'),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@prontovital:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
