import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Accueil',    path: '/dashboard',  icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  { id: 'commandes',  label: 'Commandes',  path: '/commandes',  icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
  { id: 'pharmacies', label: 'Pharmacies', path: '/pharmacies', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
  { id: 'sante',      label: 'Santé',      path: '/sante',      icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3' },
  { id: 'profil',     label: 'Profil',     path: '/profil',     icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuth = ['/login'].includes(location.pathname)

  if (isAuth) return <>{children}</>

  return (
    <div className="min-h-screen flex" style={{ background: '#C1EAF5' }}>

      {/* Sidebar — desktop uniquement */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0 p-6"
        style={{ background: '#0E4554', borderRight: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Logo */}
        <div className="mb-10">
          <img src="/src/assets/LOGO.png" alt="PharmaLink" className="h-12 w-auto" />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map(({ id, label, path, icon }) => {
            const active = location.pathname === path
            return (
              <button key={id} onClick={() => navigate(path)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left"
                style={active
                  ? { background: 'rgba(193,234,245,0.15)', color: '#C1EAF5' }
                  : { color: 'rgba(193,234,245,0.5)', background: 'transparent' }
                }>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                  stroke={active ? '#3FE1E6' : 'rgba(193,234,245,0.5)'} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                {label}
              </button>
            )
          })}
        </nav>

        {/* Commander bouton */}
        <button onClick={() => navigate('/commande')}
          className="w-full py-3 rounded-2xl text-sm font-medium mt-4"
          style={{ background: '#1191B4', color: '#C1EAF5' }}>
          + Commander
        </button>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </main>

    </div>
  )
}