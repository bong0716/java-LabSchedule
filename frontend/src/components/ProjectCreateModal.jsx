import { useState } from 'react'
import { X, FolderKanban, AlertCircle, ChevronDown } from 'lucide-react'

const CATEGORIES = ['시스템 개발', '소프트웨어', 'HW 개발', '인프라', '연구', '기타']
const STATUSES   = ['진행중', '대기중']

const STAFF = [
  { name: '홍길동', team: '시스템팀',      position: '책임연구원' },
  { name: '김철수', team: '시스템팀',      position: '선임연구원' },
  { name: '이영희', team: '소프트웨어팀',   position: '선임연구원' },
  { name: '박지민', team: 'HW팀',          position: '연구원' },
  { name: '최민준', team: '소프트웨어팀',   position: '연구원' },
  { name: '김민서', team: 'HW팀',          position: '연구원' },
]

// 프로젝트 코드 자동 제안: 첫 글자 이니셜 조합 + 년도 + 순번
function suggestCode(name) {
  if (!name.trim()) return ''
  const words = name.trim().split(/[\s_\-]+/)
  const initials = words
    .map(w => w[0]?.toUpperCase() ?? '')
    .filter(Boolean)
    .slice(0, 3)
    .join('')
  const year = new Date().getFullYear()
  return `${initials}-${year}-`
}

