import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProjectCreateModal from '../components/ProjectCreateModal'
import { Search, Plus, ChevronRight } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: '스마트팜 IoT 플랫폼 구축',
    code: 'SF-2026-01',
    pm: '홍길동',
    team: ['홍길동', '김철수', '이영희', '박지민'],
    status: '진행중',
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    progress: 68,
    category: '시스템 개발',
  },
  {
    id: 2,
    name: '환경 모니터링 시스템 개발',
    code: 'EM-2026-02',
    pm: '김철수',
    team: ['김철수', '이영희'],
    status: '진행중',
    startDate: '2026-09-01',
    endDate: '2027-02-28',
    progress: 12,
    category: '시스템 개발',
  },
  {
    id: 3,
    name: '데이터 분석 자동화 모듈',
    code: 'DA-2026-03',
    pm: '이영희',
    team: ['이영희', '최민준'],
    status: '마감임박',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    progress: 91,
    category: '소프트웨어',
  },
  {
    id: 4,
    name: '바이오센서 HW 개발',
    code: 'BS-2026-04',
    pm: '박지민',
    team: ['박지민', '홍길동', '김민서'],
    status: '진행중',
    startDate: '2026-05-01',
    endDate: '2026-11-30',
    progress: 54,
    category: 'HW 개발',
  },
  {
    id: 5,
    name: '연구소 내부망 보안 강화',
    code: 'SEC-2026-05',
    pm: '최민준',
    team: ['최민준'],
    status: '대기중',
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    progress: 0,
    category: '인프라',
  },
  {
    id: 6,
    name: '2025년도 스마트농업 시스템',
    code: 'SA-2025-12',
    pm: '홍길동',
    team: ['홍길동', '김철수'],
    status: '완료',
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    progress: 100,
    category: '시스템 개발',
  },
]

const statusConfig = {
  '진행중':  { cls: 'badge-green',  dot: 'bg-primary-500' },
  '완료':    { cls: 'badge-gray',   dot: 'bg-gray-400' },
  '마감임박': { cls: 'badge-red',   dot: 'bg-red-500' },
  '대기중':  { cls: 'badge-yellow', dot: 'bg-yellow-500' },
}

export default function Projects() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') ?? '전체')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const statuses = ['전체', '진행중', '마감임박', '대기중', '완료']

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.code.includes(search) || p.pm.includes(search)
    const matchStatus = filterStatus === '전체' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <Layout title="프로젝트" subtitle="전체 프로젝트 현황">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 14, height: 14 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="프로젝트명, PM 검색"
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
            />
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus style={{ width: 14, height: 14 }} />
            새 프로젝트
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '전체', count: projects.length, color: 'text-gray-900' },
          { label: '진행중', count: projects.filter(p => p.status === '진행중').length, color: 'text-primary-600' },
          { label: '마감임박', count: projects.filter(p => p.status === '마감임박').length, color: 'text-red-600' },
          { label: '완료', count: projects.filter(p => p.status === '완료').length, color: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
            <span className={`text-2xl font-semibold ${s.color}`}>{s.count}</span>
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Project list */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">프로젝트</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">상태</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">PM</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">팀원</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">기간</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">진행률</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const sc = statusConfig[p.status]
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.code} · {p.category}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={sc.cls}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{p.pm}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1.5">
                        {p.team.slice(0, 3).map((m, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-700"
                          >
                            {m[0]}
                          </div>
                        ))}
                      </div>
                      {p.team.length > 3 && (
                        <span className="text-xs text-gray-400 ml-1">+{p.team.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    <p>{p.startDate}</p>
                    <p className="text-gray-400">~ {p.endDate}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                        <div
                          className={`h-full rounded-full ${
                            p.status === '완료' ? 'bg-gray-400' :
                            p.status === '마감임박' ? 'bg-red-400' : 'bg-primary-500'
                          }`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다</div>
        )}
      </div>
      {showCreateModal && (
        <ProjectCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => {
            console.log('프로젝트 등록:', data)
            // TODO: API 연동
          }}
        />
      )}
    </Layout>
  )
}
