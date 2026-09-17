import { useState } from 'react'
import { X, CalendarDays, AlertCircle } from 'lucide-react'

const PROJECTS = [
  '스마트팜 IoT 플랫폼 구축',
  '환경 모니터링 시스템 개발',
  '데이터 분석 자동화 모듈',
  '바이오센서 HW 개발',
  '연구소 내부망 보안 강화',
]

const STAFF = ['홍길동', '김철수', '이영희', '박지민', '최민준', '김민서']

const TYPE_CONFIG = {
  project: { label: '프로젝트 일정', color: 'bg-primary-600', dot: 'bg-primary-500' },
  vacation: { label: '휴가',         color: 'bg-yellow-500',   dot: 'bg-yellow-500' },
  event:    { label: '내부 일정', color: 'bg-blue-500',    dot: 'bg-blue-500' },
}

export default function CalendarEventModal({ onClose, onSubmit, defaultDate = '' }) {
  const [form, setForm] = useState({
    title:      '',
    type:       'event',
    startDate:  defaultDate,
    endDate:    '',
    allDay:     true,
    project:    '',
    targetStaff: '',
    memo:       '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim())    errs.title     = '제목을 입력해주세요.'
    if (!form.startDate)       errs.startDate = '날짜를 입력해주세요.'
    if (form.endDate && form.endDate < form.startDate)
                               errs.endDate   = '종료일은 시작일 이후여야 합니다.'
    if (form.type === 'project' && !form.project)
                               errs.project   = '관련 프로젝트를 선택해주세요.'
    if (form.type === 'vacation' && !form.targetStaff)
                               errs.targetStaff = '대상 직원을 선택해주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const colorMap = {
      project: 'bg-primary-100 text-primary-700 border-primary-200',
      vacation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      event:    'bg-blue-100 text-blue-700 border-blue-200',
    }

    // 기간이 있으면 시작일~종료일 모두 등록
    const dates = []
    if (form.endDate && form.endDate !== form.startDate) {
      const cur = new Date(form.startDate)
      const end = new Date(form.endDate)
      while (cur <= end) {
        dates.push(cur.toISOString().slice(0, 10))
        cur.setDate(cur.getDate() + 1)
      }
    } else {
      dates.push(form.startDate)
    }

    const newEvents = dates.map(date => ({
      date,
      title: form.title.trim(),
      type:  form.type,
      color: colorMap[form.type],
      memo:  form.memo.trim(),
      ...(form.project     && { project: form.project }),
      ...(form.targetStaff && { staff:   form.targetStaff }),
    }))

    onSubmit?.(newEvents)
    onClose()
  }

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${
      err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <CalendarDays style={{ width: 15, height: 15 }} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">일정 등록</h2>
              <p className="text-xs text-gray-400 mt-0.5">새 일정을 캘린더에 추가하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">

            {/* 유형 선택 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                일정 유형 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key} type="button"
                    onClick={() => { set('type', key); setErrors(p => ({ ...p, project: null, targetStaff: null })) }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      form.type === key
                        ? 'border-transparent text-white shadow-sm ' + cfg.color
                        : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${form.type === key ? 'bg-white/70' : cfg.dot}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => { set('title', e.target.value); setErrors(p => ({ ...p, title: null })) }}
                placeholder={
                  form.type === 'project'  ? '예: 스마트팜 중간보고' :
                  form.type === 'vacation' ? '예: 홍길동 연차' :
                  '예: 월간 연구소 회의'
                }
                className={inputCls(errors.title)}
              />
              {errors.title && <FieldError msg={errors.title} />}
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                날짜 <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => { set('startDate', e.target.value); setErrors(p => ({ ...p, startDate: null })) }}
                  className={`flex-1 ${inputCls(errors.startDate)}`}
                />
                <span className="text-xs text-gray-400 flex-shrink-0">~</span>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={e => { set('endDate', e.target.value); setErrors(p => ({ ...p, endDate: null })) }}
                  className={`flex-1 ${inputCls(errors.endDate)}`}
                />
              </div>
              {(errors.startDate || errors.endDate) && (
                <FieldError msg={errors.startDate || errors.endDate} />
              )}
              <p className="mt-1 text-xs text-gray-400">종료일은 선택 사항입니다 (당일 일정이면 비워두세요)</p>
            </div>

            {/* 관련 프로젝트 (project 유형일 때만) */}
            {form.type === 'project' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  관련 프로젝트 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.project}
                  onChange={e => { set('project', e.target.value); setErrors(p => ({ ...p, project: null })) }}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${errors.project ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                >
                  <option value="">프로젝트 선택</option>
                  {PROJECTS.map(p => <option key={p}>{p}</option>)}
                </select>
                {errors.project && <FieldError msg={errors.project} />}
              </div>
            )}

            {/* 대상 직원 (vacation 유형일 때만) */}
            {form.type === 'vacation' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  대상 직원 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.targetStaff}
                  onChange={e => { set('targetStaff', e.target.value); setErrors(p => ({ ...p, targetStaff: null })) }}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${errors.targetStaff ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                >
                  <option value="">직원 선택</option>
                  {STAFF.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.targetStaff && <FieldError msg={errors.targetStaff} />}
              </div>
            )}

            {/* 메모 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                메모 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={form.memo}
                onChange={e => set('memo', e.target.value)}
                placeholder="추가 설명이나 장소, 참석자 등을 입력하세요..."
                rows={2}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none placeholder-gray-400 transition-all"
              />
            </div>

          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <CalendarDays style={{ width: 14, height: 14 }} />
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
      <AlertCircle style={{ width: 11, height: 11 }} />
      {msg}
    </p>
  )
}
