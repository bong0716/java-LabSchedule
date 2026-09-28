import { Bell, Search, Menu } from 'lucide-react'

export default function Header({ title, subtitle, onMenuToggle }) {
  return (
    <header className="bg-[#fffcf8] flex-shrink-0">
      <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
          >
            <Menu style={{ width: 20, height: 20 }} className="text-gray-600" strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 leading-tight mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 15, height: 15 }} />
            <input
              type="text"
              placeholder="검색..."
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-[#ece7df] rounded-lg w-32 md:w-48 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors">
            <Bell style={{ width: 18, height: 18 }} className="text-gray-500" strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
          </button>
        </div>
      </div>
      {/* 카드 영역 여백에 맞춘 구분선 */}
      <div className="px-4 md:px-6">
        <div className="border-b border-[#ece7df]" />
      </div>
    </header>
  )
}
