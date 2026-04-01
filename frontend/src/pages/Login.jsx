import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'student'

  // If no valid role, redirect to role selection
  useEffect(() => {
    if (!['student', 'club', 'teacher'].includes(role)) {
      navigate('/role-selection')
    }
  }, [role, navigate])

  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const getDomainDesc = () => {
    if (role === 'teacher') return '@jaipur.manipal.edu'
    return '@muj.manipal.edu'
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await login(role, form.email, form.password, form.rememberMe)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
    setApiError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-transparent">
      {/* Playful background floaters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-between items-center px-10">
        <div className="w-[400px] h-[400px] rounded-full bg-white/5 backdrop-blur-md opacity-10 blur-[60px]" />
        <div className="w-[500px] h-[500px] rounded-full bg-white/5 backdrop-blur-md opacity-10 blur-[80px]" />
      </div>

      <div className="w-full max-w-md card relative z-10 animate-fade-up">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FFB800] rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-[#FFB800]/30 transform rotate-3">
            <Zap size={32} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <Link to="/role-selection" className="inline-block text-white/40 font-bold text-sm hover:text-white transition-colors mb-2">&larr; Change Role</Link>
          <h2 className="text-3xl font-black text-white mb-2 capitalize">{role} Login</h2>
          <p className="text-white/60 font-bold text-sm">Sign in with your {getDomainDesc()} account</p>
        </div>

        {apiError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-bold text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder={`user${getDomainDesc()}`}
                value={form.email}
                onChange={set('email')}
                className={`input-field pl-11 !py-3.5 ${errors.email ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
              />
            </div>
            {errors.email && <p className="text-red-500 font-bold text-xs mt-2">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                className={`input-field pl-11 pr-12 !py-3.5 ${errors.password ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 font-bold text-xs mt-2">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={form.rememberMe}
              onChange={set('rememberMe')}
              className="w-5 h-5 rounded border-2 border-slate-300 bg-transparent text-white focus:ring-slate-900 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm font-bold text-white/60 cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 !py-4 text-lg">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-white/60">
          Don't have an account?{' '}
          <Link to={`/signup?role=${role}`} className="text-blue-400 hover:text-blue-800 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
