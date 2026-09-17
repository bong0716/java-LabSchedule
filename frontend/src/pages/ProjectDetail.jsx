import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import FileUploadModal from '../components/FileUploadModal'
import ReportWriteModal from '../components/ReportWriteModal'
import IssueCreateModal from '../components/IssueCreateModal'
import {
  ChevronLeft, Upload, MessageSquarePlus, FileText, Download,
  ChevronDown, ChevronRight, User, Calendar, Clock, AlertCircle,
  GitBranch, Plus, CheckCircle2, Pause, ListTodo,
  BarChart3, ClipboardList, ChevronUp,
} from 'lucide-react'

// ─── 공통 데이터 ────────────────────────────────────────────────
const allProjects = [
  { id: 1, name: '스마트팜 IoT 플랫폼 구축',    code: 'SF-2026-01',  status: '진행중',  pm: '홍길동', startDate: '2026-03-01', endDate: '2026-12-31', progress: 68,  description: '스마트팜 환경 제어를 위한 IoT 센서 통합 플랫폼 개발. 온도/습도/CO2/조도 센서 데이터 수집 및 대시보드 구현.' },
  { id: 2, name: '환경 모니터링 시스템 개발',   code: 'EM-2026-02',  status: '진행중',  pm: '김철수', startDate: '2026-09-01', endDate: '2027-02-28', progress: 12,  description: '대기질, 온도, 습도 등 환경 데이터를 실시간 수집·분석하는 모니터링 시스템 개발.' },
  { id: 3, name: '데이터 분석 자동화 모듈',     code: 'DA-2026-03',  status: '마감임박', pm: '이영희', startDate: '2026-06-01', endDate: '2026-09-30', progress: 91,  description: '반복적인 데이터 분석 업무를 자동화하는 모듈 개발. Python 기반 파이프라인 및 리포트 자동 생성.' },
  { id: 4, name: '바이오센서 HW 개발',          code: 'BS-2026-04',  status: '진행중',  pm: '박지민', startDate: '2026-05-01', endDate: '2026-11-30', progress: 54,  description: '생체 신호 측정을 위한 고감도 바이오센서 HW 설계 및 제작.' },
  { id: 5, name: '연구소 내부망 보안 강화',      code: 'SEC-2026-05', status: '대기중',  pm: '최민준', startDate: '2026-10-01', endDate: '2026-11-30', progress: 0,   description: '연구소 내부망 취약점 분석 및 보안 강화 방안 수립·적용.' },
  { id: 6, name: '2025년도 스마트농업 시스템',   code: 'SA-2025-12',  status: '완료',   pm: '홍길동', startDate: '2025-03-01', endDate: '2025-12-31', progress: 100, description: '스마트농업 환경 제어 및 생산성 향상을 위한 통합 관리 시스템 개발.' },
]

const members = [
  { name: '홍길동', role: 'PM',  team: '시스템팀',       mm: 5.0, joined: '2026-03-01' },
  { name: '김철수', role: '팀원', team: '시스템팀',       mm: 3.0, joined: '2026-03-01' },
  { name: '이영희', role: '팀원', team: '소프트웨어팀',    mm: 2.5, joined: '2026-04-01' },
  { name: '박지민', role: '팀원', team: 'HW팀',           mm: 2.0, joined: '2026-03-01' },
]

// ─── 타임라인 데이터 ────────────────────────────────────────────
const timeline = [
  { date: '2026-09-16', author: '홍길동', type: 'upload',    content: '스마트팜_중간보고서_v1.2.pdf 업로드',        detail: '심사위원 피드백 반영 최종본' },
  { date: '2026-09-10', author: '김철수', type: 'issue',     content: '[이슈] 센서 데이터 동기화 지연 발생',         detail: 'MQTT 브로커와 DB 간 3~5초 지연 현상. 확인 중.' },
  { date: '2026-09-05', author: '시스템', type: 'change',    content: '일정 마감일 변경: 중간보고 2026-09-20 → 2026-09-17', detail: null },
  { date: '2026-08-28', author: '이영희', type: 'upload',    content: '센서_인터페이스_설계서_v2.0.docx 업로드',      detail: null },
  { date: '2026-08-15', author: '박지민', type: 'upload',    content: 'HW_회로도_Rev3.pdf 업로드',                  detail: 'PCB 3차 수정본' },
  { date: '2026-03-01', author: '홍길동', type: 'milestone', content: '프로젝트 킥오프',                            detail: '전체 팀원 참석. 일정 확정.' },
]

