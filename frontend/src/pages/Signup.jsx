import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Users, Zap, CheckCircle } from 'lucide-react'

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
]

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({ clubName: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [pwFocused, setPwFocused] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.clubName.trim()) e.clubName = 'Club name is required'
    else if (form.clubName.trim().length < 3) e.clubName = 'Club name must be at least 3 characters'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
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
      await signup(form.clubName.trim(), form.email, form.password)
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

  const pwStrength = requirements.filter(r => r.test(form.password)).length

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d1a' }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 rounded-full"
          style={{ background: 'radial-gradient(circle, #6246ff, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-8 rounded-full"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', transform: 'translate(-30%, 30%)' }} />
      </div>

      <div className="w-full max-w-md relative animate-fade-up">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-ink-500 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">class2event</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1.5">Create your club</h2>
          <p className="text-white/40 text-sm">Start managing events in minutes</p>
        </div>

        {apiError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Club name</label>
            <div className="relative">
              <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="e.g. Tech Innovators Club"
                value={form.clubName}
                onChange={set('clubName')}
                className={`input-field pl-10 ${errors.clubName ? 'border-red-500/50 bg-red-500/5' : ''}`}
              />
            </div>
            {errors.clubName && <p className="text-red-400 text-xs mt-1.5">{errors.clubName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                placeholder="club@university.edu"
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

            {/* Password strength */}
            {(pwFocused || form.password) && (
              <div className="mt-2.5 space-y-2 animate-fade-in">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i < pwStrength
                          ? pwStrength === 1 ? '#ff4757' : pwStrength === 2 ? '#ffa502' : '#2ed573'
                          : 'rgba(255,255,255,0.1)'
                      }} />
                  ))}
                </div>
                <div className="space-y-1">
                  {requirements.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <CheckCircle size={12} className={r.test(form.password) ? 'text-mint-400' : 'text-white/20'} />
                      <span className={`text-xs ${r.test(form.password) ? 'text-white/60' : 'text-white/25'}`}>{r.label}</span>
                    </div>
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
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating club...</>
            ) : 'Create club account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-400 hover:text-ink-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
