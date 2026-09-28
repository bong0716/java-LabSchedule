import { useState } from 'react'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const VACATION_TYPES = ['연차', '반차']

export default function VacationRequestModal({ onClose, onSubmit, staffList = [], editVacation = null }) {
  const { user } = useAuth()
  const isEdit = !!editVacation
  const currentUser = { name: user?.staffName || '', team: '' }
  const [form, setForm] = useState(() => {
    if (editVacation) {
      return {
        name: editVacation.name,
        type: editVacation.type,
        startDate: editVacation.start,
        endDate: editVacation.start === editVacation.end ? '' : editVacation.end,
      }
    }
    return {
      name: currentUser.name,
      type: '연차',
      startDate: '',
      endDate: '',
    }
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const calcDays = () => {
    if (form.type === '반차') return 0.5
    if (!form.startDate) return 0
    if (!form.endDate || form.endDate === form.startDate) return 1
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  const validate = () => {
    const errs = {}
    if (!form.startDate) errs.startDate = '시작일을 입력해주세요.'
    if (form.type === '연차' && form.endDate && form.endDate < form.startDate)
      errs.endDate = '종료일은 시작일 이후여야 합니다.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const days = calcDays()
    onSubmit?.({
      id: editVacation?.id,
      name: form.name,
      type: form.type,
      start: form.startDate,
      end: form.type === '반차' ? form.startDate : (form.endDate || form.startDate),
      days,
    })
    onClose()
  }

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${
      err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
    }`

  const days = calcDays()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Calendar style={{ width: 15, height: 15 }} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{isEdit ? '휴가 수정' : '휴가 신청'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{isEdit ? '휴가 일정을 수정하세요' : '휴가 일정을 등록하세요'}</p>
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
            {/* 신청자 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">신청자</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                  {(isEdit ? editVacation.name : currentUser.name)[0]}
                </div>
                <span className="text-sm text-gray-900 font-medium">{isEdit ? editVacation.name : currentUser.name}</span>
              </div>
            </div>

            {/* 휴가 유형 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                휴가 유형 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VACATION_TYPES.map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => set('type', t)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      form.type === t
                        ? 'border-transparent text-white shadow-sm bg-yellow-500'
                        : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {form.type === '반차' ? '날짜' : '기간'} <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => { set('startDate', e.target.value); setErrors(p => ({ ...p, startDate: null })) }}
                  className={`flex-1 ${inputCls(errors.startDate)}`}
                />
                {form.type !== '반차' && (
                  <>
                    <span className="text-xs text-gray-400 flex-shrink-0">~</span>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={e => { set('endDate', e.target.value); setErrors(p => ({ ...p, endDate: null })) }}
                      className={`flex-1 ${inputCls(errors.endDate)}`}
                    />
                  </>
                )}
              </div>
              {(errors.startDate || errors.endDate) && (
                <FieldError msg={errors.startDate || errors.endDate} />
              )}
              {form.type !== '반차' && (
                <p className="mt-1 text-xs text-gray-400">당일 휴가면 종료일을 비워두세요</p>
              )}
            </div>

            {/* 사용 일수 미리보기 */}
            {form.startDate && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-yellow-50 border border-yellow-100 rounded-lg">
                <span className="text-xs text-yellow-700">사용 일수</span>
                <span className="text-sm font-semibold text-yellow-700">{days}일</span>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <Calendar style={{ width: 14, height: 14 }} />
              {isEdit ? '수정' : '신청'}
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
