import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  Users,
  LogOut,
  FlaskConical,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/calendar',  icon: CalendarDays,    label: '통합 캘린더' },
  { to: '/projects',  icon: FolderKanban,    label: '프로젝트' },
  { to: '/staff',     icon: Users,           label: '직원 관리' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-30"
      style={{ backgroundColor: '#163c2c' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <FlaskConical className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm text-white leading-tight" style={{ fontWeight: 700 }}>KornecFlow</p>
          <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
            프로젝트 관리
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? 'font-medium'
                  : ''
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('font-medium')) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('font-medium')) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  style={{ width: 18, height: 18, color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            김
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">김연구</p>
            <p className="text-xs truncate leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
              책임연구원
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
        >
          <LogOut style={{ width: 18, height: 18 }} strokeWidth={1.8} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
