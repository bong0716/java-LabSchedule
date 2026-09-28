import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CalendarEventModal from '../components/CalendarEventModal'
import { getEvents, createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from '../api/calendar'
import { getProjects } from '../api/projects'
import { getStaffList } from '../api/staff'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const filters = [
  { key: 'project',  label: '프로젝트 일정', color: 'bg-primary-500' },
  { key: 'vacation', label: '휴가',          color: 'bg-yellow-500' },
  { key: 'event',    label: '내부 일정',     color: 'bg-blue-500' },
]

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

export default function Calendar() {
  const [searchParams] = useSearchParams()
  const now = new Date()
  const [currentYear,  setCurrentYear]  = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [activeFilters, setActiveFilters] = useState(() =>
    searchParams.get('filter') === 'project' ? ['project'] : ['project', 'vacation', 'event']
  )
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [events,       setEvents]       = useState([])
  const [showModal,    setShowModal]    = useState(false)
  const [modalDate,    setModalDate]    = useState('')
  const [editEvent,    setEditEvent]    = useState(null)
  const [loading,      setLoading]     = useState(true)
  const [projectNames, setProjectNames] = useState([])
  const [staffNames,   setStaffNames]   = useState([])

  useEffect(() => {
    getProjects().then(list => setProjectNames(list.map(p => p.name))).catch(console.error)
    getStaffList().then(list => setStaffNames(list.map(s => s.name))).catch(console.error)
  }, [])

  const fetchEvents = () => {
    setLoading(true)
    getEvents(currentYear, currentMonth + 1)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [currentYear, currentMonth])

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

  // 해당 날짜가 이벤트의 startDate~endDate 범위에 포함되는지 확인
  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate && activeFilters.includes(e.eventType))
  }

  const openModal = (date = '', event = null) => {
    setModalDate(date)
    setEditEvent(event)
    setShowModal(true)
  }

  const handleCreateEvent = async (data) => {
    try {
      await apiCreateEvent({
        title: data.title,
        eventType: data.type,
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        memo: data.memo || '',
      })
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await apiUpdateEvent(updatedEvent.id, {
        title: updatedEvent.title,
        eventType: updatedEvent.type || updatedEvent.eventType,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate || updatedEvent.startDate,
        memo: updatedEvent.memo || '',
      })
      if (updatedEvent.startDate) {
        const d = new Date(updatedEvent.startDate)
        const newYear = d.getFullYear()
        const newMonth = d.getMonth()
        const sameMonth = newYear === currentYear && newMonth === currentMonth
        setSelectedDay(d.getDate())
        if (!sameMonth) {
          setCurrentYear(newYear)
          setCurrentMonth(newMonth)
        } else {
          fetchEvents()
        }
      } else {
        fetchEvents()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('일정을 삭제하시겠습니까?')) return
    try {
      await apiDeleteEvent(eventId)
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : ''
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []

  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  // 주(week) 단위로 분할
  const weeks = []
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7))
  }

  const today = new Date()
  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const toDateStr = (day) => day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null

  // 주별 여러 날 걸친 이벤트 계산 + 레인 배정
  const getWeekEvents = (week) => {
    const weekDates = week.map((day, col) => ({ day, col, date: toDateStr(day) })).filter(d => d.day !== null)
    if (weekDates.length === 0) return { multiDay: [], maxLane: 0 }

    const firstDate = weekDates[0].date
    const lastDate = weekDates[weekDates.length - 1].date

    const multiDayEvents = events.filter(e => {
      if (!activeFilters.includes(e.eventType)) return false
      if (e.startDate === e.endDate) return false
      return e.startDate <= lastDate && e.endDate >= firstDate
    })

    multiDayEvents.sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1
      return a.endDate > b.endDate ? -1 : 1
    })

    const laneEnds = []
    const result = []

    for (const event of multiDayEvents) {
      let startCol = weekDates[0].col
      for (const wd of weekDates) {
        if (wd.date >= event.startDate) { startCol = wd.col; break }
      }
      let endCol = weekDates[weekDates.length - 1].col
      for (let i = weekDates.length - 1; i >= 0; i--) {
        if (weekDates[i].date <= event.endDate) { endCol = weekDates[i].col; break }
      }

      const isStart = event.startDate >= firstDate
      const isEnd = event.endDate <= lastDate

      let lane = 0
      while (lane < laneEnds.length && laneEnds[lane] >= startCol) lane++
      if (lane >= laneEnds.length) laneEnds.push(endCol)
      else laneEnds[lane] = endCol

      result.push({ event, startCol, endCol, colSpan: endCol - startCol + 1, isStart, isEnd, lane })
    }

    return { multiDay: result, maxLane: laneEnds.length }
  }

  const getBarColor = (e) => {
    switch (e.eventType) {
      case 'project':  return 'bg-primary-100 text-primary-700'
      case 'vacation': return 'bg-yellow-100 text-yellow-700'
      default:         return 'bg-blue-100 text-blue-700'
    }
  }

  // Week summary — 이번 주 범위와 겹치는 이벤트 수 계산
  const dow = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const fmt = (d) => d.toISOString().slice(0, 10)
  const thisWeekEvents = events.filter(e => e.startDate <= fmt(weekEnd) && e.endDate >= fmt(weekStart))
  const weekSummary = {
    project:  thisWeekEvents.filter(e => e.eventType === 'project').length,
    event:    thisWeekEvents.filter(e => e.eventType === 'event').length,
    vacation: thisWeekEvents.filter(e => e.eventType === 'vacation').length,
  }

  const getColor = (e) => e.color || (
    e.eventType === 'project' ? 'bg-primary-100 text-primary-700 border-primary-200' :
    e.eventType === 'vacation' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    'bg-blue-100 text-blue-700 border-blue-200'
  )

  // 사이드패널에서 이벤트 기간 표시
  const formatPeriod = (e) => {
    if (e.startDate === e.endDate) return e.startDate
    return `${e.startDate} ~ ${e.endDate}`
  }

  return (
    <Layout title="통합 캘린더">
      <div className="flex gap-4">
        {/* Main Calendar */}
        <div className="flex-1 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft style={{ width: 16, height: 16 }} className="text-gray-500" />
              </button>
              <h2 className="text-sm font-semibold text-gray-900">{currentYear}년 {monthNames[currentMonth]}</h2>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-500" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {filters.map(f => (
                <button key={f.key} onClick={() => toggleFilter(f.key)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    activeFilters.includes(f.key) ? 'border-transparent bg-gray-100 text-gray-700 font-medium' : 'border-gray-200 text-gray-400 bg-white'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${activeFilters.includes(f.key) ? f.color : 'bg-gray-300'}`} />
                  {f.label}
                </button>
              ))}
              <button onClick={() => openModal()} className="btn-primary flex items-center gap-1.5 ml-1">
                <Plus style={{ width: 14, height: 14 }} /> 일정 등록
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d, i) => (
              <div key={d} className={`py-2.5 text-center text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>{d}</div>
            ))}
          </div>

          <div>
            {weeks.map((week, weekIdx) => {
              const { multiDay, maxLane } = getWeekEvents(week)
              const BAR_H = 20, BAR_GAP = 2
              const barAreaH = maxLane > 0 ? maxLane * (BAR_H + BAR_GAP) : 0

              return (
                <div key={weekIdx} className="relative">
                  {/* Day cells */}
                  <div className="grid grid-cols-7">
                    {week.map((day, colIdx) => {
                      if (!day) return (
                        <div key={`blank-${weekIdx}-${colIdx}`}
                          className="border-b border-r border-gray-50"
                          style={{ minHeight: 28 + barAreaH + 40 }} />
                      )

                      const singleDayEvents = events.filter(e => {
                        if (!activeFilters.includes(e.eventType)) return false
                        const ds = toDateStr(day)
                        return ds >= e.startDate && ds <= e.endDate && e.startDate === e.endDate
                      })
                      const todayCell = isToday(day)
                      const isSelected = day === selectedDay
                      const ds = toDateStr(day)

                      return (
                        <div key={day}
                          onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                          className={`border-b border-r border-gray-50 cursor-pointer transition-colors group hover:bg-gray-50/70 ${isSelected ? 'bg-primary-50/50' : ''}`}
                          style={{ minHeight: 28 + barAreaH + 40 }}>
                          {/* Day number */}
                          <div className="flex items-center justify-between px-1.5 pt-1.5" style={{ height: 28 }}>
                            <button onClick={(e) => { e.stopPropagation(); openModal(ds) }}
                              className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary-100 text-primary-500 transition-all">
                              <Plus style={{ width: 11, height: 11 }} />
                            </button>
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                              todayCell ? 'bg-primary-600 text-white font-medium' : colIdx === 0 ? 'text-red-400' : colIdx === 6 ? 'text-blue-400' : 'text-gray-700'
                            }`}>{day}</span>
                          </div>

                          {/* Space reserved for multi-day bars */}
                          <div style={{ height: barAreaH }} />

                          {/* Single-day events */}
                          <div className="px-1.5 space-y-0.5">
                            {singleDayEvents.slice(0, 3).map(e => (
                              <div key={e.id}
                                onClick={(ev) => {
                                  ev.stopPropagation()
                                  setSelectedDay(day)
                                  if (e.eventType !== 'vacation') openModal('', { ...e, type: e.eventType })
                                }}
                                className={`text-xs px-1.5 py-0.5 rounded border truncate ${e.eventType !== 'vacation' ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity ${getColor(e)}`}>
                                {e.title}
                              </div>
                            ))}
                            {singleDayEvents.length > 3 && <p className="text-xs text-gray-400 px-1">+{singleDayEvents.length - 3}개</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Multi-day event bars (absolutely positioned) */}
                  {multiDay.map(({ event, startCol, colSpan, isStart, isEnd, lane }) => (
                    <div key={`bar-${event.id}-${weekIdx}`}
                      className="absolute z-10 pointer-events-auto"
                      style={{
                        top: 28 + lane * (BAR_H + BAR_GAP),
                        left: `calc(${startCol} / 7 * 100%${isStart ? ' + 4px' : ''})`,
                        width: `calc(${colSpan} / 7 * 100%${isStart && isEnd ? ' - 8px' : isStart || isEnd ? ' - 4px' : ''})`,
                        height: BAR_H,
                      }}>
                      <div
                        onClick={(ev) => {
                          ev.stopPropagation()
                          if (event.eventType !== 'vacation') openModal('', { ...event, type: event.eventType })
                        }}
                        className={`h-full text-xs px-2 flex items-center truncate ${event.eventType !== 'vacation' ? 'cursor-pointer hover:brightness-95' : ''} transition-all font-medium
                          ${getBarColor(event)}
                          ${isStart && isEnd ? 'rounded-md' : isStart ? 'rounded-l-md' : isEnd ? 'rounded-r-md' : ''}
                        `}>
                        {isStart ? event.title : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900">
                {selectedDay ? `${currentMonth + 1}월 ${selectedDay}일` : '날짜를 선택하세요'}
              </h3>
              {selectedDay && (
                <button onClick={() => openModal(selectedDateStr)} className="w-6 h-6 flex items-center justify-center rounded-md bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors">
                  <Plus style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>
            {selectedDay && selectedEvents.length === 0 && (
              <div className="py-5 text-center">
                <p className="text-xs text-gray-400">일정이 없습니다</p>
                <button onClick={() => openModal(selectedDateStr)} className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">+ 일정 추가</button>
              </div>
            )}
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <div key={e.id} className={`p-2.5 rounded-lg border text-xs ${getColor(e)} group/item`}>
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-medium flex-1">{e.title}</p>
                    {e.eventType !== 'vacation' && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openModal('', { ...e, type: e.eventType })} className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors" title="수정">
                          <Pencil style={{ width: 11, height: 11 }} />
                        </button>
                        <button onClick={() => handleDeleteEvent(e.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors" title="삭제">
                          <Trash2 style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 opacity-70">{formatPeriod(e)}</p>
                  {e.eventType === 'project' && e.project && (
                    <p className="mt-0.5 opacity-70 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-60" />{e.project}</p>
                  )}
                  {e.memo && <p className="mt-0.5 opacity-70">{e.memo}</p>}
                </div>
              ))}
            </div>
          </div>

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
                  <div className={`w-3 h-3 rounded flex-shrink-0 ${item.color}`} /> {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">이번 주 요약</h3>
            <div className="space-y-2.5">
              {[
                { label: '프로젝트 일정', value: `${weekSummary.project}건`,  color: 'text-primary-600' },
                { label: '휴가 인원',     value: `${weekSummary.vacation}명`, color: 'text-yellow-600' },
                { label: '내부 일정',     value: `${weekSummary.event}건`,    color: 'text-blue-600' },
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

      {showModal && (
        <CalendarEventModal
          defaultDate={modalDate}
          editEvent={editEvent}
          onClose={() => { setShowModal(false); setEditEvent(null) }}
          onSubmit={handleCreateEvent}
          onUpdate={handleUpdateEvent}
          projects={projectNames}
          staffList={staffNames}
        />
      )}
    </Layout>
  )
}
