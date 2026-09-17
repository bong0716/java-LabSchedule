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
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-700 text-gray-900 leading-tight" style={{ fontWeight: 700 }}>LabFlow</p>
          <p className="text-xs text-gray-400 leading-tight">연구소 프로젝트 관리</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                  style={{ width: 18, height: 18 }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700 flex-shrink-0">
            김
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate leading-tight">김연구</p>
            <p className="text-xs text-gray-400 truncate leading-tight">책임연구원</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
        >
          <LogOut style={{ width: 18, height: 18 }} strokeWidth={1.8} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
