import { useState } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'

const TEAMS = ['ITCore연구소', 'IT사업본부']
const POSITIONS_BY_TEAM = {
  'ITCore연구소': ['연구원', '선임연구원', '책임연구원', '수석연구원', '소장'],
  'IT사업본부':   ['사원', '주임', '대리', '과장', '차장', '부장', '이사'],
}

export default function StaffCreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    position: '',
    team: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '이름을 입력해주세요.'
    if (!form.position) errs.position = '직급을 선택해주세요.'
    if (!form.team) errs.team = '소속 팀을 선택해주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    onSubmit?.({
      name: form.name.trim(),
      position: form.position,
      team: form.team,
      email: form.email.trim(),
      phone: form.phone.trim(),
      projects: [],
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <UserPlus style={{ width: 15, height: 15 }} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">직원 추가</h2>
              <p className="text-xs text-gray-400 mt-0.5">새 직원 정보를 입력하세요</p>
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
            {/* 이름 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => { set('name', e.target.value); setErrors(p => ({ ...p, name: null })) }}
                placeholder="예: 홍길동"
                className={inputCls(errors.name)}
                autoFocus
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            {/* 소속 + 직급 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  소속 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.team}
                  onChange={e => {
                    set('team', e.target.value)
                    set('position', '')
                    setErrors(p => ({ ...p, team: null, position: null }))
                  }}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${
                    errors.team ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <option value="">소속 선택</option>
                  {TEAMS.map(t => <option key={t}>{t}</option>)}
                </select>
                {errors.team && <FieldError msg={errors.team} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  직급 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.position}
                  onChange={e => { set('position', e.target.value); setErrors(p => ({ ...p, position: null })) }}
                  disabled={!form.team}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.position ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <option value="">직급 선택</option>
                  {(POSITIONS_BY_TEAM[form.team] || []).map(p => <option key={p}>{p}</option>)}
                </select>
                {errors.position && <FieldError msg={errors.position} />}
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                이메일 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="예: hong@kornec.re.kr"
                className={inputCls(false)}
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                연락처 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="예: 010-1234-5678"
                className={inputCls(false)}
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <UserPlus style={{ width: 14, height: 14 }} />
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
