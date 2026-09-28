import { useState, useEffect } from 'react'
import { X, Users, UserPlus, AlertCircle } from 'lucide-react'

export default function MemberAddModal({ onClose, onSubmit, existingNames = [], staffList = [] }) {
  const [type, setType] = useState('internal') // 'internal' | 'freelancer'
  const [form, setForm] = useState({
    staffSelect: '',
    name:    '',
    company: '',
    contact: '',
    role:    '팀원',
    mm:      '',
    joined:  new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const switchType = (t) => {
    setType(t)
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (type === 'internal') {
      if (!form.staffSelect)
        errs.staffSelect = '직원을 선택해주세요.'
      else if (existingNames.includes(form.staffSelect))
        errs.staffSelect = '이미 참여 중인 인력입니다.'
    } else {
      if (!form.name.trim()) errs.name = '이름을 입력해주세요.'
    }
    if (!form.mm)
      errs.mm = '투입공수를 입력해주세요.'
    else if (isNaN(Number(form.mm)) || Number(form.mm) <= 0)
      errs.mm = '0보다 큰 숫자를 입력해주세요.'
    if (!form.joined)
      errs.joined = '참여 시작일을 입력해주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const selectedStaff = staffList.find(s => s.name === form.staffSelect)
    const member = type === 'internal'
      ? {
          name:         form.staffSelect,
          role:         form.role,
          team:         selectedStaff?.team || '',
          mm:           Number(form.mm),
          joined:       form.joined,
          isFreelancer: false,
        }
      : {
          name:         form.name.trim(),
          role:         form.role,
          team:         form.company.trim() || '외부',
          contact:      form.contact.trim(),
          mm:           Number(form.mm),
          joined:       form.joined,
          isFreelancer: true,
        }

    onSubmit?.(member)
    onClose()
  }

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${
      err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
    }`

  const selectCls = (err) =>
    `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${
      err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 pb-[20vh]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <UserPlus style={{ width: 15, height: 15 }} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">인력 추가</h2>
              <p className="text-xs text-gray-400 mt-0.5">사내 인력 또는 프리랜서를 등록하세요</p>
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

            {/* 유형 토글 */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => switchType('internal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  type === 'internal'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users style={{ width: 13, height: 13 }} />
                사내 인력
              </button>
              <button
                type="button"
                onClick={() => switchType('freelancer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  type === 'freelancer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus style={{ width: 13, height: 13 }} />
                프리랜서
              </button>
            </div>

            {/* 사내 인력: 직원 선택 */}
            {type === 'internal' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  직원 선택 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.staffSelect}
                  onChange={e => set('staffSelect', e.target.value)}
                  className={selectCls(errors.staffSelect)}
                >
                  <option value="">직원을 선택하세요</option>
                  {staffList.map(s => (
                    <option key={s.name} value={s.name} disabled={existingNames.includes(s.name)}>
                      {s.name}{existingNames.includes(s.name) ? ' (참여 중)' : ''} — {s.team || ''}
                    </option>
                  ))}
                </select>
                {errors.staffSelect && <FieldError msg={errors.staffSelect} />}
              </div>
            )}

            {/* 프리랜서: 이름 + 소속 */}
            {type === 'freelancer' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="예: 김외부"
                    className={inputCls(errors.name)}
                    autoFocus
                  />
                  {errors.name && <FieldError msg={errors.name} />}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      소속/회사 <span className="text-gray-400 font-normal">(선택)</span>
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="예: ㈜ABC솔루션"
                      className={inputCls(false)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      연락처 <span className="text-gray-400 font-normal">(선택)</span>
                    </label>
                    <input
                      type="text"
                      value={form.contact}
                      onChange={e => set('contact', e.target.value)}
                      placeholder="예: 010-0000-0000"
                      className={inputCls(false)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* 역할 + 투입공수 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  역할 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={e => set('role', e.target.value)}
                  className={selectCls(false)}
                >
                  <option value="PM">PM</option>
                  <option value="팀원">팀원</option>
                  <option value="자문">자문</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  투입공수 M/M <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.mm}
                  onChange={e => set('mm', e.target.value)}
                  placeholder="예: 2.5"
                  min="0.1"
                  step="0.1"
                  className={inputCls(errors.mm)}
                />
                {errors.mm && <FieldError msg={errors.mm} />}
              </div>
            </div>

            {/* 참여 시작일 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                참여 시작일 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.joined}
                onChange={e => set('joined', e.target.value)}
                className={inputCls(errors.joined)}
              />
              {errors.joined && <FieldError msg={errors.joined} />}
            </div>

          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">취소</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <UserPlus style={{ width: 14, height: 14 }} />
              추가
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
