import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getDashboard } from '../api/dashboard'
import {
  FolderKanban, CheckCircle2, Umbrella, AlarmClock,
  ArrowRight, FileText, Download, ChevronRight, AlertCircle, X,
} from 'lucide-react'

const metricCardConfig = [
  { key: 'inProgressCount', label: '진행 중 프로젝트', sub: '이번 분기', icon: FolderKanban, color: 'text-primary-600', bg: 'bg-primary-100', cardBg: 'bg-primary-50', modalType: 'inProgress' },
  { key: 'completedCount',  label: '완료된 프로젝트',  sub: '누적',     icon: CheckCircle2, color: 'text-blue-600',    bg: 'bg-blue-100',    cardBg: 'bg-blue-50',    modalType: 'completed' },
  { key: 'todayVacationCount', label: '오늘 휴가 인원', sub: '',        icon: Umbrella,     color: 'text-yellow-600',  bg: 'bg-yellow-100',  cardBg: 'bg-yellow-50',  modalType: 'vacation' },
  { key: 'upcomingDeadlineCount', label: '마감 임박 일정', sub: '이번 주 이내', icon: AlarmClock, color: 'text-red-600', bg: 'bg-red-100', cardBg: 'bg-red-50', modalType: 'deadline' },
]

const issueStatusStyle = {
  '진행중': { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700' },
  '보류':   { dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
}

const typeStyles = {
  project:  'bg-primary-50 text-primary-600',
  vacation: 'bg-yellow-50 text-yellow-600',
  event:    'bg-blue-50 text-blue-600',
}
const typeLabels = { project: '프로젝트', vacation: '휴가', event: '일정' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout title="대시보드">
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">데이터를 불러오는 중...</div>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout title="대시보드">
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">데이터를 불러올 수 없습니다.</div>
      </Layout>
    )
  }

  const upcomingSchedules = data.upcomingSchedules || []
  const myProjects = data.myProjects || []
  const activeIssues = data.activeIssues || []
  const recentFiles = data.recentFiles || []
  const todayVacations = data.todayVacations || []

  return (
    <Layout title="대시보드">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {metricCardConfig.map((card) => {
          const Icon = card.icon
          const value = data[card.key] ?? 0
          return (
            <div
              key={card.label}
              onClick={() => setActiveModal(card.modalType)}
              className={`card p-5 cursor-pointer hover:shadow-md transition-all group ${card.cardBg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-3xl font-semibold leading-none ${card.color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
                </div>
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon style={{ width: 18, height: 18 }} className={card.color} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming Schedules */}
        <div className="col-span-1 md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">다가오는 일정</h3>
            <button onClick={() => navigate('/calendar')} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              전체 보기 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="space-y-2.5">
            {upcomingSchedules.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">예정된 일정이 없습니다</p>}
            {upcomingSchedules.slice(0, 5).map((s, i) => {
              const dateObj = (s.startDate || s.date) ? new Date((s.startDate || s.date) + 'T00:00:00') : null
              const month = dateObj ? String(dateObj.getMonth() + 1).padStart(2, '0') : ''
              const day = dateObj ? String(dateObj.getDate()).padStart(2, '0') : ''
              const dayNames = ['일','월','화','수','목','금','토']
              const dayOfWeek = dateObj ? dayNames[dateObj.getDay()] : ''
              return (
                <div
                  key={i}
                  onClick={() => navigate('/calendar')}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <div className="w-10 flex-shrink-0 text-center">
                    <p className="text-xs text-gray-400 leading-none">{month}월</p>
                    <p className="text-base font-semibold text-gray-900 leading-tight">{day}</p>
                    <p className="text-xs text-gray-400 leading-none">{dayOfWeek}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-primary-600 transition-colors">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{s.project || ''}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${typeStyles[s.eventType] || 'bg-gray-50 text-gray-600'}`}>
                    {typeLabels[s.eventType] || s.eventType}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* My Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">내 프로젝트</h3>
            <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              전체 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="space-y-4">
            {myProjects.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">참여 중인 프로젝트가 없습니다</p>}
            {myProjects.slice(0, 3).map((p) => (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-gray-800 font-medium truncate max-w-[160px] group-hover:text-primary-600 transition-colors">{p.name}</p>
                  <span className={`text-xs font-medium flex-shrink-0 ${p.status === '마감임박' ? 'text-red-500' : 'text-primary-600'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Issues */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">진행 중 이슈</h3>
              {activeIssues.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                  {activeIssues.length}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2.5">
            {activeIssues.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">진행 중인 이슈가 없습니다</p>}
            {activeIssues.slice(0, 4).map((issue) => {
              const st = issueStatusStyle[issue.status] ?? issueStatusStyle['보류']
              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/projects/${issue.projectId}`)}
                  className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <AlertCircle style={{ width: 14, height: 14 }} className="mt-0.5 flex-shrink-0 text-gray-300 group-hover:text-primary-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-primary-600 transition-colors leading-tight">{issue.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{issue.projectName}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {issue.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Files */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">최근 업로드된 산출물</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">파일명</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">프로젝트</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">등록자</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">등록일</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5">버전</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">최근 업로드된 파일이 없습니다</td></tr>
                )}
                {recentFiles.map((f, i) => (
                  <tr
                    key={i}
                    onClick={() => navigate(`/projects/${f.projectId}`)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText style={{ width: 15, height: 15 }} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-800 font-medium group-hover:text-primary-600 transition-colors">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4"><span className="badge-green">{f.projectName}</span></td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{f.uploader}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{f.createdAt}</td>
                    <td className="py-3 text-sm text-gray-500">{f.latestVersion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Metric Detail Modal */}
      {activeModal && (
        <MetricModal
          type={activeModal}
          data={data}
          onClose={() => setActiveModal(null)}
          onNavigate={(path) => { setActiveModal(null); navigate(path) }}
        />
      )}
    </Layout>
  )
}

const projectStatusConfig = {
  '진행중':  { cls: 'badge-green',  dot: 'bg-primary-500' },
  '마감임박': { cls: 'badge-red',   dot: 'bg-red-500' },
  '대기중':  { cls: 'badge-yellow', dot: 'bg-yellow-500' },
  '완료':    { cls: 'badge-gray',   dot: 'bg-gray-400' },
}

function MetricModal({ type, data, onClose, onNavigate }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const modalMeta = {
    inProgress: { title: '진행 중 프로젝트', link: '/projects' },
    completed:  { title: '완료된 프로젝트',  link: '/projects' },
    vacation:   { title: '휴가 인원 현황',   link: '/staff' },
    deadline:   { title: '마감 임박 일정',   link: '/calendar' },
  }
  const { title, link } = modalMeta[type]

  const todayVacations = data.todayVacations || []
  const upcomingSchedules = data.upcomingSchedules || []
  const myProjects = data.myProjects || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 pb-[20vh]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate(link)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors">
              전체 보기 <ArrowRight style={{ width: 12, height: 12 }} />
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
        <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-50">
          {(type === 'inProgress' || type === 'completed') && myProjects.map(p => (
            <div key={p.id} onClick={() => onNavigate(`/projects/${p.id}`)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer group transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.status}</p>
              </div>
            </div>
          ))}
          {type === 'vacation' && todayVacations.map((v, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-semibold text-yellow-700 flex-shrink-0">{v.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.type} · {v.start}</p>
              </div>
              <span className="badge-yellow">{v.type}</span>
            </div>
          ))}
          {type === 'deadline' && upcomingSchedules.map((s, i) => {
            const dateObj = (s.startDate || s.date) ? new Date((s.startDate || s.date) + 'T00:00:00') : null
            return (
              <div key={i} onClick={() => onNavigate('/calendar')} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer group transition-colors">
                <div className="w-10 flex-shrink-0 text-center">
                  <p className="text-base font-semibold text-gray-900 leading-tight">{dateObj ? dateObj.getDate() : ''}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.project || ''}</p>
                </div>
              </div>
            )
          })}
          {((type === 'inProgress' && myProjects.length === 0) ||
            (type === 'completed' && myProjects.length === 0) ||
            (type === 'vacation' && todayVacations.length === 0) ||
            (type === 'deadline' && upcomingSchedules.length === 0)) && (
            <div className="px-5 py-8 text-center text-xs text-gray-400">데이터가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  )
}
