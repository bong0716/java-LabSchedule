import { Bell, Search } from 'lucide-react'

export default function Header({ title, subtitle }) {
  return (
    <header className="bg-[#fffcf8] flex-shrink-0">
      <div className="h-20 flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 leading-tight mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 15, height: 15 }} />
            <input
              type="text"
              placeholder="검색..."
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-[#ece7df] rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
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
      <div className="px-6">
        <div className="border-b border-[#ece7df]" />
      </div>
    </header>
  )
}
