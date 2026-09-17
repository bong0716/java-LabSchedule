import { useState, useRef } from 'react'
import { X, Upload, FileText, FolderOpen, AlertCircle } from 'lucide-react'

const CATEGORIES = ['보고서', '설계서', '계획서', 'HW도면', '소프트웨어', '회의록', '기타']

const VERSION_PATTERN = /^(v\d+\.\d+(\.\d+)?|Rev\d+|R\d+)$/i

export default function FileUploadModal({ onClose, onSubmit }) {
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    fileName: '',
    category: '',
    version: '',
    note: '',
  })
  const [errors, setErrors] = useState({})

  /* ── 파일 선택 ──────────────────────────── */
  const applyFile = (f) => {
    if (!f) return
    setFile(f)
    // 확장자 제거
    const nameNoExt = f.name.replace(/\.[^/.]+$/, '')
    // 버전 패턴 추출 (예: 설계서_v1.2 → v1.2)
    const verMatch = nameNoExt.match(/_?(v\d+[\.\d]*|Rev\d+)$/i)
    // 산출물명: 버전 접미사 제거 후 남은 부분
    const baseName = verMatch
      ? nameNoExt.slice(0, nameNoExt.lastIndexOf(verMatch[0])).replace(/[_-]+$/, '')
      : nameNoExt
    setForm(prev => ({
      ...prev,
      fileName: prev.fileName || baseName,
      version:  prev.version  || (verMatch ? verMatch[1] : ''),
    }))
    setErrors(prev => ({ ...prev, file: null, fileName: null }))
  }

  const handleFileInput = (e) => applyFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  /* ── 유효성 검사 ────────────────────────── */
  const validate = () => {
    const errs = {}
    if (!file)                 errs.file     = '파일을 선택해주세요.'
    if (!form.fileName.trim()) errs.fileName = '산출물명을 입력해주세요.'
    if (!form.category)        errs.category = '카테고리를 선택해주세요.'
    if (!form.version.trim())  errs.version  = '버전을 입력해주세요.'
    else if (!VERSION_PATTERN.test(form.version.trim()))
                               errs.version  = '형식: v1.0 / v1.1 / Rev1 / R2'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit?.({ file, ...form, version: form.version.trim() })
    onClose()
  }

  const formatSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">새 산출물 등록</h2>
            <p className="text-xs text-gray-400 mt-0.5">파일을 업로드하고 버전 정보를 입력하세요</p>
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

            {/* ── 파일 드래그앤드롭 ── */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                파일 <span className="text-red-400">*</span>
              </label>

              {file ? (
                /* 파일 선택됨 */
                <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText style={{ width: 16, height: 16 }} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setForm(prev => ({ ...prev, fileName: '', version: '' })) }}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary-200 text-primary-400 hover:text-primary-700 transition-colors flex-shrink-0"
                  >
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ) : (
                /* 드래그 존 */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    dragging
                      ? 'border-primary-400 bg-primary-50/60'
                      : errors.file
                      ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                      : 'border-gray-200 bg-gray-50/50 hover:border-primary-300 hover:bg-primary-50/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragging ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <FolderOpen style={{ width: 20, height: 20 }} className={dragging ? 'text-primary-600' : 'text-gray-400'} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {dragging ? '여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, XLSX, HWP, ZIP 등 모든 형식</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
                </div>
              )}

              {errors.file && <FieldError msg={errors.file} />}
            </div>

            {/* ── 산출물명 ── */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                산출물명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.fileName}
                onChange={e => { setForm(prev => ({ ...prev, fileName: e.target.value })); setErrors(prev => ({ ...prev, fileName: null })) }}
                placeholder="예: 스마트팜_중간보고서"
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${errors.fileName ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
              />
              {errors.fileName
                ? <FieldError msg={errors.fileName} />
                : <p className="mt-1 text-xs text-gray-400">파일 선택 시 파일명 기반으로 자동 입력됩니다</p>
              }
            </div>

            {/* ── 카테고리 + 버전 (2열) ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  카테고리 <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => { setForm(prev => ({ ...prev, category: e.target.value })); setErrors(prev => ({ ...prev, category: null })) }}
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-gray-700 ${errors.category ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <FieldError msg={errors.category} />}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  버전 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.version}
                  onChange={e => { setForm(prev => ({ ...prev, version: e.target.value })); setErrors(prev => ({ ...prev, version: null })) }}
                  placeholder="예: v1.0 / Rev1"
                  className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400 ${errors.version ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                />
                {errors.version && <FieldError msg={errors.version} />}
              </div>
            </div>

            {/* ── 비고 ── */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                비고 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={form.note}
                onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="변경 사항이나 등록 이유를 간략히 입력하세요..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none placeholder-gray-400 transition-all"
              />
            </div>

            {/* ── 등록자 (자동) ── */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 flex-shrink-0">
                김
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-500">등록자</span>
                <span className="text-xs font-medium text-gray-800 ml-2">김연구 (자동)</span>
              </div>
              <span className="text-xs text-gray-400">{new Date().toISOString().slice(0, 10)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={onClose} className="btn-secondary">
              취소
            </button>
            <button type="submit" className="btn-primary flex items-center gap-1.5">
              <Upload style={{ width: 14, height: 14 }} />
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
