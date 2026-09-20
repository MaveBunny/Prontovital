import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'

const navItems = [
  { to: '/admin/clinicas', label: 'Clínicas', emoji: '🏥' },
  { to: '/admin/especialidades', label: 'Especialidades', emoji: '🩺' },
  { to: '/admin/profissionais', label: 'Profissionais', emoji: '👨‍⚕️' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">ProntoVital</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium ml-1">Admin</span>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="text-xs text-slate-400 hover:text-slate-600">Sair</button>
      </header>

      {/* Nav lateral (desktop) / inferior (mobile) */}
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-100 p-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`
              }
            >
              <span>{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 flex items-center justify-around z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-lg">{item.emoji}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