// ─── 산출물 데이터 ──────────────────────────────────────────────
const files = [
  {
    id: 1, name: '스마트팜_중간보고서', category: '보고서', uploader: '홍길동', date: '2026-09-16',
    versions: [
      { ver: 'v1.2', date: '2026-09-16', uploader: '홍길동', size: '2.4MB' },
      { ver: 'v1.1', date: '2026-08-20', uploader: '홍길동', size: '2.1MB' },
      { ver: 'v1.0', date: '2026-07-15', uploader: '홍길동', size: '1.8MB' },
    ],
  },
  {
    id: 2, name: '센서_인터페이스_설계서', category: '설계서', uploader: '이영희', date: '2026-08-28',
    versions: [
      { ver: 'v2.0', date: '2026-08-28', uploader: '이영희', size: '840KB' },
      { ver: 'v1.0', date: '2026-05-10', uploader: '이영희', size: '650KB' },
    ],
  },
  {
    id: 3, name: 'HW_회로도', category: 'HW도면', uploader: '박지민', date: '2026-08-15',
    versions: [
      { ver: 'Rev3', date: '2026-08-15', uploader: '박지민', size: '5.2MB' },
      { ver: 'Rev2', date: '2026-06-20', uploader: '박지민', size: '4.9MB' },
      { ver: 'Rev1', date: '2026-04-05', uploader: '박지민', size: '4.5MB' },
    ],
  },
]

// ─── 이슈 데이터 ────────────────────────────────────────────────
const issuesData = [
  {
    id: 'ISS-001',
    title: '센서 데이터 동기화 지연 발생',
    category: '기술',
    status: '처리중',
    assignee: '김철수',
    reporter: '김철수',
    openedDate: '2026-09-10',
    dueDate: '2026-09-20',
    description: 'MQTT 브로커와 MariaDB 간 데이터 적재 시 3~5초 지연 현상이 간헐적으로 발생함. 실시간 모니터링 정확도에 영향.',
    responses: [
      { date: '2026-09-12', author: '이영희', action: '원인 분석', content: 'DB 커넥션 풀 설정 부족으로 인한 대기 현상으로 추정. 풀 크기 확인 필요.' },
      { date: '2026-09-14', author: '김철수', action: '조치 중', content: 'HikariCP 풀 최대값 10 → 30으로 조정 후 테스트 진행 중.' },
    ],
  },
  {
    id: 'ISS-002',
    title: '온습도 센서 0값 이상 출력',
    category: 'HW',
    status: '해결됨',
    assignee: '박지민',
    reporter: '홍길동',
    openedDate: '2026-08-05',
    dueDate: '2026-08-15',
    description: '3번 구역 온습도 센서(DHT22)에서 간헐적으로 0값 출력. 데이터 신뢰도 저하.',
    responses: [
      { date: '2026-08-08', author: '박지민', action: '원인 분석', content: '센서 납땜 불량으로 인한 접촉 불량 확인.' },
      { date: '2026-08-12', author: '박지민', action: '조치 완료', content: '센서 재납땜 및 교체 완료. 정상 데이터 확인.' },
      { date: '2026-08-15', author: '홍길동', action: '종료', content: '이슈 해결 확인 후 종료 처리.' },
    ],
  },
  {
    id: 'ISS-003',
    title: '대시보드 모바일 레이아웃 깨짐',
    category: 'UI/UX',
    status: '보류',
    assignee: '이영희',
    reporter: '이영희',
    openedDate: '2026-09-01',
    dueDate: '2026-10-31',
    description: '모바일(iOS Safari) 환경에서 실시간 그래프 컴포넌트가 화면을 초과하는 현상.',
    responses: [],
  },
]

