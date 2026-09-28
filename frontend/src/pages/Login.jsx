import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FlaskConical, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [firstLoginMsg, setFirstLoginMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFirstLoginMsg('')
    setLoading(true)

    try {
      const data = await login(form.id, form.password)
      if (data.isFirstLogin) {
        setFirstLoginMsg('비밀번호가 설정되었습니다. 환영합니다!')
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/25">
            <FlaskConical className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">KornecFlow</h1>
          <p className="text-sm text-gray-500 mt-1">프로젝트 관리 시스템</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-semibold text-gray-900 mb-6">로그인</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          {firstLoginMsg && (
            <div className="mb-4 px-3 py-2.5 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-700">
              {firstLoginMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">아이디</label>
              <input
                type="text"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                placeholder="아이디를 입력하세요"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword
                    ? <EyeOff style={{ width: 16, height: 16 }} />
                    : <Eye style={{ width: 16, height: 16 }} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm mt-2 shadow-sm shadow-primary-600/20 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            계정 문의: 시스템 관리자에게 연락하세요
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 KORNEC Research Institute
        </p>
      </div>
    </div>
  )
}
