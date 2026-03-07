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
      navigate('/dashboard') // unified dashboard that redirects/renders based on role
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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #1a0f57 0%, #2d1a8c 40%, #0d1a4a 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(98,70,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.2) 0%, transparent 50%)' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #6246ff, transparent)' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-ink-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">class2event</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your events<br />
            <span className="gradient-text">like never before</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            The platform for clubs to manage events, students to participate, and teachers to coordinate.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#0d0d1a' }}>
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-6">
            <Link to="/role-selection" className="inline-block text-ink-400 text-sm hover:underline mb-4">&larr; Change role</Link>
            <h2 className="text-2xl font-bold text-white mb-1.5 capitalize">{role} Login</h2>
            <p className="text-white/40 text-sm">Sign in with your {getDomainDesc()} account</p>
          </div>

          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder={`user${getDomainDesc()}`}
                  value={form.email}
                  onChange={set('email')}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  className={`input-field pl-10 pr-11 ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={form.rememberMe}
                onChange={set('rememberMe')}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-ink-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-white/50 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to={`/signup?role=${role}`} className="text-ink-400 hover:text-ink-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
