import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import FileUploadModal from '../components/FileUploadModal'
import ReportWriteModal from '../components/ReportWriteModal'
import IssueCreateModal from '../components/IssueCreateModal'
import MemberAddModal from '../components/MemberAddModal'
import { getProjectDetail, updateProject } from '../api/projects'
import { uploadDocument, deleteDocument as apiDeleteDocument } from '../api/documents'
import { createIssue, updateIssueStatus, addIssueResponse, deleteIssue as apiDeleteIssue } from '../api/issues'
import { createReport, deleteReport as apiDeleteReport } from '../api/reports'
import { addMember, updateMember, removeMember } from '../api/members'
import { getStaffList } from '../api/staff'
import { useAuth } from '../context/AuthContext'
import {
  ChevronLeft, Upload, FileText, Download, Trash2,
  ChevronDown, ChevronRight, User, Calendar, Clock, AlertCircle,
  GitBranch, Plus, CheckCircle2, Pause, Pencil, Save, X as XIcon,
  ClipboardList, ChevronUp, Search,
} from 'lucide-react'

const typeIcon = {
  upload:    { icon: FileText,    cls: 'text-primary-600 bg-primary-50' },
  issue:     { icon: AlertCircle, cls: 'text-red-500 bg-red-50' },
  change:    { icon: Clock,       cls: 'text-yellow-600 bg-yellow-50' },
  milestone: { icon: GitBranch,   cls: 'text-blue-600 bg-blue-50' },
}

const issueStatusStyle = {
  '진행중': 'badge-blue',
  '해결됨': 'badge-green',
  '보류':   'badge-gray',
}

const ACTION_TO_STATUS = {
  '원인 분석': '진행중',
  '조치 중':   '진행중',
  '조치 완료': '진행중',
  '검토 중':   '진행중',
  '보류':      '보류',
  '종료':      '해결됨',
}

