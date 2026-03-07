import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Users, Zap, CheckCircle, Hash, GraduationCap, CalendarDays, UserSquare2 } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'student'

  useEffect(() => {
    if (!['student', 'club', 'teacher'].includes(role)) navigate('/role-selection')
  }, [role, navigate])

  const { signup } = useAuth()
  
  // Unified form state
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    registrationNo: '', className: '', year: ''
  })
  
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [pwFocused, setPwFocused] = useState(false)

  const getDomainDesc = () => role === 'teacher' ? '@jaipur.manipal.edu' : '@muj.manipal.edu'

  const requirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains a number', test: (p) => /\d/.test(p) },
    { label: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
  ]
  const pwStrength = requirements.filter(r => r.test(form.password)).length

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'

    if (role === 'student') {
      if (!form.registrationNo.trim()) e.registrationNo = 'Registration number is required'
      if (!form.className.trim()) e.className = 'Class section is required'
      if (!form.year) e.year = 'Year is required'
    }

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
      let payload = {}
      if (role === 'club') {
        payload = { clubName: form.name.trim(), email: form.email, password: form.password }
      } else if (role === 'student') {
        payload = { 
          name: form.name.trim(), email: form.email, password: form.password,
          registrationNo: form.registrationNo.trim(), className: form.className.trim(), year: form.year 
        }
      } else if (role === 'teacher') {
        payload = { name: form.name.trim(), email: form.email, password: form.password }
      }

      await signup(role, payload)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
    setApiError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d1a' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 rounded-full" style={{ background: 'radial-gradient(circle, #6246ff, transparent)', transform: 'translate(30%, -30%)' }} />
      </div>

      <div className="w-full max-w-md relative animate-fade-up">
        <div className="mb-6">
          <Link to="/role-selection" className="inline-block text-ink-400 text-sm hover:underline mb-4">&larr; Change role</Link>
          <h2 className="text-2xl font-bold text-white mb-1.5 capitalize">{role} Signup</h2>
          <p className="text-white/40 text-sm">Join using your {getDomainDesc()} account</p>
        </div>

        {apiError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">
              {role === 'club' ? 'Club Name' : 'Full Name'}
            </label>
            <div className="relative">
              <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder={role === 'club' ? "e.g. Code Club" : "e.g. John Doe"}
                value={form.name}
                onChange={set('name')}
                className={`input-field pl-10 ${errors.name ? 'border-red-500/50 bg-red-500/5' : ''}`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
          </div>

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

          {role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/60 mb-1.5">Registration Number</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="e.g. 2109..."
                    value={form.registrationNo}
                    onChange={set('registrationNo')}
                    className={`input-field pl-10 ${errors.registrationNo ? 'border-red-500/50 bg-red-500/5' : ''}`}
                  />
                </div>
                {errors.registrationNo && <p className="text-red-400 text-xs mt-1.5">{errors.registrationNo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Class / Section</label>
                <div className="relative">
                  <UserSquare2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="e.g. CSE A"
                    value={form.className}
                    onChange={set('className')}
                    className={`input-field pl-10 ${errors.className ? 'border-red-500/50 bg-red-500/5' : ''}`}
                  />
                </div>
                {errors.className && <p className="text-red-400 text-xs mt-1.5">{errors.className}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Year</label>
                <div className="relative">
                  <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <select
                    value={form.year}
                    onChange={set('year')}
                    className={`input-field pl-10 ${errors.year ? 'border-red-500/50 bg-red-500/5' : ''}`}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option className="bg-[#1a1a2e] text-white" value="">Select...</option>
                    {[1,2,3,4,5].map(y => <option className="bg-[#1a1a2e] text-white" key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                {errors.year && <p className="text-red-400 text-xs mt-1.5">{errors.year}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={set('password')}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                className={`input-field pl-10 pr-11 ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}

            {(pwFocused || form.password) && (
              <div className="mt-2.5 space-y-2 animate-fade-in">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i < pwStrength ? (pwStrength === 1 ? '#ff4757' : pwStrength === 2 ? '#ffa502' : '#2ed573') : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : ''}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to={`/login?role=${role}`} className="text-ink-400 hover:text-ink-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
