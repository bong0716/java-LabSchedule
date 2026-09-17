import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { Search, Plus, Mail, Phone, Calendar, ChevronDown } from 'lucide-react'

const staff = [
  {
    id: 1,
    name: '홍길동',
    position: '책임연구원',
    team: '시스템팀',
    email: 'hong@kornec.re.kr',
    phone: '010-1234-5678',
    projects: ['스마트팜 IoT 플랫폼 구축', '2025년도 스마트농업 시스템'],
    remainLeave: 8,
    usedLeave: 7,
  },
  {
    id: 2,
    name: '김철수',
    position: '선임연구원',
    team: '시스템팀',
    email: 'kim@kornec.re.kr',
    phone: '010-2345-6789',
    projects: ['스마트팜 IoT 플랫폼 구축', '환경 모니터링 시스템 개발'],
    remainLeave: 12,
    usedLeave: 3,
  },
  {
    id: 3,
    name: '이영희',
    position: '선임연구원',
    team: '소프트웨어팀',
    email: 'lee@kornec.re.kr',
    phone: '010-3456-7890',
    projects: ['스마트팜 IoT 플랫폼 구축', '환경 모니터링 시스템 개발', '데이터 분석 자동화 모듈'],
    remainLeave: 10,
    usedLeave: 5,
  },
  {
    id: 4,
    name: '박지민',
    position: '연구원',
    team: 'HW팀',
    email: 'park@kornec.re.kr',
    phone: '010-4567-8901',
    projects: ['스마트팜 IoT 플랫폼 구축', '바이오센서 HW 개발'],
    remainLeave: 15,
    usedLeave: 0,
  },
  {
    id: 5,
    name: '최민준',
    position: '연구원',
    team: '소프트웨어팀',
    email: 'choi@kornec.re.kr',
    phone: '010-5678-9012',
    projects: ['데이터 분석 자동화 모듈', '연구소 내부망 보안 강화'],
    remainLeave: 13,
    usedLeave: 2,
  },
  {
    id: 6,
    name: '김민서',
    position: '연구원',
    team: 'HW팀',
    email: 'kimms@kornec.re.kr',
    phone: '010-6789-0123',
    projects: ['바이오센서 HW 개발'],
    remainLeave: 15,
    usedLeave: 0,
  },
]

const vacationSchedules = [
  { name: '홍길동', type: '연차', start: '2026-09-16', end: '2026-09-16', days: 1, status: '승인' },
  { name: '김민서', type: '반차', start: '2026-09-12', end: '2026-09-12', days: 0.5, status: '승인' },
  { name: '이영희', type: '연차', start: '2026-09-25', end: '2026-09-26', days: 2, status: '대기' },
  { name: '박지민', type: '연차', start: '2026-10-05', end: '2026-10-07', days: 3, status: '대기' },
]

const teamColors = {
  '시스템팀': 'badge-green',
  '소프트웨어팀': 'badge-blue',
  'HW팀': 'badge-yellow',
}

export default function Staff() {
  const [searchParams] = useSearchParams()
  const vacationRef = useRef(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card') // 'card' | 'table'
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    if (searchParams.get('tab') === 'vacation' && vacationRef.current) {
      vacationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const filtered = staff.filter(s =>
    s.name.includes(search) || s.team.includes(search) || s.position.includes(search)
  )

  return (
    <Layout title="직원 관리" subtitle="연구소 인력 현황 및 휴가 관리">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            {[['card', '카드'], ['table', '테이블']].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === v ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 14, height: 14 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이름, 팀 검색"
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-1.5">
            <Calendar style={{ width: 14, height: 14 }} />
            휴가 신청
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Plus style={{ width: 14, height: 14 }} />
            직원 추가
          </button>
        </div>
      </div>

      {view === 'card' ? (
        /* Card view */
        <div className="grid grid-cols-3 gap-4 mb-6">
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedMember(selectedMember?.id === s.id ? null : s)}
              className="card p-5 cursor-pointer hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-base font-semibold text-primary-700 flex-shrink-0">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{s.name}</p>
                    <span className={teamColors[s.team] || 'badge-gray'}>{s.team}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.position}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail style={{ width: 12, height: 12 }} className="text-gray-400 flex-shrink-0" />
                  {s.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone style={{ width: 12, height: 12 }} className="text-gray-400 flex-shrink-0" />
                  {s.phone}
                </div>
              </div>

              {/* Leave meter */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">연가 현황</span>
                  <span className="text-xs text-gray-700 font-medium">
                    잔여 <span className="text-primary-600">{s.remainLeave}일</span> / {s.remainLeave + s.usedLeave}일
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-400 rounded-full"
                    style={{ width: `${(s.usedLeave / (s.remainLeave + s.usedLeave)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">사용 {s.usedLeave}일</span>
                </div>
              </div>

              {/* Participating projects count */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {s.projects.slice(0, 2).map((proj, pi) => (
                  <span key={pi} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded truncate max-w-[150px]">{proj}</span>
                ))}
                {s.projects.length > 2 && (
                  <span className="text-xs text-gray-400">+{s.projects.length - 2}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="card overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">소속</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">직급</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">연락처</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">참여 프로젝트</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">연가 잔여</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                        {s.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={teamColors[s.team] || 'badge-gray'}>{s.team}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{s.position}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{s.email}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {s.projects.slice(0, 1).map((p, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                      ))}
                      {s.projects.length > 1 && (
                        <span className="text-xs text-gray-400">+{s.projects.length - 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-primary-600">{s.remainLeave}일</span>
                    <span className="text-xs text-gray-400 ml-1">/ {s.remainLeave + s.usedLeave}일</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vacation Schedule */}
      <div ref={vacationRef} className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">휴가 신청 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">이름</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">구분</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">기간</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5 pr-4">일수</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5">상태</th>
              </tr>
            </thead>
            <tbody>
              {vacationSchedules.map((v, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                        {v.name[0]}
                      </div>
                      <span className="text-sm text-gray-800">{v.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-600">{v.type}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600">
                    {v.start === v.end ? v.start : `${v.start} ~ ${v.end}`}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium text-gray-800">{v.days}일</td>
                  <td className="py-3">
                    <span className={v.status === '승인' ? 'badge-green' : 'badge-yellow'}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