// ─── WBS 데이터 ─────────────────────────────────────────────────
const wbsData = [
  {
    id: '1', level: 0, name: '요구사항 분석 및 설계',
    assignee: '홍길동', planStart: '2026-03-01', planEnd: '2026-04-30',
    actualStart: '2026-03-01', actualEnd: '2026-04-28', progress: 100, status: '완료',
  },
  {
    id: '1.1', level: 1, name: '요구사항 수집 및 분석',
    assignee: '홍길동', planStart: '2026-03-01', planEnd: '2026-03-31',
    actualStart: '2026-03-01', actualEnd: '2026-03-28', progress: 100, status: '완료',
  },
  {
    id: '1.2', level: 1, name: '시스템 아키텍처 설계',
    assignee: '이영희', planStart: '2026-04-01', planEnd: '2026-04-30',
    actualStart: '2026-04-01', actualEnd: '2026-04-28', progress: 100, status: '완료',
  },
  {
    id: '2', level: 0, name: 'HW 개발',
    assignee: '박지민', planStart: '2026-04-01', planEnd: '2026-07-31',
    actualStart: '2026-04-01', actualEnd: '', progress: 90, status: '진행중',
  },
  {
    id: '2.1', level: 1, name: '센서 회로 설계',
    assignee: '박지민', planStart: '2026-04-01', planEnd: '2026-05-31',
    actualStart: '2026-04-05', actualEnd: '2026-05-28', progress: 100, status: '완료',
  },
  {
    id: '2.2', level: 1, name: 'PCB 제작 및 검수',
    assignee: '박지민', planStart: '2026-06-01', planEnd: '2026-07-31',
    actualStart: '2026-06-03', actualEnd: '', progress: 80, status: '진행중',
  },
  {
    id: '3', level: 0, name: 'SW 개발',
    assignee: '이영희', planStart: '2026-05-01', planEnd: '2026-10-31',
    actualStart: '2026-05-01', actualEnd: '', progress: 65, status: '진행중',
  },
  {
    id: '3.1', level: 1, name: 'IoT 데이터 수집 모듈',
    assignee: '김철수', planStart: '2026-05-01', planEnd: '2026-07-31',
    actualStart: '2026-05-01', actualEnd: '2026-07-25', progress: 100, status: '완료',
  },
  {
    id: '3.2', level: 1, name: '실시간 대시보드 개발',
    assignee: '이영희', planStart: '2026-07-01', planEnd: '2026-09-30',
    actualStart: '2026-07-05', actualEnd: '', progress: 70, status: '진행중',
  },
  {
    id: '3.3', level: 1, name: 'DB 설계 및 API 개발',
    assignee: '김철수', planStart: '2026-05-01', planEnd: '2026-08-31',
    actualStart: '2026-05-01', actualEnd: '2026-08-20', progress: 100, status: '완료',
  },
  {
    id: '3.4', level: 1, name: '알림 / 이상 감지 기능',
    assignee: '이영희', planStart: '2026-09-01', planEnd: '2026-10-31',
    actualStart: '2026-09-05', actualEnd: '', progress: 20, status: '진행중',
  },
  {
    id: '4', level: 0, name: '통합 테스트 및 납품',
    assignee: '홍길동', planStart: '2026-11-01', planEnd: '2026-12-31',
    actualStart: '', actualEnd: '', progress: 0, status: '대기',
  },
  {
    id: '4.1', level: 1, name: '시스템 통합 테스트',
    assignee: '홍길동', planStart: '2026-11-01', planEnd: '2026-11-30',
    actualStart: '', actualEnd: '', progress: 0, status: '대기',
  },
  {
    id: '4.2', level: 1, name: '현장 설치 및 납품',
    assignee: '홍길동', planStart: '2026-12-01', planEnd: '2026-12-31',
    actualStart: '', actualEnd: '', progress: 0, status: '대기',
  },
]

