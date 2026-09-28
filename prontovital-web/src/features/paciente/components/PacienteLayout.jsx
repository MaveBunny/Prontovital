import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'
import { meuPerfil, getPerfilDinamico } from '../../../lib/pacientesApi'

const navItems = [
  {
    to: '/paciente/pre-triagem',
    label: 'Pré-Triagem',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    to: '/paciente/clinicas',
    label: 'Clínicas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/paciente/profissionais',
    label: 'Profissionais',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    to: '/paciente/agendamentos',
    label: 'Meus Agendamentos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    to: '/paciente/historico-triagens',
    label: 'Histórico de Triagens',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    to: '/paciente/perfil',
    label: 'Meu Perfil',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
]

export default function PacienteLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbertoMobile, setMenuAbertoMobile] = useState(false)
  const [perfil, setPerfil] = useState(() => getPerfilDinamico())

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const data = await meuPerfil()
        if (data) setPerfil(data)
      } catch {
        setPerfil(getPerfilDinamico())
      }
    }
    carregarPerfil()
  }, [usuario])

  const nomeExibicao = perfil?.nome || usuario?.nome || 'Severino Cavalcanti'
  const emailExibicao = perfil?.email || usuario?.email || 'severino@email.com'
  const iniciais = nomeExibicao
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'SC'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      
      {/* ── Topbar Mobile ── */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Pronto<span className="text-blue-600">Vital</span>
        </h1>
        <button
          onClick={() => setMenuAbertoMobile(!menuAbertoMobile)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Abrir Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuAbertoMobile ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </header>

      {/* ── Menu Mobile Dropdown ── */}
      {menuAbertoMobile && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 bg-slate-900/40 z-30 backdrop-blur-xs" onClick={() => setMenuAbertoMobile(false)}>
          <div className="bg-white p-5 border-b border-slate-200 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {iniciais}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{nomeExibicao}</p>
                <p className="text-xs text-slate-500 truncate">{emailExibicao}</p>
              </div>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuAbertoMobile(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-3 mt-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* ── Sidebar Desktop ── */}
      <aside className="w-[260px] lg:w-[280px] bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Logo ProntoVital */}
          <div className="px-7 pt-7 pb-5">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
              Pronto<span className="text-blue-600">Vital</span>
            </h1>
          </div>

          {/* User Badge */}
          <div className="px-6 py-4 mb-2">
            <div className="flex items-center gap-3 p-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-xs font-bold text-blue-700 tracking-wider">
                  {iniciais}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate">{nomeExibicao}</p>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{emailExibicao}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer / Sair */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-[1300px] overflow-y-auto min-h-[calc(100vh-57px)] md:min-h-screen">
        <Outlet />
      </main>

    </div>
  )
}
