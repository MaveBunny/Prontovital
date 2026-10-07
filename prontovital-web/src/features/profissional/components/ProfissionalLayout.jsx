import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'

const navItems = [
  {
    to: '/profissional/agenda',
    label: 'Agenda',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>
    )
  },
  {
    to: '/profissional/agendamentos',
    label: 'Agendamentos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    )
  },
]

export default function ProfissionalLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">

      {/* ── Sidebar Desktop ── */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0">

        <div>
          {/* Logo */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-800">
              Pronto<span className="text-blue-600">Vital</span>
            </h1>
          </div>

          {/* User Badge */}
          <div className="px-6 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-teal-600 tracking-wider">
                  {usuario?.nome?.substring(0, 2).toUpperCase() || 'DC'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate">{usuario?.nome || 'Profissional'}</p>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{usuario?.email || 'email@clinica.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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

        {/* Footer / Sair */}
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

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}