// ─── 보고서 데이터 ───────────────────────────────────────────────
const reports = [
  {
    id: 1, type: '주간', title: '9월 3주차 주간 업무 보고', author: '홍길동',
    date: '2026-09-13', period: '2026-09-09 ~ 2026-09-13',
    thisWeek: [
      '대시보드 실시간 그래프 컴포넌트 개발 완료 (이영희)',
      'DB 커넥션 풀 이슈 원인 분석 진행 중 (김철수)',
      'PCB Rev3 외부 검수 의뢰 완료 (박지민)',
    ],
    nextWeek: [
      '중간보고서 v1.2 최종 작성 및 제출 (홍길동)',
      'DB 커넥션 풀 조정 및 성능 검증 (김철수)',
      '알림 / 이상 감지 기능 개발 착수 (이영희)',
    ],
    issues: 'ISS-001 (DB 동기화 지연) 조치 진행 중. 이번 주 내 해결 예정.',
    progress: 68,
  },
  {
    id: 2, type: '주간', title: '9월 2주차 주간 업무 보고', author: '홍길동',
    date: '2026-09-06', period: '2026-09-02 ~ 2026-09-06',
    thisWeek: [
      '대시보드 레이아웃 설계 완료 (이영희)',
      '센서 인터페이스 설계서 v2.0 작성 (이영희)',
      'DB API 개발 완료 (김철수)',
    ],
    nextWeek: [
      '대시보드 실시간 그래프 개발 (이영희)',
      'DB 성능 테스트 (김철수)',
      'PCB Rev3 제작 의뢰 (박지민)',
    ],
    issues: '특이사항 없음.',
    progress: 60,
  },
  {
    id: 3, type: '월간', title: '2026년 8월 월간 업무 보고', author: '홍길동',
    date: '2026-08-31', period: '2026-08-01 ~ 2026-08-31',
    thisWeek: [
      '데이터 수집 모듈 최종 완료 (김철수)',
      '센서 회로 PCB Rev2 검수 완료 (박지민)',
      '온습도 센서 이슈(ISS-002) 해결 완료 (박지민)',
      'DB 설계 및 API 90% 완료 (김철수)',
    ],
    nextWeek: [
      '9월: 실시간 대시보드 개발 집중 (이영희)',
      '9월: DB API 잔여 기능 완료 (김철수)',
      '9월: PCB Rev3 제작 착수 (박지민)',
      '중간보고 준비 (홍길동)',
    ],
    issues: 'ISS-002 온습도 센서 이슈 해결 완료. 현재 진행 이슈 없음.',
    progress: 55,
  },
  {
    id: 4, type: '월간', title: '2026년 7월 월간 업무 보고', author: '홍길동',
    date: '2026-07-31', period: '2026-07-01 ~ 2026-07-31',
    thisWeek: [
      'IoT 데이터 수집 모듈 개발 완료 (김철수)',
      'PCB Rev2 제작 및 1차 검수 진행 (박지민)',
      '실시간 대시보드 설계 착수 (이영희)',
    ],
    nextWeek: [
      '8월: 데이터 수집 최종 검증 (김철수)',
      '8월: PCB Rev2 수정 및 재검수 (박지민)',
      '8월: DB API 개발 집중 (김철수)',
    ],
    issues: '온습도 센서 간헐적 이상값 모니터링 중.',
    progress: 42,
  },
]

// ─── 스타일 유틸 ─────────────────────────────────────────────────
const typeIcon = {
  upload:    { icon: FileText,    cls: 'text-primary-600 bg-primary-50' },
  issue:     { icon: AlertCircle, cls: 'text-red-500 bg-red-50' },
  change:    { icon: Clock,       cls: 'text-yellow-600 bg-yellow-50' },
  milestone: { icon: GitBranch,   cls: 'text-blue-600 bg-blue-50' },
}

const issueStatusStyle = {
  '처리중': 'badge-yellow',
  '해결됨': 'badge-green',
  '보류':   'badge-gray',
  '신규':   'badge-blue',
}
const wbsStatusStyle = {
  '완료':   'badge-green',
  '진행중': 'badge-blue',
  '대기':   'badge-gray',
  '지연':   'badge-red',
}

