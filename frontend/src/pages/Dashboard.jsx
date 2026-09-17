import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  FolderKanban, CheckCircle2, Umbrella, AlarmClock,
  ArrowRight, FileText, Download, ChevronRight, AlertCircle,
} from 'lucide-react'

const metricCards = [
  { label: '진행 중 프로젝트', value: '8',  sub: '이번 분기',     icon: FolderKanban, color: 'text-primary-600', bg: 'bg-primary-100', cardBg: 'bg-primary-50',  link: '/projects?status=진행중' },
  { label: '완료된 프로젝트',  value: '24', sub: '누적',          icon: CheckCircle2, color: 'text-blue-600',    bg: 'bg-blue-100',    cardBg: 'bg-blue-50',     link: '/projects?status=완료' },
  { label: '오늘 휴가 인원',   value: '3',  sub: '홍길동 외 2명', icon: Umbrella,     color: 'text-yellow-600',  bg: 'bg-yellow-100',  cardBg: 'bg-yellow-50',   link: '/staff?tab=vacation' },
  { label: '마감 임박 일정',   value: '5',  sub: '이번 주 이내',  icon: AlarmClock,   color: 'text-red-600',     bg: 'bg-red-100',     cardBg: 'bg-red-50',      link: '/calendar?filter=project' },
]

const upcomingSchedules = [
  { date: '09-17', day: '수', title: '스마트팜 IoT 중간보고',   project: '스마트팜 IoT 플랫폼', type: 'deadline', urgent: true },
  { date: '09-18', day: '목', title: '환경 모니터링 킥오프 미팅', project: '환경 모니터링 시스템', type: 'meeting', urgent: false },
  { date: '09-19', day: '금', title: '데이터 분석 모듈 납품',   project: '데이터 분석 자동화',  type: 'deadline', urgent: true },
  { date: '09-22', day: '월', title: '바이오 센서 1차 검수',   project: '바이오센서 개발',     type: 'review',  urgent: false },
  { date: '09-23', day: '화', title: '스마트팜 현장 방문',     project: '스마트팜 IoT 플랫폼', type: 'meeting', urgent: false },
]

const recentFiles = [
  { name: '스마트팜_중간보고서_v1.2.pdf',    project: '스마트팜 IoT 플랫폼', projectId: 1, uploader: '홍길동', date: '2026-09-16', size: '2.4MB' },
  { name: '환경모니터링_요구사항분석서.docx', project: '환경 모니터링 시스템', projectId: 2, uploader: '김철수', date: '2026-09-15', size: '840KB' },
  { name: '데이터분석_설계서_v2.0.xlsx',     project: '데이터 분석 자동화',  projectId: 3, uploader: '이영희', date: '2026-09-15', size: '1.1MB' },
  { name: '바이오센서_회로도_v1.0.pdf',      project: '바이오센서 개발',     projectId: 4, uploader: '박지민', date: '2026-09-14', size: '5.2MB' },
]

const myProjects = [
  { id: 1, name: '스마트팜 IoT 플랫폼',  progress: 68, status: '진행중' },
  { id: 2, name: '환경 모니터링 시스템', progress: 12, status: '진행중' },
  { id: 3, name: '데이터 분석 자동화',   progress: 91, status: '마감임박' },
]

const favorites = [
  { id: 1, name: '스마트팜 IoT 플랫폼' },
  { id: 3, name: '데이터 분석 자동화' },
]

const activeIssues = [
  { id: 'ISS-001', title: '센서 데이터 동기화 지연 발생',  project: '스마트팜 IoT 플랫폼',  projectId: 1, status: '처리중' },
  { id: 'ISS-003', title: '대시보드 모바일 레이아웃 깨짐', project: '스마트팜 IoT 플랫폼',  projectId: 1, status: '보류' },
  { id: 'ISS-004', title: '환경센서 API 응답 지연',        project: '환경 모니터링 시스템', projectId: 2, status: '신규' },
  { id: 'ISS-005', title: '분석 모듈 메모리 누수',         project: '데이터 분석 자동화',   projectId: 3, status: '처리중' },
]

const issueStatusStyle = {
  '처리중': { dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700' },
  '신규':   { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700' },
  '보류':   { dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
}

const typeStyles = {
  deadline: 'bg-red-50 text-red-600',
  meeting:  'bg-blue-50 text-blue-600',
  review:   'bg-yellow-50 text-yellow-600',
}
const typeLabels = { deadline: '마감', meeting: '미팅', review: '검수' }

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Layout title="대시보드" subtitle="연구소 현황 요약">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              onClick={() => navigate(card.link)}
              className={`card p-5 cursor-pointer hover:shadow-md transition-all group ${card.cardBg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-3xl font-semibold leading-none ${card.color}`}>{card.value}</p>
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
      <div className="grid grid-cols-4 gap-4">

        {/* Upcoming Schedules */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">다가오는 일정</h3>
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              전체 보기 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="space-y-2.5">
            {upcomingSchedules.map((s, i) => (
              <div
                key={i}
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors group"
              >
                <div className="w-10 flex-shrink-0 text-center">
                  <p className="text-xs text-gray-400 leading-none">{s.date.split('-')[0]}월</p>
                  <p className="text-base font-semibold text-gray-900 leading-tight">{s.date.split('-')[1]}</p>
                  <p className="text-xs text-gray-400 leading-none">{s.day}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-primary-600 transition-colors">{s.title}</p>
                    {s.urgent && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 flex-shrink-0">긴급</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.project}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${typeStyles[s.type]}`}>
                  {typeLabels[s.type]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">내 프로젝트</h3>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              전체 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="space-y-4">
            {myProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-gray-800 font-medium truncate max-w-[160px] group-hover:text-primary-600 transition-colors">{p.name}</p>
                  <span className={`text-xs font-medium flex-shrink-0 ${p.status === '마감임박' ? 'text-red-500' : 'text-primary-600'}`}>
                    {p.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${p.status === '마감임박' ? 'bg-red-400' : 'bg-primary-500'}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.status}</p>
              </div>
            ))}
          </div>

          {/* Favorites */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">즐겨찾기</p>
            {favorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => navigate(`/projects/${fav.id}`)}
                className="w-full flex items-center justify-between py-1.5 text-xs text-gray-600 hover:text-primary-600 group transition-colors"
              >
                <span className="truncate">{fav.name}</span>
                <ChevronRight style={{ width: 13, height: 13 }} className="flex-shrink-0 text-gray-300 group-hover:text-primary-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Active Issues */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">진행 중 이슈</h3>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                {activeIssues.filter(i => i.status !== '해결됨').length}
              </span>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              전체 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="space-y-2.5">
            {activeIssues.map((issue) => {
              const st = issueStatusStyle[issue.status] ?? issueStatusStyle['보류']
              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/projects/${issue.projectId}`)}
                  className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <AlertCircle style={{ width: 14, height: 14 }} className="mt-0.5 flex-shrink-0 text-gray-300 group-hover:text-primary-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate group-hover:text-primary-600 transition-colors leading-tight">
                      {issue.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{issue.project}</p>
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
        <div className="col-span-4 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">최근 업로드된 산출물</h3>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              전체 보기 <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">파일명</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">프로젝트</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">등록자</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">등록일</th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-2.5">크기</th>
                  <th className="pb-2.5"></th>
                </tr>
              </thead>
              <tbody>
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
                    <td className="py-3 pr-4">
                      <span className="badge-green">{f.project}</span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{f.uploader}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{f.date}</td>
                    <td className="py-3 text-sm text-gray-500">{f.size}</td>
                    <td className="py-3 pl-4">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Download style={{ width: 14, height: 14 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