export default function ProjectCreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name:        '',
    code:        '',
    category:    '',
    status:      '대기중',
    pm:          '',
    team:        [],
    startDate:   '',
    endDate:     '',
    description: '',
  })
  const [errors, setErrors]     = useState({})
  const [pmOpen, setPmOpen]     = useState(false)
  const [codeEdited, setCodeEdited] = useState(false) // 수동 편집 여부

  /* ── 프로젝트명 변경 → 코드 자동 제안 ── */
  const handleName = (val) => {
    setForm(prev => ({
      ...prev,
      name: val,
      code: codeEdited ? prev.code : suggestCode(val),
    }))
    setErrors(prev => ({ ...prev, name: null }))
  }

  /* ── 팀원 토글 ── */
  const toggleMember = (name) => {
    setForm(prev => {
      const already = prev.team.includes(name)
      // PM이 팀원에 있으면 제거
      const next = already ? prev.team.filter(m => m !== name) : [...prev.team, name]
      return { ...prev, team: next }
    })
  }

  /* ── PM 선택 → 자동으로 팀원에도 포함 ── */
  const handlePm = (name) => {
    setForm(prev => ({
      ...prev,
      pm: name,
      team: prev.team.includes(name) ? prev.team : [name, ...prev.team],
    }))
    setPmOpen(false)
    setErrors(prev => ({ ...prev, pm: null }))
  }

  /* ── 유효성 검사 ── */
  const validate = () => {
    const errs = {}
    if (!form.name.trim())      errs.name      = '프로젝트명을 입력해주세요.'
    if (!form.code.trim())      errs.code      = '프로젝트 코드를 입력해주세요.'
    if (!form.category)         errs.category  = '카테고리를 선택해주세요.'
    if (!form.pm)               errs.pm        = 'PM을 선택해주세요.'
    if (!form.startDate)        errs.startDate = '시작일을 입력해주세요.'
    if (!form.endDate)          errs.endDate   = '종료일을 입력해주세요.'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
                                errs.endDate   = '종료일은 시작일 이후여야 합니다.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit?.({ ...form, progress: 0 })
    onClose()
  }

  const set = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <FolderKanban style={{ width: 15, height: 15 }} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">새 프로젝트 등록</h2>
              <p className="text-xs text-gray-400 mt-0.5">프로젝트 기본 정보와 투입 인력을 입력하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* ── 폼 본문 ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── 섹션: 기본 정보 ── */}
            <Section title="기본 정보">
              {/* 프로젝트명 */}
              <Field label="프로젝트명" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleName(e.target.value)}
                  placeholder="예: 스마트팜 IoT 플랫폼 구축"
                  className={inputCls(errors.name)}
                />
              </Field>

              {/* 코드 + 카테고리 (2열) */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="프로젝트 코드" required error={errors.code}
                  hint="자동 제안됩니다. 직접 수정 가능">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => { setCodeEdited(true); set('code', e.target.value); setErrors(p => ({ ...p, code: null })) }}
                    placeholder="예: SF-2026-01"
                    className={inputCls(errors.code)}
                  />
                </Field>
                <Field label="카테고리" required error={errors.category}>
                  <select
                    value={form.category}
                    onChange={e => { set('category', e.target.value); setErrors(p => ({ ...p, category: null })) }}
                    className={selectCls(errors.category)}
                  >
                    <option value="">선택하세요</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              {/* 설명 */}
              <Field label="프로젝트 설명" hint="선택 입력">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="프로젝트 목적과 주요 내용을 간략히 입력하세요..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none placeholder-gray-400 transition-all"
                />
              </Field>
            </Section>

            {/* ── 섹션: 일정 ── */}
            <Section title="일정">
              <div className="grid grid-cols-2 gap-3">
                <Field label="시작일" required error={errors.startDate}>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => { set('startDate', e.target.value); setErrors(p => ({ ...p, startDate: null })) }}
                    className={inputCls(errors.startDate)}
                  />
                </Field>
                <Field label="종료일" required error={errors.endDate}>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={e => { set('endDate', e.target.value); setErrors(p => ({ ...p, endDate: null })) }}
                    className={inputCls(errors.endDate)}
                  />
                </Field>
              </div>

              {/* 초기 상태 */}
              <Field label="초기 상태">
                <div className="flex items-center gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => set('status', s)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                        form.status === s
                          ? s === '진행중'
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            {/* ── 섹션: 인력 ── */}
            <Section title="투입 인력">
              {/* PM 선택 (드롭다운) */}
              <Field label="PM" required error={errors.pm}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPmOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm bg-gray-50 border rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${errors.pm ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {form.pm ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                          {form.pm[0]}
                        </div>
                        <span className="text-gray-800">{form.pm}</span>
                        <span className="text-xs text-gray-400">
                          {STAFF.find(s => s.name === form.pm)?.position}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">PM을 선택하세요</span>
                    )}
                    <ChevronDown style={{ width: 14, height: 14 }} className={`text-gray-400 transition-transform ${pmOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {pmOpen && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {STAFF.map(s => (
                        <button
                          key={s.name} type="button"
                          onClick={() => handlePm(s.name)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${form.pm === s.name ? 'bg-primary-50' : ''}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 flex-shrink-0">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${form.pm === s.name ? 'text-primary-700' : 'text-gray-800'}`}>{s.name}</p>
                            <p className="text-xs text-gray-400">{s.team} · {s.position}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* 팀원 멀티셀렉트 */}
              <Field label="팀원" hint="클릭하여 추가/제거">
                <div className="flex flex-wrap gap-2">
                  {STAFF.map(s => {
                    const selected = form.team.includes(s.name)
                    const isPm     = form.pm === s.name
                    return (
                      <button
                        key={s.name} type="button"
                        onClick={() => !isPm && toggleMember(s.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isPm
                            ? 'bg-primary-600 text-white border-primary-600 cursor-default'
                            : selected
                            ? 'bg-primary-50 text-primary-700 border-primary-300 hover:bg-primary-100'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPm ? 'bg-white/30 text-white' :
                          selected ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {s.name[0]}
                        </div>
                        {s.name}
                        {isPm && <span className="text-xs opacity-70">(PM)</span>}
                      </button>
                    )
                  })}
                </div>
                {form.team.length > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    선택된 팀원 {form.team.length}명 · 총 투입 규모 산정은 프로젝트 생성 후 WBS에서 입력하세요
                  </p>
                )}
              </Field>
            </Section>

          </div>

          {/* ── 푸터 ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <p className="text-xs text-gray-400">
              <span className="text-red-400">*</span> 필수 입력 항목
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                취소
              </button>
              <button type="submit" className="btn-primary flex items-center gap-1.5">
                <FolderKanban style={{ width: 14, height: 14 }} />
                프로젝트 등록
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── 유틸 서브 컴포넌트 ── */
function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
        {title}
      </p>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-gray-600">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">— {hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle style={{ width: 11, height: 11 }} />
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${
    err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
  }`

const selectCls = (err) =>
  `w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${
    err ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
  }`
