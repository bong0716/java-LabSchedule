import { useState } from 'react'
import { X, Plus, Trash2, AlertCircle, ClipboardList } from 'lucide-react'

// 기간 자동 계산 헬퍼
function getWeekRange(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const day = d.getDay()
  const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  const fmt = (dt) => dt.toISOString().slice(0, 10)
  return { start: fmt(mon), end: fmt(fri) }
}

function getMonthRange(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const year = d.getFullYear(), month = d.getMonth()
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

function buildTitle(type, start, end) {
  if (!start) return ''
  if (type === '주간') {
    const d = new Date(start)
    const month = d.getMonth() + 1
    // 몇째 주인지 계산
    const weekNum = Math.ceil(d.getDate() / 7)
    return `${month}월 ${weekNum}주차 주간 업무 보고`
  }
  const d = new Date(start)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 월간 업무 보고`
}

export default function ReportWriteModal({ onClose, onSubmit, existingIssues = [], onNewIssues }) {
  const today = new Date().toISOString().slice(0, 10)
  const initWeek = getWeekRange(today)

  const [type, setType]       = useState('주간')
  const [refDate, setRefDate] = useState(today)   // 기간 자동 계산 기준
  const [form, setForm] = useState({
    title:     buildTitle('주간', initWeek.start, initWeek.end),
    periodStart: initWeek.start,
    periodEnd:   initWeek.end,
    progress:  '',
    thisWeek:  [''],
    nextWeek:  [''],
    issueItems: [{ mode: 'select', issueId: '', text: '' }],
  })
  const [errors, setErrors] = useState({})

  /* ── 유형 변경 → 기간/제목 재계산 ──────── */
  const handleTypeChange = (t) => {
    setType(t)
    const range = t === '주간' ? getWeekRange(refDate) : getMonthRange(refDate)
    const title = buildTitle(t, range.start, range.end)
    setForm(prev => ({ ...prev, periodStart: range.start, periodEnd: range.end, title }))
  }

  /* ── 기준일 변경 ─────────────────────── */
  const handleRefDate = (val) => {
    setRefDate(val)
    const range = type === '주간' ? getWeekRange(val) : getMonthRange(val)
    const title = buildTitle(type, range.start, range.end)
    setForm(prev => ({ ...prev, periodStart: range.start, periodEnd: range.end, title }))
  }

  /* ── 동적 리스트 헬퍼 ────────────────── */
  const updateList = (field, idx, val) =>
    setForm(prev => {
      const arr = [...prev[field]]; arr[idx] = val
      return { ...prev, [field]: arr }
    })
  const addItem    = (field) => setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  const removeItem = (field, idx) =>
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))

  /* ── 이슈 항목 헬퍼 ──────────────────────── */
  const sortedExistingIssues = [...existingIssues].sort((a, b) =>
    b.openedDate.localeCompare(a.openedDate)
  )

  const addIssueItem = () => setForm(prev => ({
    ...prev,
    issueItems: [...prev.issueItems, { mode: 'select', issueId: '', text: '' }],
  }))

  const removeIssueItem = (idx) => setForm(prev => ({
    ...prev,
    issueItems: prev.issueItems.filter((_, i) => i !== idx),
  }))

  const updateIssueItem = (idx, updates) => setForm(prev => {
    const arr = [...prev.issueItems]
    arr[idx] = { ...arr[idx], ...updates }
    return { ...prev, issueItems: arr }
  })

  /* ── 유효성 검사 ─────────────────────── */
  const validate = () => {
    const errs = {}
    if (!form.title.trim())            errs.title    = '제목을 입력해주세요.'
    if (!form.periodStart)             errs.period   = '기간을 입력해주세요.'
    if (form.progress === '' || isNaN(Number(form.progress)) ||
        Number(form.progress) < 0 || Number(form.progress) > 100)
                                       errs.progress = '0~100 사이의 숫자를 입력해주세요.'
    if (form.thisWeek.every(s => !s.trim()))
                                       errs.thisWeek = '진행사항을 하나 이상 입력해주세요.'
    if (form.nextWeek.every(s => !s.trim()))
                                       errs.nextWeek = '계획을 하나 이상 입력해주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    // 이슈 항목 처리
    const newIssuesToAdd = []
    const issueTexts = []

    form.issueItems.forEach((item) => {
      if (item.mode === 'select' && item.issueId) {
        const found = existingIssues.find(i => i.id === item.issueId)
        if (found) issueTexts.push(`${found.id}: ${found.title} (${found.status})`)
      } else if (item.mode === 'input' && item.text.trim()) {
        issueTexts.push(item.text.trim())
        newIssuesToAdd.push({
          id: `ISS-${String(existingIssues.length + newIssuesToAdd.length + 1).padStart(3, '0')}`,
          title: item.text.trim(),
          category: '기타',
          status: '신규',
          assignee: '—',
          reporter: '김연구',
          openedDate: today,
          dueDate: '—',
          description: item.text.trim(),
          responses: [{ date: today, author: '김연구', action: '이슈 등록', content: '보고서 작성 중 이슈 등록.' }],
        })
      }
    })

    if (newIssuesToAdd.length > 0) onNewIssues?.(newIssuesToAdd)
    onSubmit?.({
      type,
      title:    form.title.trim(),
      period:   `${form.periodStart} ~ ${form.periodEnd}`,
      date:     today,
      progress: Number(form.progress),
      thisWeek: form.thisWeek.filter(s => s.trim()),
      nextWeek: form.nextWeek.filter(s => s.trim()),
      issues:   issueTexts.length > 0 ? issueTexts.join('\n') : '특이사항 없음.',
      author:   '김연구',
    })
    onClose()
  }

  const thisWeekLabel = type === '주간' ? '이번 주 진행사항' : '이번 달 진행사항'
  const nextWeekLabel = type === '주간' ? '다음 주 계획'     : '다음 달 계획'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <ClipboardList style={{ width: 15, height: 15 }} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">보고서 작성</h2>
              <p className="text-xs text-gray-400 mt-0.5">주간 또는 월간 업무 보고서를 작성하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* ── 폼 본문 (스크롤) ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* 유형 토글 */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-medium text-gray-600 w-20 flex-shrink-0">보고 유형</label>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['주간', '월간'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`px-5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      type === t
                        ? 'bg-white text-primary-600 shadow-sm font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 기준일 + 기간 */}
            <div>
              <div className="flex items-start gap-4">
                <label className="text-xs font-medium text-gray-600 w-20 pt-2.5 flex-shrink-0">기준일</label>
                <div className="flex-1 space-y-2">
                  <input
                    type="date"
                    value={refDate}
                    onChange={e => handleRefDate(e.target.value)}
                    className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={form.periodStart}
                      onChange={e => { setForm(prev => ({ ...prev, periodStart: e.target.value })); setErrors(prev => ({ ...prev, period: null })) }}
                      className={`flex-1 px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all ${errors.period ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    <span className="text-xs text-gray-400 flex-shrink-0">~</span>
                    <input
                      type="date"
                      value={form.periodEnd}
                      onChange={e => setForm(prev => ({ ...prev, periodEnd: e.target.value }))}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                    />
                  </div>
                  {errors.period && <FieldError msg={errors.period} />}
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="flex items-start gap-4">
              <label className="text-xs font-medium text-gray-600 w-20 pt-2.5 flex-shrink-0">
                제목 <span className="text-red-400">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => { setForm(prev => ({ ...prev, title: e.target.value })); setErrors(prev => ({ ...prev, title: null })) }}
                  placeholder="보고서 제목"
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${errors.title ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                />
                {errors.title && <FieldError msg={errors.title} />}
              </div>
            </div>

            {/* 진행률 */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-medium text-gray-600 w-20 flex-shrink-0">
                진행률 <span className="text-red-400">*</span>
              </label>
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="number"
                  min={0} max={100}
                  value={form.progress}
                  onChange={e => { setForm(prev => ({ ...prev, progress: e.target.value })); setErrors(prev => ({ ...prev, progress: null })) }}
                  placeholder="0"
                  className={`w-20 px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-center ${errors.progress ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                />
                <span className="text-sm text-gray-500">%</span>
                {form.progress !== '' && !isNaN(Number(form.progress)) && (
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, Number(form.progress)))}%` }}
                    />
                  </div>
                )}
                {errors.progress && <FieldError msg={errors.progress} />}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 이번 주/월 진행사항 */}
            <DynamicList
              label={thisWeekLabel}
              required
              items={form.thisWeek}
              placeholder="진행한 업무 내용을 입력하세요"
              onChange={(idx, val) => updateList('thisWeek', idx, val)}
              onAdd={() => addItem('thisWeek')}
              onRemove={(idx) => removeItem('thisWeek', idx)}
              error={errors.thisWeek}
            />

            {/* 다음 주/월 계획 */}
            <DynamicList
              label={nextWeekLabel}
              required
              items={form.nextWeek}
              placeholder="계획된 업무 내용을 입력하세요"
              onChange={(idx, val) => updateList('nextWeek', idx, val)}
              onAdd={() => addItem('nextWeek')}
              onRemove={(idx) => removeItem('nextWeek', idx)}
              error={errors.nextWeek}
            />

            {/* 특이사항 / 이슈 */}
            <div className="flex items-start gap-4">
              <label className="text-xs font-medium text-gray-600 w-20 pt-2 flex-shrink-0 leading-tight">
                특이사항 /<br />이슈
              </label>
              <div className="flex-1 space-y-2">
                {form.issueItems.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => updateIssueItem(idx, { mode: 'select', issueId: '', text: '' })}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            item.mode === 'select'
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          기존 이슈 선택
                        </button>
                        <button
                          type="button"
                          onClick={() => updateIssueItem(idx, { mode: 'input', issueId: '', text: '' })}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            item.mode === 'input'
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          직접 입력
                        </button>
                      </div>
                      {form.issueItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIssueItem(idx)}
                          className="ml-auto w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      )}
                    </div>
                    {item.mode === 'select' ? (
                      <select
                        value={item.issueId}
                        onChange={e => updateIssueItem(idx, { issueId: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700"
                      >
                        <option value="">이슈 선택 (최신 등록순)</option>
                        {sortedExistingIssues.map(issue => (
                          <option key={issue.id} value={issue.id}>
                            [{issue.id}] {issue.title} ({issue.status}) · {issue.openedDate}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={item.text}
                        onChange={e => updateIssueItem(idx, { text: e.target.value })}
                        placeholder="새 이슈 내용을 입력하세요 (이슈 목록에 자동 등록됩니다)"
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIssueItem}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium py-1 transition-colors"
                >
                  <Plus style={{ width: 13, height: 13 }} />
                  이슈 항목 추가
                </button>
              </div>
            </div>

            {/* 작성자 (자동) */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600 w-20 flex-shrink-0">작성자</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                  김
                </div>
                <span className="text-xs font-medium text-gray-800">김연구</span>
                <span className="text-xs text-gray-400 ml-1">· {today}</span>
              </div>
            </div>
          </div>

          {/* ── 푸터 ── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <ClipboardList style={{ width: 14, height: 14 }} />
              보고서 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── 동적 리스트 서브 컴포넌트 ─────────────────────── */
function DynamicList({ label, required, items, placeholder, onChange, onAdd, onRemove, error }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-xs font-medium text-gray-600 w-20 pt-2.5 flex-shrink-0 leading-tight">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex-1 space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 font-medium">
              {idx + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={e => onChange(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium py-1 transition-colors"
        >
          <Plus style={{ width: 13, height: 13 }} />
          항목 추가
        </button>
        {error && <FieldError msg={error} />}
      </div>
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
      <AlertCircle style={{ width: 11, height: 11 }} />
      {msg}
    </p>
  )
}
