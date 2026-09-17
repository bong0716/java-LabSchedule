import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CalendarEventModal from '../components/CalendarEventModal'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const initialEvents = [
  { date: '2026-09-03', title: '스마트팜 킥오프',       type: 'project',  color: 'bg-primary-100 text-primary-700 border-primary-200' },
  { date: '2026-09-05', title: '홍길동 연차',           type: 'vacation', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { date: '2026-09-08', title: '월간 연구소 회의',      type: 'event',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2026-09-10', title: '중간보고서 제출',        type: 'project',  color: 'bg-primary-100 text-primary-700 border-primary-200' },
  { date: '2026-09-12', title: '김철수 반차',           type: 'vacation', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { date: '2026-09-15', title: '바이오센서 검수',        type: 'project',  color: 'bg-primary-100 text-primary-700 border-primary-200' },
  { date: '2026-09-17', title: '스마트팜 중간보고',      type: 'project',  color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2026-09-18', title: '환경모니터링 킥오프',    type: 'event',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { date: '2026-09-19', title: '데이터분석 납품',        type: 'project',  color: 'bg-red-100 text-red-700 border-red-200' },
  { date: '2026-09-22', title: '추석 연휴',             type: 'event',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { date: '2026-09-23', title: '추석 연휴',             type: 'event',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { date: '2026-09-24', title: '추석 (공휴일)',         type: 'event',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { date: '2026-09-25', title: '스마트팜 현장방문',      type: 'project',  color: 'bg-primary-100 text-primary-700 border-primary-200' },
  { date: '2026-09-30', title: '3분기 결산 보고',       type: 'event',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
]

const filters = [
  { key: 'project',  label: '프로젝트 일정', color: 'bg-primary-500' },
  { key: 'vacation', label: '휴가',          color: 'bg-yellow-500' },
  { key: 'event',    label: '내부 일정', color: 'bg-blue-500' },
]

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

export default function Calendar() {
  const [searchParams] = useSearchParams()
  const [currentYear,  setCurrentYear]  = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(8)
  const [activeFilters, setActiveFilters] = useState(() =>
    searchParams.get('filter') === 'project' ? ['project'] : ['project', 'vacation', 'event']
  )
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [events,       setEvents]       = useState(initialEvents)
  const [showModal,    setShowModal]    = useState(false)
  const [modalDate,    setModalDate]    = useState('')   // 날짜 클릭 시 미리 채울 값

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay    = getFirstDayOfMonth(currentYear, currentMonth)
  const monthNames  = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  const toggleFilter = (key) =>
    setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr && activeFilters.includes(e.type))
  }

  const openModal = (date = '') => { setModalDate(date); setShowModal(true) }

  const handleAddEvents = (newEvents) => setEvents(prev => [...prev, ...newEvents])

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : ''
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []

  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  return (
    <Layout title="통합 캘린더" subtitle="프로젝트 일정, 휴가, 내부 일정">
      <div className="flex gap-4">

        {/* ── 메인 캘린더 ── */}
        <div className="flex-1 card overflow-hidden">
          {/* 캘린더 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft style={{ width: 16, height: 16 }} className="text-gray-500" />
              </button>
              <h2 className="text-sm font-semibold text-gray-900">
                {currentYear}년 {monthNames[currentMonth]}
              </h2>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* 필터 */}
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => toggleFilter(f.key)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    activeFilters.includes(f.key)
                      ? 'border-transparent bg-gray-100 text-gray-700 font-medium'
                      : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeFilters.includes(f.key) ? f.color : 'bg-gray-300'}`} />
                  {f.label}
                </button>
              ))}

              {/* 일정 등록 버튼 */}
              <button
                onClick={() => openModal()}
                className="btn-primary flex items-center gap-1.5 ml-1"
              >
                <Plus style={{ width: 14, height: 14 }} />
                일정 등록
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2.5 text-center text-xs font-medium ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`blank-${idx}`} className="min-h-[88px] border-b border-r border-gray-50" />
              const dayEvents = getEventsForDay(day)
              const isToday   = day === 16 && currentMonth === 8 && currentYear === 2026
              const isSelected = day === selectedDay
              const isSun = (idx % 7) === 0
              const isSat = (idx % 7) === 6
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-[88px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors group hover:bg-gray-50/70 ${
                    isSelected ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openModal(dateStr) }}
                      className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary-100 text-primary-500 transition-all"
                    >
                      <Plus style={{ width: 11, height: 11 }} />
                    </button>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                      isToday   ? 'bg-primary-600 text-white font-medium' :
                      isSun     ? 'text-red-400' :
                      isSat     ? 'text-blue-400' :
                                  'text-gray-700'
                    }`}>
                      {day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e, i) => (
                      <div key={i} className={`text-xs px-1.5 py-0.5 rounded border truncate ${e.color}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 2}개</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 사이드 패널 ── */}
        <div className="w-64 flex-shrink-0 space-y-4">

          {/* 선택 날짜 일정 */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900">
                {selectedDay
                  ? `${currentMonth + 1}월 ${selectedDay}일`
                  : '날짜를 선택하세요'}
              </h3>
              {selectedDay && (
                <button
                  onClick={() => openModal(selectedDateStr)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors"
                >
                  <Plus style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>

            {selectedDay && selectedEvents.length === 0 && (
              <div className="py-5 text-center">
                <p className="text-xs text-gray-400">일정이 없습니다</p>
                <button
                  onClick={() => openModal(selectedDateStr)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  + 일정 추가
                </button>
              </div>
            )}

            <div className="space-y-2">
              {selectedEvents.map((e, i) => (
                <div key={i} className={`p-2.5 rounded-lg border text-xs ${e.color}`}>
                  <p className="font-medium">{e.title}</p>
                  {e.memo && <p className="mt-0.5 opacity-70">{e.memo}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* 범례 */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">범례</h3>
            <div className="space-y-2">
              {[
                { color: 'bg-primary-400', label: '프로젝트 일정' },
                { color: 'bg-red-400',     label: '마감 임박' },
                { color: 'bg-yellow-400',  label: '휴가' },
                { color: 'bg-blue-400',    label: '내부 일정' },
                { color: 'bg-purple-400',  label: '공휴일' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className={`w-3 h-3 rounded flex-shrink-0 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* 이번 주 요약 */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">이번 주 요약</h3>
            <div className="space-y-2.5">
              {[
                { label: '프로젝트 마감', value: '2건', color: 'text-red-600' },
                { label: '미팅/행사',     value: '1건', color: 'text-blue-600' },
                { label: '휴가 인원',     value: '1명', color: 'text-yellow-600' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 일정 등록 모달 */}
      {showModal && (
        <CalendarEventModal
          defaultDate={modalDate}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddEvents}
        />
      )}
    </Layout>
  )
}