const statusBadgeConfig = {
  '진행중':  { cls: 'badge-green',  dot: 'bg-primary-500' },
  '마감임박': { cls: 'badge-red',   dot: 'bg-red-500' },
  '대기중':  { cls: 'badge-yellow', dot: 'bg-yellow-500' },
  '완료':    { cls: 'badge-gray',   dot: 'bg-gray-400' },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [staffList, setStaffList] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedFiles, setExpandedFiles] = useState({})
  const [expandedIssues, setExpandedIssues] = useState({})
  const [issueFilter, setIssueFilter] = useState('전체')
  const [reportFilter, setReportFilter] = useState('전체')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [responseInputs, setResponseInputs] = useState({})
  const [fileSearch, setFileSearch] = useState('')
  const [fileCategoryFilter, setFileCategoryFilter] = useState('전체')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [memberEditForm, setMemberEditForm] = useState({})

  const fetchProject = () => {
    setLoading(true)
    getProjectDetail(id)
      .then(data => {
        setProject(data)
        if (data.reports?.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProject()
    getStaffList().then(setStaffList).catch(console.error)
  }, [id])

  if (loading || !project) {
    return (
      <Layout title="프로젝트 상세">
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          {loading ? '로딩 중...' : '프로젝트를 찾을 수 없습니다.'}
        </div>
      </Layout>
    )
  }

  const timeline = project.timeline || []
  const documents = project.documents || []
  const issues = project.issues || []
  const reports = project.reports || []
  const members = project.members || []

  const toggleFile = (fid) => setExpandedFiles(prev => ({ ...prev, [fid]: !prev[fid] }))
  const toggleIssue = (iid) => setExpandedIssues(prev => ({ ...prev, [iid]: !prev[iid] }))

  const RESPONSE_ACTIONS = ['원인 분석', '조치 중', '조치 완료', '검토 중', '보류', '종료']

  const openResponseForm = (issueId) =>
    setResponseInputs(prev => ({ ...prev, [issueId]: { action: '원인 분석', content: '' } }))
  const closeResponseForm = (issueId) =>
    setResponseInputs(prev => { const n = { ...prev }; delete n[issueId]; return n })
  const updateResponseInput = (issueId, updates) =>
    setResponseInputs(prev => ({ ...prev, [issueId]: { ...prev[issueId], ...updates } }))

  const submitResponse = async (issueId) => {
    const input = responseInputs[issueId]
    if (!input?.content?.trim()) return
    try {
      await addIssueResponse(id, issueId, {
        authorId: user?.staffId,
        action: input.action,
        content: input.content.trim(),
      })
      const newStatus = ACTION_TO_STATUS[input.action]
      if (newStatus) {
        await updateIssueStatus(id, issueId, newStatus)
      }
      closeResponseForm(issueId)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpload = async (data) => {
    try {
      await uploadDocument(id, {
        name: data.name,
        category: data.category,
        version: data.version,
        fileSize: data.fileSize,
        note: data.note,
        uploaderId: user?.staffId,
      })
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateIssue = async (data) => {
    try {
      const assigneeMember = members.find(m => m.name === data.assignee)
      await createIssue(id, {
        title: data.title,
        description: data.description,
        status: '진행중',
        assigneeId: assigneeMember?.staffId || staffList.find(s => s.name === data.assignee)?.id,
        reporterId: user?.staffId,
        openedDate: data.openedDate,
        dueDate: data.dueDate,
      })
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateReport = async (data) => {
    try {
      await createReport(id, {
        reportType: data.type,
        title: data.title,
        authorId: user?.staffId,
        reportDate: data.date,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        thisPeriod: data.thisWeek,
        nextPeriod: data.nextWeek,
        issues: data.issues,
      })
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddMember = async (data) => {
    try {
      const staff = staffList.find(s => s.name === data.name)
      await addMember(id, {
        staffId: staff?.id || null,
        name: data.name,
        role: data.role,
        team: data.team,
        mm: data.mm,
        joinedDate: data.joined,
        isFreelancer: data.isFreelancer || false,
        company: data.company,
        contact: data.contact,
      })
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('팀원을 제거하시겠습니까?')) return
    try {
      await removeMember(id, memberId)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('이슈를 삭제하시겠습니까?')) return
    try {
      await apiDeleteIssue(id, issueId)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('보고서를 삭제하시겠습니까?')) return
    try {
      await apiDeleteReport(id, reportId)
      if (selectedReport?.id === reportId) setSelectedReport(null)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('산출물을 삭제하시겠습니까? 모든 버전이 함께 삭제됩니다.')) return
    try {
      await apiDeleteDocument(id, documentId)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const startEdit = () => {
    setEditForm({
      name: project.name,
      code: project.code,
      description: project.description || '',
      status: project.status,
      category: project.category || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      pmId: project.pmId,
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditForm({})
  }

  const saveEdit = async () => {
    try {
      await updateProject(id, editForm)
      // PM이 변경되었고 참여인력에 없으면 자동 추가
      if (editForm.pmId && editForm.pmId !== project.pmId) {
        const pmStaff = staffList.find(s => s.id === editForm.pmId)
        if (pmStaff && !members.some(m => m.staffId === editForm.pmId)) {
          await addMember(id, {
            staffId: pmStaff.id,
            name: pmStaff.name,
            role: 'PM',
            team: pmStaff.team || '',
            isFreelancer: false,
          })
        }
      }
      setEditing(false)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const startMemberEdit = (m) => {
    setEditingMemberId(m.id)
    setMemberEditForm({
      name: m.name,
      role: m.role,
      team: m.team || '',
      mm: m.mm ?? '',
      joinedDate: m.joinedDate || '',
    })
  }

  const cancelMemberEdit = () => {
    setEditingMemberId(null)
    setMemberEditForm({})
  }

  const saveMemberEdit = async (memberId) => {
    try {
      await updateMember(id, memberId, {
        name: memberEditForm.name,
        role: memberEditForm.role,
        team: memberEditForm.team,
        mm: memberEditForm.mm !== '' ? Number(memberEditForm.mm) : null,
        joinedDate: memberEditForm.joinedDate || null,
      })
      setEditingMemberId(null)
      fetchProject()
    } catch (err) {
      console.error(err)
    }
  }

  const tabs = [
    { key: 'overview', label: '개요 & 타임라인', icon: GitBranch },
    { key: 'issues', label: '이슈 관리', icon: AlertCircle },
    { key: 'reports', label: '주간 / 월간 보고', icon: ClipboardList },
    { key: 'files', label: '산출물', icon: FileText },
    { key: 'members', label: '참여 인력', icon: User },
  ]

  const filteredIssues = issues.filter(i => issueFilter === '전체' || i.status === issueFilter)
  const filteredReports = reports.filter(r => reportFilter === '전체' || r.reportType === reportFilter)

  const sc = statusBadgeConfig[project.status] || statusBadgeConfig['대기중']

  const filteredDocs = documents.filter(d => {
    const matchSearch = !fileSearch || d.name.toLowerCase().includes(fileSearch.toLowerCase())
    const matchCategory = fileCategoryFilter === '전체' || d.category === fileCategoryFilter
    return matchSearch && matchCategory
  })

  const docCategories = ['전체', ...new Set(documents.map(d => d.category).filter(Boolean))]

  return (
    <Layout title={project.name} subtitle={`${project.code} · ${project.status}`}>
      {/* Back */}
      <div className="mb-5">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors">
          <ChevronLeft style={{ width: 14, height: 14 }} /> 프로젝트 목록
        </button>
      </div>

      {/* Project Info Card */}
      <div className="card p-5 mb-4">
        {editing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">프로젝트 정보 수정</h3>
              <div className="flex items-center gap-2">
                <button onClick={cancelEdit} className="btn-secondary flex items-center gap-1 text-xs">
                  <XIcon style={{ width: 13, height: 13 }} /> 취소
                </button>
                <button onClick={saveEdit} className="btn-primary flex items-center gap-1 text-xs">
                  <Save style={{ width: 13, height: 13 }} /> 저장
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">프로젝트명</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">프로젝트 코드</label>
                <input type="text" value={editForm.code} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">설명</label>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
                <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  {['진행중', '대기중', '마감임박', '완료'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">카테고리</label>
                <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  {['시스템 개발', '소프트웨어', '이전', '인프라', '연구', '기타'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">PM</label>
                <select value={editForm.pmId || ''} onChange={e => setEditForm(p => ({ ...p, pmId: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  <option value="">선택</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">시작일</label>
                <input type="date" value={editForm.startDate || ''} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">종료일</label>
                <input type="date" value={editForm.endDate || ''} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={sc.cls}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`} />{project.status}</span>
                  <span className="text-xs text-gray-400">{project.code}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h2>
                <p className="text-sm text-gray-500 max-w-2xl">{project.description}</p>
              </div>
              <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors ml-4 flex-shrink-0">
                <Pencil style={{ width: 13, height: 13 }} /> 수정
              </button>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User style={{ width: 14, height: 14 }} className="text-gray-400" />
                <span className="text-gray-400 text-xs">PM</span>
                <span className="font-medium">{project.pm}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar style={{ width: 14, height: 14 }} className="text-gray-400" />
                <span className="text-gray-400 text-xs">기간</span>
                <span>{project.startDate} ~ {project.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User style={{ width: 14, height: 14 }} className="text-gray-400" />
                <span className="text-gray-400 text-xs">참여인원</span>
                <span>{members.length}명</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <AlertCircle style={{ width: 14, height: 14 }} className="text-gray-400" />
                <span className="text-gray-400 text-xs">진행 이슈</span>
                <span className="text-red-600 font-medium">{issues.filter(i => i.status === '진행중').length}건</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${activeTab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon style={{ width: 13, height: 13 }} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Overview & Timeline */}
      {activeTab === 'overview' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">이력 타임라인</h3>
          {timeline.length === 0 && <p className="text-xs text-gray-400 py-8 text-center">타임라인 기록이 없습니다</p>}
          <div className="relative">
            {timeline.length > 0 && <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />}
            <div className="space-y-4">
              {timeline.map((item, i) => {
                const tc = typeIcon[item.eventType] || typeIcon.milestone
                const Icon = tc.icon
                return (
                  <div key={item.id || i} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full ${tc.cls} flex items-center justify-center flex-shrink-0 z-10 ring-2 ring-white`}>
                      <Icon style={{ width: 14, height: 14 }} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-gray-800 font-medium">{item.content}</p>
                      {item.detail && <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>}
                      <p className="text-xs text-gray-400 mt-1">{item.eventDate} · {item.author}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Issues */}
      {activeTab === 'issues' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              {['전체', '진행중', '해결됨', '보류'].map(s => (
                <button key={s} onClick={() => setIssueFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${issueFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} /> 이슈 등록
            </button>
          </div>
          {filteredIssues.length === 0 && <div className="card p-8 text-center text-xs text-gray-400">이슈가 없습니다</div>}
          <div className="space-y-3">
            {filteredIssues.map(issue => {
              const isOpen = expandedIssues[issue.id]
              const resp = responseInputs[issue.id]
              return (
                <div key={issue.id} className="card overflow-hidden">
                  <div onClick={() => toggleIssue(issue.id)} className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">{issue.issueCode}</span>
                        <span className={issueStatusStyle[issue.status] || 'badge-gray'}>{issue.status}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{issue.assignee ? `담당: ${issue.assignee}` : ''} · {issue.openedDate}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteIssue(issue.id) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      title="삭제">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                    {isOpen ? <ChevronUp style={{ width: 16, height: 16 }} className="text-gray-400" /> : <ChevronDown style={{ width: 16, height: 16 }} className="text-gray-400" />}
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 py-3">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span>보고자: {issue.reporter}</span>
                        <span>담당: {issue.assignee}</span>
                        {issue.dueDate && <span>마감: {issue.dueDate}</span>}
                      </div>
                      {(issue.responses || []).length > 0 && (
                        <div className="border-t border-gray-100 pt-3 space-y-2.5">
                          <p className="text-xs font-semibold text-gray-500">대응 이력</p>
                          {issue.responses.map((r, ri) => (
                            <div key={ri} className="flex gap-3 text-xs">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium flex-shrink-0 text-xs mt-0.5">{r.author?.[0]}</div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-gray-700">{r.author}</span>
                                  <span className="badge-gray">{r.action}</span>
                                  <span className="text-gray-400">{r.createdAt?.slice(0, 10)}</span>
                                </div>
                                <p className="text-gray-600">{r.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!resp ? (
                        <button onClick={() => openResponseForm(issue.id)} className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                          <Plus style={{ width: 12, height: 12 }} /> 대응 내용 추가
                        </button>
                      ) : (
                        <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <select value={resp.action} onChange={e => updateResponseInput(issue.id, { action: e.target.value })}
                              className="px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg">
                              {RESPONSE_ACTIONS.map(a => <option key={a}>{a}</option>)}
                            </select>
                            <span className={`text-xs px-2 py-1 rounded-lg ${
                              ACTION_TO_STATUS[resp.action] === '해결됨' ? 'bg-green-50 text-green-600' :
                              ACTION_TO_STATUS[resp.action] === '보류' ? 'bg-gray-100 text-gray-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              → {ACTION_TO_STATUS[resp.action]}
                            </span>
                          </div>
                          <textarea value={resp.content} onChange={e => updateResponseInput(issue.id, { content: e.target.value })}
                            placeholder="대응 내용을 입력하세요..." rows={2}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none placeholder-gray-400" />
                          <div className="flex items-center gap-2">
                            <button onClick={() => submitResponse(issue.id)} className="btn-primary text-xs px-3 py-1.5">등록</button>
                            <button onClick={() => closeResponseForm(issue.id)} className="btn-secondary text-xs px-3 py-1.5">취소</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              {['전체', '주간', '월간'].map(s => (
                <button key={s} onClick={() => setReportFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${reportFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReportModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} /> 보고서 작성
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              {filteredReports.length === 0 && <div className="card p-4 text-center text-xs text-gray-400">보고서가 없습니다</div>}
              {filteredReports.map(r => (
                <div key={r.id} onClick={() => setSelectedReport(r)}
                  className={`card p-4 cursor-pointer transition-all group ${selectedReport?.id === r.id ? 'border-primary-300 bg-primary-50/30' : 'hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={r.reportType === '주간' ? 'badge-blue' : 'badge-green'}>{r.reportType}</span>
                    <span className="text-xs text-gray-400">{r.reportDate}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(r.id) }}
                      className="ml-auto w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                      title="삭제">
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.author}</p>
                </div>
              ))}
            </div>
            <div className="col-span-2">
              {selectedReport ? (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={selectedReport.reportType === '주간' ? 'badge-blue' : 'badge-green'}>{selectedReport.reportType}</span>
                        <span className="text-xs text-gray-400">{selectedReport.reportDate}</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{selectedReport.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">작성자: {selectedReport.author} · 기간: {selectedReport.periodStart} ~ {selectedReport.periodEnd}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">이번 기간 실적</p>
                      <ul className="space-y-1.5">
                        {(selectedReport.thisPeriod || []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 style={{ width: 14, height: 14 }} className="text-primary-500 mt-0.5 flex-shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">다음 기간 계획</p>
                      <ul className="space-y-1.5">
                        {(selectedReport.nextPeriod || []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight style={{ width: 14, height: 14 }} className="text-blue-500 mt-0.5 flex-shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedReport.issues && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">특이사항</p>
                        <p className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">{selectedReport.issues}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card p-8 text-center text-xs text-gray-400">보고서를 선택하세요</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Files */}
      {activeTab === 'files' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                {docCategories.map(c => (
                  <button key={c} onClick={() => setFileCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${fileCategoryFilter === c ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 13, height: 13 }} />
                <input type="text" value={fileSearch} onChange={e => setFileSearch(e.target.value)} placeholder="파일명 검색"
                  className="pl-7 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-primary-500/30 placeholder-gray-400" />
              </div>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-1.5">
              <Upload style={{ width: 14, height: 14 }} /> 파일 업로드
            </button>
          </div>
          {filteredDocs.length === 0 && <div className="card p-8 text-center text-xs text-gray-400">산출물이 없습니다</div>}
          <div className="space-y-2">
            {filteredDocs.map(doc => {
              const isOpen = expandedFiles[doc.id]
              return (
                <div key={doc.id} className="card overflow-hidden">
                  <div onClick={() => toggleFile(doc.id)} className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors group">
                    <FileText style={{ width: 16, height: 16 }} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {doc.uploader} · {doc.createdAt}</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{doc.latestVersion || '-'}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      title="삭제">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                    {isOpen ? <ChevronUp style={{ width: 14, height: 14 }} className="text-gray-400" /> : <ChevronDown style={{ width: 14, height: 14 }} className="text-gray-400" />}
                  </div>
                  {isOpen && (doc.versions || []).length > 0 && (
                    <div className="px-5 pb-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 pt-3 mb-2">버전 이력</p>
                      <div className="space-y-2">
                        {doc.versions.map((v, vi) => (
                          <div key={vi} className="flex items-center gap-3 text-xs text-gray-600 py-1.5 border-b border-gray-50 last:border-0">
                            <span className="font-medium text-primary-600 w-12">{v.version}</span>
                            <span className="text-gray-400">{v.uploadedAt}</span>
                            <span>{v.uploader}</span>
                            <span className="text-gray-400">{v.fileSize}</span>
                            {v.note && <span className="text-gray-500 truncate flex-1">— {v.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">총 {members.length}명</p>
            <button onClick={() => setShowMemberModal(true)} className="btn-primary flex items-center gap-1.5">
              <Plus style={{ width: 14, height: 14 }} /> 팀원 추가
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">이름</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">역할</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">소속</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">M/M</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">투입일</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const isEditing = editingMemberId === m.id
                  return (
                    <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">{m.name[0]}</div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{m.name}</span>
                            {m.isFreelancer && <span className="ml-1.5 text-xs text-gray-400">(외부)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <select value={memberEditForm.role} onChange={e => setMemberEditForm(p => ({ ...p, role: e.target.value }))}
                            className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg">
                            <option value="PM">PM</option>
                            <option value="팀원">팀원</option>
                            <option value="자문">자문</option>
                          </select>
                        ) : (
                          <span className={m.role === 'PM' ? 'badge-green' : 'badge-gray'}>{m.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input type="text" value={memberEditForm.team} onChange={e => setMemberEditForm(p => ({ ...p, team: e.target.value }))}
                            className="w-24 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg" />
                        ) : (
                          <span className="text-sm text-gray-600">{m.team}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input type="number" step="0.1" value={memberEditForm.mm} onChange={e => setMemberEditForm(p => ({ ...p, mm: e.target.value }))}
                            className="w-16 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-center" />
                        ) : (
                          <span className="text-sm text-gray-700 font-medium">{m.mm ?? '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input type="date" value={memberEditForm.joinedDate} onChange={e => setMemberEditForm(p => ({ ...p, joinedDate: e.target.value }))}
                            className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg" />
                        ) : (
                          <span className="text-sm text-gray-500">{m.joinedDate || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => saveMemberEdit(m.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">저장</button>
                            <button onClick={cancelMemberEdit} className="text-xs text-gray-400 hover:text-gray-600">취소</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => startMemberEdit(m)} className="text-xs text-gray-400 hover:text-primary-600 transition-colors">
                              <Pencil style={{ width: 12, height: 12 }} />
                            </button>
                            <button onClick={() => handleRemoveMember(m.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">제거</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {members.length === 0 && <div className="py-12 text-center text-xs text-gray-400">참여 인력이 없습니다</div>}
          </div>
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <FileUploadModal onClose={() => setShowUploadModal(false)} onSubmit={handleUpload} />
      )}
      {showReportModal && (
        <ReportWriteModal
          existingIssues={issues}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleCreateReport}
        />
      )}
      {showIssueModal && (
        <IssueCreateModal
          members={members.map(m => m.name)}
          onClose={() => setShowIssueModal(false)}
          onSubmit={handleCreateIssue}
        />
      )}
      {showMemberModal && (
        <MemberAddModal
          existingNames={members.map(m => m.name)}
          staffList={staffList}
          onClose={() => setShowMemberModal(false)}
          onSubmit={handleAddMember}
        />
      )}
    </Layout>
  )
}
