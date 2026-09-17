import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

const CATEGORIES = ['기술', 'HW', 'UI/UX', '일정', '기타']
const STAFF      = ['홍길동', '김철수', '이영희', '박지민', '최민준', '김민서']

export default function IssueCreateModal({ onClose, onSubmit, nextId }) {
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    title:       '',
    category:    '',
    assignee:    '',
    openedDate:  today,
    dueDate:     '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim())       errs.title       = '제목을 입력해주세요.'
    if (!form.category)           errs.category    = '분류를 선택해주세요.'
    if (!form.description.trim()) errs.description = '이슈 내용을 입력해주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSubmit?.({
      id:          nextId,
      title:       form.title.trim(),
      category:    form.category,
      status:      '신규',
      assignee:    form.assignee || '—',
      reporter:    '김연구',
      openedDate:  form.openedDate,
      dueDate:     form.dueDate || '—',
      description: form.description.trim(),
      responses: [],
    })
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle style={{ width: 15, height: 15 }} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">이슈 등록</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {nextId} · 등록 시 상태는 <span className="text-blue-500 font-medium">신규</span>로 설정됩니다
              </p>
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

            {/* 제목 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => { set('title', e.target.value); setErrors(p => ({ ...p, title: null })) }}
                placeholder="이슈 제목을 입력하세요"
                className={inputCls(errors.title)}
                autoFocus
              />
              {errors.title && <FieldError msg={errors.title} />}
            </div>

            {/* 분류 + 담당자 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  분류 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => { set('category', e.target.value); setErrors(p => ({ ...p, category: null })) }}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${
                    errors.category ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <option value="">분류 선택</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <FieldError msg={errors.category} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">담당자</label>
                <select
                  value={form.assignee}
                  onChange={e => set('assignee', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700"
                >
                  <option value="">담당자 선택</option>
                  {STAFF.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 발생일 + 마감일 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">발생일</label>
                <input
                  type="date"
                  value={form.openedDate}
                  onChange={e => set('openedDate', e.target.value)}
                  className={inputCls(false)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  마감일 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={form.openedDate || undefined}
                  onChange={e => set('dueDate', e.target.value)}
                  className={inputCls(false)}
                />
              </div>
            </div>

            {/* 이슈 내용 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                이슈 내용 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => { set('description', e.target.value); setErrors(p => ({ ...p, description: null })) }}
                placeholder="이슈 발생 상황과 영향을 상세히 기록하세요."
                rows={3}
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none placeholder-gray-400 transition-all ${
                  errors.description ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                }`}
              />
              {errors.description && <FieldError msg={errors.description} />}
            </div>

          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">취소</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <AlertCircle style={{ width: 14, height: 14 }} />
              이슈 등록
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
