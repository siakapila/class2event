import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Eye, EyeOff, Mail, Lock, Users, Hash, UserSquare2, CalendarDays, ArrowLeft, RefreshCw } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'student'

  useEffect(() => {
    if (!['student', 'club', 'teacher'].includes(role)) navigate('/role-selection')
  }, [role, navigate])

  const { login } = useAuth()
  
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    registrationNo: '', department: '', section: '', year: ''
  })
  
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
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
      if (!form.registrationNo.trim()) e.registrationNo = 'Registration required'
      if (!form.department) e.department = 'Department required'
      if (!form.section) e.section = 'Section required'
      if (!form.year) e.year = 'Year required'
    }

    return e
  }

  const handleInitiate = async (e) => {
    e.preventDefault()
    setApiError('')
    setApiSuccess('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    
    try {
      let payload = { role, email: form.email, password: form.password }
      if (role === 'club') {
        payload.clubName = form.name.trim()
      } else if (role === 'student') {
        payload.name = form.name.trim()
        payload.registrationNo = form.registrationNo.trim()
        payload.department = form.department
        payload.section = form.section
        payload.year = form.year
      } else if (role === 'teacher') {
        payload.name = form.name.trim()
      }

      await api.post('/api/auth/signup/initiate', payload)
      setStep(2)
      setApiSuccess('OTP has been sent to your email.')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setApiError('')
    setApiSuccess('')
    
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/signup/verify', { email: form.email, otp })
      
      // Auto login on successful verification
      await login(role, form.email, form.password, false)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Verification failed. Please check your OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setApiError('')
    setApiSuccess('')
    setLoading(true)
    try {
      await api.post('/api/auth/signup/resend', { email: form.email })
      setApiSuccess('A new OTP has been sent to your email.')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
    setApiError('')
    setApiSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-transparent">
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-between items-center px-10">
        <div className="w-[600px] h-[600px] rounded-full bg-white/5 backdrop-blur-md opacity-[0.05] blur-[80px]" />
      </div>

      <div className="w-full max-w-lg card relative z-10 animate-fade-up my-auto">
        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <Link to="/role-selection" className="inline-block text-white/40 font-bold text-sm hover:text-white transition-colors mb-2">&larr; Change Role</Link>
              <h2 className="text-3xl font-black text-white mb-2 capitalize">Create {role} Account</h2>
              <p className="text-white/60 font-bold text-sm">Join using your {getDomainDesc()} account</p>
            </div>

            {apiError && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-bold text-sm animate-fade-in">
                {apiError}
              </div>
            )}

            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  {role === 'club' ? 'Club Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder={role === 'club' ? "e.g. Code Club" : "e.g. John Doe"}
                    value={form.name}
                    onChange={set('name')}
                    className={`input-field pl-11 !py-3.5 ${errors.name ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 font-bold text-xs mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Email address</label>
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

              {role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Registration No</label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="e.g. 2109..."
                        value={form.registrationNo}
                        onChange={set('registrationNo')}
                        className={`input-field pl-11 !py-3.5 ${errors.registrationNo ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                      />
                    </div>
                    {errors.registrationNo && <p className="text-red-500 font-bold text-xs mt-2">{errors.registrationNo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Year</label>
                    <div className="relative">
                      <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={form.year}
                        onChange={set('year')}
                        className={`input-field pl-11 !py-3.5 ${errors.year ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                      >
                        <option value="" className="bg-slate-900">Select Year</option>
                        {[1,2,3,4,5].map(y => <option key={y} value={y} className="bg-slate-900">Year {y}</option>)}
                      </select>
                    </div>
                    {errors.year && <p className="text-red-500 font-bold text-xs mt-2">{errors.year}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Department</label>
                    <div className="relative">
                      <UserSquare2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={form.department}
                        onChange={set('department')}
                        className={`input-field pl-11 !py-3.5 ${errors.department ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                      >
                        <option value="" className="bg-slate-900">Select...</option>
                        {['CSE', 'IT', 'AIML', 'CCE', 'DSE', 'DS', 'MECH', 'EEE'].map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                      </select>
                    </div>
                    {errors.department && <p className="text-red-500 font-bold text-xs mt-2">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Section</label>
                    <div className="relative">
                      <UserSquare2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={form.section}
                        onChange={set('section')}
                        className={`input-field pl-11 !py-3.5 ${errors.section ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                      >
                        <option value="" className="bg-slate-900">Select...</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    </div>
                    {errors.section && <p className="text-red-500 font-bold text-xs mt-2">{errors.section}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Create password"
                      value={form.password}
                      onChange={set('password')}
                      onFocus={() => setPwFocused(true)}
                      onBlur={() => setPwFocused(false)}
                      className={`input-field pl-11 pr-11 !py-3.5 flex-1 ${errors.password ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                  </div>
                  
                  {(pwFocused || form.password) && (
                    <div className="mt-2.5 flex gap-1 animate-fade-in">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                          style={{ background: i < pwStrength ? (pwStrength === 1 ? '#ff4757' : pwStrength === 2 ? '#ffa502' : '#2ed573') : '#e2e8f0' }} />
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 font-bold text-xs mt-2">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Confirm It</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Repeat securely"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      className={`input-field pl-11 pr-11 !py-3.5 ${errors.confirmPassword ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 font-bold text-xs mt-2">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 !py-4 text-lg">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Continue'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-bold text-white/60">
              Already have an account?{' '}
              <Link to={`/login?role=${role}`} className="text-blue-400 hover:text-blue-800 transition-colors">
                Sign in here
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <button 
                onClick={() => setStep(1)} 
                className="inline-flex items-center gap-1 text-white/40 font-bold text-sm hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={16} /> Back to details
              </button>
              <h2 className="text-3xl font-black text-white mb-2">Verify Your Email</h2>
              <p className="text-white/60 font-bold text-sm">
                We've sent a 6-digit code to <span className="text-white">{form.email}</span>
              </p>
            </div>

            {apiError && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-bold text-sm animate-fade-in">
                {apiError}
              </div>
            )}
            {apiSuccess && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/20 border-2 border-green-500/30 text-green-400 font-bold text-sm animate-fade-in">
                {apiSuccess}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2 text-center">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\\D/g, ''))
                    setErrors({})
                    setApiError('')
                    setApiSuccess('')
                  }}
                  className={`input-field text-center text-2xl tracking-[0.5em] font-mono !py-4 ${errors.otp ? 'border-red-300 bg-red-500/20 focus:border-red-500 focus:ring-red-200' : ''}`}
                />
                {errors.otp && <p className="text-red-500 font-bold text-xs mt-2 text-center">{errors.otp}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-4 text-lg">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-white/60 mb-3">Didn't receive the code?</p>
              <button 
                onClick={handleResend}
                disabled={loading}
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-bold text-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
