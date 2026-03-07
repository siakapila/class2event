import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { format } from 'date-fns'
import { ArrowLeft, Users, Zap, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function RegisterEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  
  const [teamName, setTeamName] = useState('')
  const [emails, setEmails] = useState(['']) // Only additional teammates. Current student is auto-included in backend.
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // We can fetch single event from generic /api/events/:id but maybe clubs only?
    // Wait, the backend doesn't have a public GET /events/:id endpoint open to students except /api/student/events
    const fetchEvent = async () => {
      try {
        const res = await api.get('/api/student/events')
        const ev = res.data.events.find(e => e.id === id)
        if (ev) setEvent(ev)
        else navigate('/events')
      } catch {
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const validate = () => {
    // If it's a team event, team name is optional but good.
    // Ensure emails are somewhat valid format if provided.
    // They can be blank. Filter blanks.
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSubmitting(true)
    
    // Filters out blank emails
    const members = emails.filter(m => m.trim().length > 0)
    
    try {
      await api.post(`/api/student/events/${id}/register`, {
        teamName: teamName.trim() || undefined,
        members
      })
      setSuccess(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const addEmail = () => setEmails(e => [...e, ''])
  const removeEmail = (i) => setEmails(e => e.filter((_, idx) => idx !== i))
  const updateEmail = (i, val) => setEmails(e => e.map((str, idx) => idx === i ? val : str))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d1a' }}>
      <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d1a' }}>
       <div className="max-w-md w-full card text-center p-10 animate-fade-up">
        <CheckCircle2 size={48} className="text-mint-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
        <p className="text-white/50 mb-8">Your registration is now pending club verification.</p>
        <Link to="/dashboard" className="btn-primary inline-flex justify-center w-full py-3">Return to Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative" style={{ background: '#0d0d1a' }}>
      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button onClick={() => navigate('/events')}
            className="p-2 mr-3 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
             <span className="text-white font-semibold text-sm truncate">Register for {event?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {apiError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        <div className="card mb-8 animate-fade-up">
          <h2 className="text-xl font-bold text-white mb-2">{event?.name}</h2>
          <p className="text-white/50 text-sm">{event?.club?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Registration Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Team Name (Optional)</label>
                <input type="text" placeholder="e.g. Code Ninjas"
                  value={teamName} onChange={e => setTeamName(e.target.value)}
                  className="input-field" />
                <p className="text-xs text-white/30 mt-1.5">Only required if registering a group.</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-white/60">Teammates (College Emails)</label>
                  <button type="button" onClick={addEmail}
                    className="flex items-center gap-1.5 text-ink-400 hover:text-ink-300 text-xs font-medium transition-colors">
                    <Plus size={13} />Add Teammate
                  </button>
                </div>
                
                <div className="space-y-3">
                  {emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 animate-slide-in">
                      <input
                        type="email"
                        placeholder="teammate@muj.manipal.edu"
                        value={email}
                        onChange={e => updateEmail(i, e.target.value)}
                        className="input-field flex-1 text-sm py-2.5"
                      />
                      <button type="button" onClick={() => removeEmail(i)}
                        className="p-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-3">You don't need to add your own email, we'll include you automatically. Your teammates must already have accounts on Class2Event.</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex justify-center mt-6 text-sm font-semibold">
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </main>
    </div>
  )
}
