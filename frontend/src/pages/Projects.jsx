import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProjectCreateModal from '../components/ProjectCreateModal'
import { getProjects, createProject as apiCreateProject } from '../api/projects'
import { getStaffList } from '../api/staff'
import { Search, Plus, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

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
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [projects, setProjects] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = () => {
    setLoading(true)
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProjects()
    getStaffList().then(setStaffList).catch(console.error)
  }, [])

  const statuses = ['전체', '진행중', '마감임박', '대기중', '완료']

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(search) || p.code.includes(search) || (p.pm || '').includes(search)
    const matchStatus = filterStatus === '전체' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0
    const dir = sortDirection === 'asc' ? 1 : -1
    if (sortField === 'name') return a.name.localeCompare(b.name) * dir
    if (sortField === 'startDate') return (a.startDate || '').localeCompare(b.startDate || '') * dir
    return 0
  })

  const handleCreateProject = async (data) => {
    try {
      const pmStaff = staffList.find(s => s.name === data.pm)
      const teamIds = data.team
        .map(name => staffList.find(s => s.name === name))
        .filter(Boolean)
        .map(s => s.id)

      await apiCreateProject({
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status,
        category: data.category,
        pmId: pmStaff?.id || null,
        startDate: data.startDate,
        endDate: data.endDate,
        teamMemberIds: teamIds,
      })
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout title="프로젝트">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${filterStatus === s ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 14, height: 14 }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="프로젝트명, PM 검색"
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg w-full md:w-52 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400" />
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
            <Plus style={{ width: 14, height: 14 }} /> 새 프로젝트
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
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

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                      프로젝트
                      {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />) : <ChevronDown style={{ width: 12, height: 12 }} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">상태</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">PM</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">팀원</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                    <button onClick={() => toggleSort('startDate')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                      기간
                      {sortField === 'startDate' ? (sortDirection === 'asc' ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />) : <ChevronDown style={{ width: 12, height: 12 }} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => {
                  const sc = statusConfig[p.status] || statusConfig['대기중']
                  return (
                    <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors group">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.code} · {p.category}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={sc.cls}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`} />{p.status}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{p.pm}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1.5">
                            {(p.team || []).slice(0, 3).map((m, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-700">{m[0]}</div>
                            ))}
                          </div>
                          {(p.team || []).length > 3 && <span className="text-xs text-gray-400 ml-1">+{p.team.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        <p>{p.startDate}</p>
                        <p className="text-gray-400">~ {p.endDate}</p>
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sorted.length === 0 && <div className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다</div>}
          </div>
        )}
      </div>
      {showCreateModal && (
        <ProjectCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
          staffList={staffList}
        />
      )}
    </Layout>
  )
}