// ─── 컴포넌트 ────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectData = allProjects.find(p => p.id === Number(id)) ?? allProjects[0]

  const [activeTab,      setActiveTab]      = useState('overview')
  const [expandedFiles,  setExpandedFiles]  = useState({})
  const [expandedIssues, setExpandedIssues] = useState({})
  const [issueFilter,    setIssueFilter]    = useState('전체')
  const [reportFilter,   setReportFilter]   = useState('전체')
  const [selectedReport, setSelectedReport] = useState(reports[0])
  const [issueText,      setIssueText]      = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [issueList,     setIssueList]     = useState(issuesData)
  const [reportList,    setReportList]    = useState(reports)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [responseInputs, setResponseInputs] = useState({})
  // responseInputs: { [issueId]: { action, status, content } }

  const toggleFile  = (fid) => setExpandedFiles(prev => ({ ...prev, [fid]: !prev[fid] }))
  const toggleIssue = (iid) => setExpandedIssues(prev => ({ ...prev, [iid]: !prev[iid] }))

  /* ── 대응 내용 추가 헬퍼 ──────────────────────────── */
  const RESPONSE_ACTIONS = ['원인 분석', '조치 중', '조치 완료', '검토 중', '보류', '종료']

  const openResponseForm  = (issueId) =>
    setResponseInputs(prev => ({ ...prev, [issueId]: { action: '원인 분석', status: '', content: '' } }))

  const closeResponseForm = (issueId) =>
    setResponseInputs(prev => { const n = { ...prev }; delete n[issueId]; return n })

  const updateResponseInput = (issueId, updates) =>
    setResponseInputs(prev => ({ ...prev, [issueId]: { ...prev[issueId], ...updates } }))

  const submitResponse = (issueId) => {
    const input = responseInputs[issueId]
    if (!input?.content?.trim()) return
    const today = new Date().toISOString().slice(0, 10)
    setIssueList(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue
      const updated = {
        ...issue,
        responses: [...issue.responses, {
          date:    today,
          author:  '김연구',
          action:  input.action,
          content: input.content.trim(),
        }],
      }
      if (input.status) updated.status = input.status
      return updated
    }))
    closeResponseForm(issueId)
  }

  const tabs = [
    { key: 'overview', label: '개요 & 타임라인',   icon: GitBranch },
    { key: 'issues',   label: '이슈 관리',          icon: AlertCircle },
    { key: 'wbs',      label: 'WBS',               icon: ListTodo },
    { key: 'reports',  label: '주간 / 월간 보고',   icon: ClipboardList },
    { key: 'files',    label: '산출물 저장소',       icon: FileText },
    { key: 'members',  label: '참여 인력',           icon: User },
  ]

  const filteredIssues = issueList.filter(i =>
    issueFilter === '전체' || i.status === issueFilter
  )

  const filteredReports = reportList.filter(r =>
    reportFilter === '전체' || r.type === reportFilter
  )

  return (
    <Layout title={projectData.name} subtitle={`${projectData.code} · ${projectData.status}`}>
      {/* Back + Upload button */}
      <div className="flex items-start justify-between mb-5">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
          프로젝트 목록
        </button>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-1.5">
          <Upload style={{ width: 14, height: 14 }} />
          파일 업로드
        </button>
      </div>

      {/* Project Info Card */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-green">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1.5" />
                {projectData.status}
              </span>
              <span className="text-xs text-gray-400">{projectData.code}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{projectData.name}</h2>
            <p className="text-sm text-gray-500 max-w-2xl">{projectData.description}</p>
          </div>
          <div className="text-right ml-8 flex-shrink-0">
            <p className="text-3xl font-semibold text-primary-600">{projectData.progress}%</p>
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5 ml-auto">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${projectData.progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">전체 진행률</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <User style={{ width: 14, height: 14 }} className="text-gray-400" />
            <span className="text-gray-400 text-xs">PM</span>
            <span className="font-medium">{projectData.pm}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar style={{ width: 14, height: 14 }} className="text-gray-400" />
            <span className="text-gray-400 text-xs">기간</span>
            <span>{projectData.startDate} ~ {projectData.endDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <User style={{ width: 14, height: 14 }} className="text-gray-400" />
            <span className="text-gray-400 text-xs">참여인원</span>
            <span>{members.length}명</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <AlertCircle style={{ width: 14, height: 14 }} className="text-gray-400" />
            <span className="text-gray-400 text-xs">진행 이슈</span>
            <span className="text-red-600 font-medium">
              {issueList.filter(i => i.status === '처리중').length}건
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── 탭: 개요 & 타임라인 ───────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">이력 타임라인</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-4">
                {timeline.map((item, i) => {
                  const tc = typeIcon[item.type]
                  const Icon = tc.icon
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full ${tc.cls} flex items-center justify-center flex-shrink-0 z-10 ring-2 ring-white`}>
                        <Icon style={{ width: 14, height: 14 }} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm text-gray-800 font-medium">{item.content}</p>
                        {item.detail && <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>}
                        <p className="text-xs text-gray-400 mt-1">{item.date} · {item.author}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="card p-5 h-fit">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">코멘트 등록</h3>
            <textarea
              value={issueText}
              onChange={e => setIssueText(e.target.value)}
              placeholder="진행 중 특이사항이나 코멘트를 입력하세요..."
              rows={5}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 placeholder-gray-400"
            />
            <button className="btn-primary w-full mt-2 flex items-center justify-center gap-1.5">
              <MessageSquarePlus style={{ width: 14, height: 14 }} />
              등록
            </button>
          </div>
        </div>
      )}

      {/* ── 탭: 이슈 관리 ────────────────────────────────────── */}
      {activeTab === 'issues' && (
        <div>
          {/* 상단 필터 + 등록 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              {['전체', '신규', '처리중', '해결됨', '보류'].map(s => (
                <button
                  key={s}
                  onClick={() => setIssueFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    issueFilter === s
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                  {s !== '전체' && (
                    <span className="ml-1 text-xs opacity-70">
                      ({issueList.filter(i => i.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowIssueModal(true)}
              className="btn-primary flex items-center gap-1.5"
            >
              <Plus style={{ width: 14, height: 14 }} />
              이슈 등록
            </button>
          </div>

          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: '전체',   count: issueList.length,                               color: 'text-gray-700',    bg: 'bg-gray-200',    cardBg: 'bg-gray-50',     icon: AlertCircle },
              { label: '처리중', count: issueList.filter(i=>i.status==='처리중').length, color: 'text-yellow-700',  bg: 'bg-yellow-100',  cardBg: 'bg-yellow-50',   icon: Clock },
              { label: '해결됨', count: issueList.filter(i=>i.status==='해결됨').length, color: 'text-primary-700', bg: 'bg-primary-100', cardBg: 'bg-primary-50',  icon: CheckCircle2 },
              { label: '보류',   count: issueList.filter(i=>i.status==='보류').length,   color: 'text-slate-500',   bg: 'bg-slate-200',   cardBg: 'bg-slate-100',   icon: Pause },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className={`card px-4 py-3 flex items-center gap-3 ${s.cardBg}`}>
                  <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon style={{ width: 15, height: 15 }} className={s.color} />
                  </div>
                  <div>
                    <p className={`text-xl font-semibold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 이슈 목록 */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3 w-24">이슈번호</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">제목</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-20">분류</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-20">상태</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-20">담당자</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">발생일</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">마감일</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <>
                    <tr
                      key={issue.id}
                      onClick={() => toggleIssue(issue.id)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{issue.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {issue.title}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="badge-gray">{issue.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={issueStatusStyle[issue.status]}>{issue.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{issue.assignee}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{issue.openedDate}</td>
                      <td className={`px-4 py-3.5 text-sm ${issue.status !== '해결됨' && issue.dueDate < '2026-09-16' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        {issue.dueDate}
                      </td>
                      <td className="px-3 py-3.5">
                        {expandedIssues[issue.id]
                          ? <ChevronUp style={{ width: 14, height: 14 }} className="text-gray-400" />
                          : <ChevronDown style={{ width: 14, height: 14 }} className="text-gray-300 group-hover:text-gray-400" />
                        }
                      </td>
                    </tr>

                    {/* 이슈대응대장 (확장 영역) */}
                    {expandedIssues[issue.id] && (
                      <tr key={`${issue.id}-detail`}>
                        <td colSpan={9} className="bg-gray-50/70 border-b border-gray-100">
                          <div className="px-8 py-5">
                            {/* 이슈 설명 */}
                            <div className="mb-5">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">이슈 내용</p>
                              <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-4 py-3">
                                {issue.description}
                              </p>
                            </div>

                            {/* 이슈대응대장 */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                              이슈 대응 대장
                            </p>
                            <div className="relative">
                              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                              <div className="space-y-3">
                                {issue.responses.map((r, ri) => (
                                  <div key={ri} className="flex gap-4">
                                    <div className="w-7 h-7 rounded-full bg-white border-2 border-primary-200 flex items-center justify-center flex-shrink-0 z-10 text-xs font-semibold text-primary-600">
                                      {ri + 1}
                                    </div>
                                    <div className="flex-1 bg-white border border-gray-100 rounded-lg px-4 py-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                          {r.action}
                                        </span>
                                        <span className="text-xs text-gray-400">{r.date} · {r.author}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{r.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* 대응 추가 */}
                                {responseInputs[issue.id] ? (
                                  <div className="flex gap-4">
                                    <div className="w-7 h-7 rounded-full bg-primary-100 border-2 border-primary-300 flex items-center justify-center flex-shrink-0 z-10 text-xs font-semibold text-primary-600">
                                      {issue.responses.length + 1}
                                    </div>
                                    <div className="flex-1 bg-white border border-primary-200 rounded-lg p-3 space-y-2.5">
                                      {/* 조치 분류 + 상태 변경 */}
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={responseInputs[issue.id].action}
                                          onChange={e => updateResponseInput(issue.id, { action: e.target.value })}
                                          className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-700"
                                        >
                                          {RESPONSE_ACTIONS.map(a => <option key={a}>{a}</option>)}
                                        </select>
                                        <select
                                          value={responseInputs[issue.id].status}
                                          onChange={e => updateResponseInput(issue.id, { status: e.target.value })}
                                          className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-700"
                                        >
                                          <option value="">상태 유지</option>
                                          <option value="신규">신규</option>
                                          <option value="처리중">처리중</option>
                                          <option value="해결됨">해결됨</option>
                                          <option value="보류">보류</option>
                                        </select>
                                      </div>
                                      {/* 내용 입력 */}
                                      <textarea
                                        value={responseInputs[issue.id].content}
                                        onChange={e => updateResponseInput(issue.id, { content: e.target.value })}
                                        placeholder="대응 내용을 입력하세요..."
                                        rows={2}
                                        autoFocus
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none placeholder-gray-400"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => closeResponseForm(issue.id)}
                                          className="btn-secondary text-xs py-1 px-3"
                                        >
                                          취소
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => submitResponse(issue.id)}
                                          className="btn-primary text-xs py-1 px-3"
                                        >
                                          등록
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-4">
                                    <div className="w-7 h-7 rounded-full bg-primary-50 border-2 border-dashed border-primary-200 flex items-center justify-center flex-shrink-0 z-10">
                                      <Plus style={{ width: 12, height: 12 }} className="text-primary-400" />
                                    </div>
                                    <button
                                      onClick={() => openResponseForm(issue.id)}
                                      className="flex-1 text-left bg-white border border-dashed border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
                                    >
                                      대응 내용 추가...
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filteredIssues.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">해당 상태의 이슈가 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* ── 탭: WBS ──────────────────────────────────────────── */}
      {activeTab === 'wbs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                전체 <span className="font-semibold text-gray-900">{wbsData.filter(w=>w.level===0).length}</span>개 단계
                · 완료 <span className="font-semibold text-primary-600">{wbsData.filter(w=>w.status==='완료').length}</span>개 태스크
              </p>
            </div>
            <button className="btn-secondary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} />
              항목 추가
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3 w-10">No.</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">작업명</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-20">담당자</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">계획 시작</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">계획 완료</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">실제 시작</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-28">실제 완료</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-32">진행률</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 w-20">상태</th>
                </tr>
              </thead>
              <tbody>
                {wbsData.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${
                      row.level === 0
                        ? 'bg-gray-50/60 hover:bg-gray-100/60'
                        : 'bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{row.id}</td>
                    <td className="px-2 py-3">
                      <div style={{ paddingLeft: row.level * 20 }} className="flex items-center gap-2">
                        {row.level === 0 ? (
                          <BarChart3 style={{ width: 13, height: 13 }} className="text-primary-500 flex-shrink-0" />
                        ) : (
                          <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          </div>
                        )}
                        <span className={`text-sm ${row.level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.assignee}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.planStart}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.planEnd}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.actualStart || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.actualEnd || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.status === '완료' ? 'bg-primary-400' :
                              row.status === '지연' ? 'bg-red-400' :
                              row.status === '대기' ? 'bg-gray-300' : 'bg-blue-400'
                            }`}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-7 text-right">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={wbsStatusStyle[row.status]}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* WBS 전체 진행률 푸터 */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>완료 <span className="text-primary-600 font-semibold">{wbsData.filter(w=>w.status==='완료').length}</span></span>
                <span>진행중 <span className="text-blue-600 font-semibold">{wbsData.filter(w=>w.status==='진행중').length}</span></span>
                <span>대기 <span className="text-gray-500 font-semibold">{wbsData.filter(w=>w.status==='대기').length}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">전체 평균 진행률</span>
                <span className="text-sm font-semibold text-primary-600">
                  {Math.round(wbsData.reduce((s, w) => s + w.progress, 0) / wbsData.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 탭: 주간/월간 보고 ───────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="flex gap-4">
          {/* 보고서 목록 */}
          <div className="w-72 flex-shrink-0">
            {/* 필터 */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 mb-3">
              {['전체', '주간', '월간'].map(f => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    reportFilter === f
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredReports.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`card p-4 cursor-pointer transition-all ${
                    selectedReport?.id === r.id
                      ? 'border-primary-300 bg-primary-50/40 shadow-md'
                      : 'hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={r.type === '주간' ? 'badge-blue' : 'badge-green'}>{r.type}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-tight mb-1">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.author}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-1.5"
            >
              <Plus style={{ width: 14, height: 14 }} />
              보고서 작성
            </button>
          </div>

          {/* 보고서 상세 */}
          {selectedReport ? (
            <div className="flex-1 card p-6 min-w-0">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={selectedReport.type === '주간' ? 'badge-blue' : 'badge-green'}>
                      {selectedReport.type} 보고
                    </span>
                    <span className="text-xs text-gray-400">{selectedReport.period}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{selectedReport.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">작성자: {selectedReport.author} · {selectedReport.date}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-2xl font-semibold text-primary-600">{selectedReport.progress}%</p>
                  <p className="text-xs text-gray-400">보고 시점 진행률</p>
                </div>
              </div>

              {/* 이번 주/월 진행 사항 */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {selectedReport.type === '주간' ? '이번 주 진행 사항' : '이번 달 진행 사항'}
                </h4>
                <ul className="space-y-2">
                  {selectedReport.thisWeek.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 style={{ width: 11, height: 11 }} className="text-primary-600" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 다음 주/월 계획 */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {selectedReport.type === '주간' ? '다음 주 계획' : '다음 달 계획'}
                </h4>
                <ul className="space-y-2">
                  {selectedReport.nextWeek.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ChevronRight style={{ width: 11, height: 11 }} className="text-blue-500" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 특이사항 / 이슈 */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  특이사항 / 이슈
                </h4>
                <div className={`rounded-lg px-4 py-3 text-sm border ${
                  selectedReport.issues.includes('없음')
                    ? 'bg-gray-50 text-gray-500 border-gray-100'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-100'
                }`}>
                  {selectedReport.issues}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 card flex items-center justify-center text-sm text-gray-400">
              보고서를 선택하세요
            </div>
          )}
        </div>
      )}

      {/* ── 탭: 산출물 저장소 ────────────────────────────────── */}
      {activeTab === 'files' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">산출물 저장소</h3>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} />
              새 산출물 등록
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">파일명</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">카테고리</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">최신버전</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">등록자</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">최종 등록일</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <>
                  <tr
                    key={f.id}
                    onClick={() => toggleFile(f.id)}
                    className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText style={{ width: 15, height: 15 }} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{f.name}</span>
                        <span className="text-xs text-gray-400">({f.versions.length}개 버전)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="badge-blue">{f.category}</span></td>
                    <td className="px-4 py-3.5"><span className="badge-green">{f.versions[0].ver}</span></td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{f.uploader}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{f.date}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors" onClick={e => e.stopPropagation()}>
                          <Download style={{ width: 14, height: 14 }} />
                        </button>
                        {expandedFiles[f.id]
                          ? <ChevronDown style={{ width: 14, height: 14 }} className="text-gray-400" />
                          : <ChevronRight style={{ width: 14, height: 14 }} className="text-gray-300 group-hover:text-gray-400" />
                        }
                      </div>
                    </td>
                  </tr>
                  {expandedFiles[f.id] && f.versions.map((v, vi) => (
                    <tr key={`${f.id}-v${vi}`} className="bg-gray-50/50 border-b border-gray-50">
                      <td className="pl-12 pr-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-px h-4 bg-gray-200" />
                          <span className="text-xs text-gray-600">{f.name}_{v.ver}.pdf</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5" />
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${vi === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                          {v.ver}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{v.uploader}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{v.date} · {v.size}</td>
                      <td className="px-4 py-2.5">
                        <button className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-primary-600 transition-colors">
                          <Download style={{ width: 13, height: 13 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 탭: 참여 인력 ────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">참여 인력 현황</h3>
            <button className="btn-secondary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} />
              인력 추가
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">역할</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">소속</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">투입공수 (M/M)</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">참여 시작일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                        {m.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={m.role === 'PM' ? 'badge-green' : 'badge-gray'}>{m.role}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{m.team}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-400 rounded-full" style={{ width: `${(m.mm / 5) * 100}%` }} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{m.mm}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{m.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500">총 투입공수</span>
            <span className="text-sm font-semibold text-gray-900">
              {members.reduce((sum, m) => sum + m.mm, 0).toFixed(1)} M/M
            </span>
          </div>
        </div>
      )}

      {/* ── 산출물 등록 모달 ─────────────────────────────────── */}
      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={(data) => {
            console.log('산출물 등록:', data)
            // TODO: API 연동
          }}
        />
      )}

      {/* ── 이슈 등록 모달 ───────────────────────────────────── */}
      {showIssueModal && (
        <IssueCreateModal
          onClose={() => setShowIssueModal(false)}
          nextId={`ISS-${String(issueList.length + 1).padStart(3, '0')}`}
          onSubmit={(issue) => {
            setIssueList(prev => [issue, ...prev])
            setIssueFilter('전체')
            setExpandedIssues(prev => ({ ...prev, [issue.id]: true }))
          }}
        />
      )}

      {/* ── 보고서 작성 모달 ─────────────────────────────────── */}
      {showReportModal && (
        <ReportWriteModal
          onClose={() => setShowReportModal(false)}
          existingIssues={issueList}
          onNewIssues={(newIssues) => setIssueList(prev => [...newIssues, ...prev])}
          onSubmit={(data) => {
            const newReport = { ...data, id: Date.now() }
            setReportList(prev => [newReport, ...prev])
            setSelectedReport(newReport)
          }}
        />
      )}
    </Layout>
  )
}
