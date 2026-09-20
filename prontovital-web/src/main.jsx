import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css' // Corrigido para carregar o tailwind (caso precise, ou ./index.css se existir)
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
