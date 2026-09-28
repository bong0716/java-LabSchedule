import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StaffCreateModal from '../components/StaffCreateModal'
import VacationRequestModal from '../components/VacationRequestModal'
import { getStaffList, createStaff as apiCreateStaff } from '../api/staff'
import { getVacations, createVacation as apiCreateVacation, updateVacation as apiUpdateVacation, deleteVacation as apiDeleteVacation } from '../api/vacations'
import { useAuth } from '../context/AuthContext'
import { Search, Plus, Mail, Phone, Calendar, Pencil, Trash2 } from 'lucide-react'

const teamColors = {
  'ITCore연구소': 'badge-green',
  'IT사업본부': 'badge-blue',
}

export default function Staff() {
  const [searchParams] = useSearchParams()
  const vacationRef = useRef(null)
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')
  const [staffList, setStaffList] = useState([])
  const [vacations, setVacations] = useState([])
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showVacationModal, setShowVacationModal] = useState(false)
  const [editVacation, setEditVacation] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'ADMIN'
  const myStaffId = user?.staffId

  const fetchData = () => {
    setLoading(true)
    Promise.all([getStaffList(), getVacations()])
      .then(([staff, vac]) => {
        setStaffList(staff)
        setVacations(vac)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (searchParams.get('tab') === 'vacation' && vacationRef.current) {
      vacationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading])

  const filtered = staffList.filter(s =>
    s.name.includes(search) || (s.team || '').includes(search) || (s.position || '').includes(search)
  )

  const handleCreateStaff = async (data) => {
    try {
      await apiCreateStaff(data)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitVacation = async (data) => {
    try {
      const staff = staffList.find(s => s.name === data.name)
      const payload = {
        staffId: staff?.id || myStaffId,
        vacationType: data.type,
        startDate: data.start,
        endDate: data.end,
        days: data.days,
      }
      if (data.id) {
        await apiUpdateVacation(data.id, payload)
      } else {
        await apiCreateVacation(payload)
      }
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteVacation = async (vacationId) => {
    if (!window.confirm('휴가를 취소하시겠습니까?')) return
    try {
      await apiDeleteVacation(vacationId)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const openEditVacation = (v) => {
    setEditVacation(v)
    setShowVacationModal(true)
  }

  if (loading) {
    return (
      <Layout title="직원 관리">
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">로딩 중...</div>
      </Layout>
    )
  }

  return (
    <Layout title="직원 관리">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            {[['card', '카드'], ['table', '테이블']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 14, height: 14 }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 팀 검색"
              className="pl-8 pr-4 py-1.5 text-sm bg-white border border-gray-200 rounded-lg w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 placeholder-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditVacation(null); setShowVacationModal(true) }} className="btn-secondary flex items-center gap-1.5 whitespace-nowrap">
            <Calendar style={{ width: 14, height: 14 }} /> 휴가 신청
          </button>
          {isAdmin && (
            <button onClick={() => setShowStaffModal(true)} className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
              <Plus style={{ width: 14, height: 14 }} /> 직원 추가
            </button>
          )}
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filtered.map(s => (
            <div key={s.id} className="card p-5 hover:border-primary-200 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-base font-semibold text-primary-700 flex-shrink-0">{s.name[0]}</div>
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
                  <Mail style={{ width: 12, height: 12 }} className="text-gray-400 flex-shrink-0" /> {s.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone style={{ width: 12, height: 12 }} className="text-gray-400 flex-shrink-0" /> {s.phone}
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {(s.projects || []).slice(0, 2).map((proj, pi) => (
                  <span key={pi} className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded truncate max-w-[150px]">{proj}</span>
                ))}
                {(s.projects || []).length > 2 && <span className="text-xs text-gray-400">+{s.projects.length - 2}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden mb-6">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">소속</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">직급</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">연락처</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">참여 프로젝트</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">{s.name[0]}</div>
                      <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className={teamColors[s.team] || 'badge-gray'}>{s.team}</span></td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{s.position}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{s.email}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {(s.projects || []).slice(0, 1).map((p, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                      ))}
                      {(s.projects || []).length > 1 && <span className="text-xs text-gray-400">+{s.projects.length - 1}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

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
                <th className="text-left text-xs font-medium text-gray-400 pb-2.5">관리</th>
              </tr>
            </thead>
            <tbody>
              {vacations.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">휴가 신청 내역이 없습니다</td></tr>
              )}
              {vacations.map((v, i) => {
                const isOwner = v.staffId === myStaffId
                return (
                  <tr key={v.id || i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">{v.name[0]}</div>
                        <span className="text-sm text-gray-800">{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{v.type}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{v.start === v.end ? v.start : `${v.start} ~ ${v.end}`}</td>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-800">{v.days}일</td>
                    <td className="py-3">
                      {(isOwner || isAdmin) ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEditVacation(v)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors" title="수정">
                            <Pencil style={{ width: 13, height: 13 }} />
                          </button>
                          <button onClick={() => handleDeleteVacation(v.id)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="취소">
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showStaffModal && (
        <StaffCreateModal onClose={() => setShowStaffModal(false)} onSubmit={handleCreateStaff} />
      )}
      {showVacationModal && (
        <VacationRequestModal
          staffList={staffList}
          editVacation={editVacation}
          onClose={() => { setShowVacationModal(false); setEditVacation(null) }}
          onSubmit={handleSubmitVacation}
        />
      )}
    </Layout>
  )
}
