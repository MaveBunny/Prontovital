import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'

const navItems = [
  {
    to: '/admin/agendamentos',
    label: 'Agendamentos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    )
  },
  {
    to: '/admin/clinicas',
    label: 'Clínicas',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )
  },
  {
    to: '/admin/profissionais',
    label: 'Profissionais',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    )
  }
]

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMenu = () => setMobileMenuOpen(false)

  const nomeUsuario = usuario?.nome || 'Administrador'
  const emailUsuario = usuario?.email || 'admin@prontovital.com'
  const iniciais = nomeUsuario.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">

      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          Pronto<span className="text-blue-600">Vital</span>
        </h1>
        <button onClick={toggleMenu} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <div>
          <div className="hidden md:block px-8 pt-8 pb-6 border-b border-slate-100">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-800">
              Pronto<span className="text-blue-600">Vital</span>
            </h1>
          </div>

          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50 md:bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-purple-600 tracking-wider">
                  {iniciais}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-800 truncate">{nomeUsuario}</p>
              </div>
            </div>
          </div>

          <nav className="p-4 flex flex-col gap-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50/70 text-blue-700 relative after:absolute after:left-0 after:top-1.5 after:bottom-1.5 after:w-[3px] after:bg-blue-600 after:rounded-r-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-y-auto overflow-x-hidden md:p-0">
        <Outlet />
      </main>

    </div>
  )
}
