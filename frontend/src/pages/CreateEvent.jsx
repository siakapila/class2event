import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import {
  ArrowLeft, Plus, Trash2, UserPlus, Users, Crown,
  Calendar, MapPin, Clock, FileText, Save, Zap
} from 'lucide-react'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', venue: '', date: '', time: '', duration: 60, description: ''
  })
  
  const [organizers, setOrganizers] = useState(['']) // Array of emails
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isEdit) loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const res = await api.get(`/api/events/${id}`)
      const ev = res.data.event
      const d = new Date(ev.date)
      setForm({
        name: ev.name,
        venue: ev.venue,
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5),
        duration: ev.duration,
        description: ev.description || ''
      })
      
      const orgs = ev.organizers.map(o => o.student.email)
      setOrganizers(orgs.length ? orgs : [''])
    } catch {
      navigate('/dashboard')
    } finally {
      setFetching(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.duration || form.duration < 1) e.duration = 'Duration must be at least 1 minute'
    if (form.duration > 1440) e.duration = 'Duration cannot exceed 1440 minutes (24h)'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const validOrgs = organizers.filter(email => email.trim() !== '')

    const payload = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      date: new Date(`${form.date}T${form.time}`).toISOString(),
      duration: parseInt(form.duration),
      description: form.description.trim() || null,
      organizers: validOrgs
    }

    try {
      if (isEdit) {
        await api.put(`/api/events/${id}`, payload)
      } else {
        await api.post('/api/events', payload)
      }
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save event. Make sure all organizer emails correspond to registered students.')
    } finally {
      setLoading(false)
    }
  }

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  // Organizer management
  const addOrganizer = () => setOrganizers(o => [...o, ''])
  const removeOrganizer = (i) => setOrganizers(o => o.filter((_, idx) => idx !== i))
  const setOrganizer = (i, val) => setOrganizers(o => o.map((email, idx) => idx === i ? val : email))

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d1a' }}>
      <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-ink-500 rounded-lg flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="text-white font-semibold">{isEdit ? 'Edit Event' : 'New Event'}</span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Save size={14} />
            {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {apiError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card animate-fade-up">
            <div className="flex items-center gap-2.5 mb-5">
              <Calendar size={16} className="text-ink-400" />
              <h2 className="text-white font-semibold">Event Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Event name *</label>
                <input type="text" placeholder="e.g. Annual Tech Fest 2025"
                  value={form.name} onChange={setField('name')}
                  className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  <span className="flex items-center gap-1.5"><MapPin size={12} />Venue *</span>
                </label>
                <input type="text" placeholder="e.g. Main Auditorium, Block A"
                  value={form.venue} onChange={setField('venue')}
                  className={`input-field ${errors.venue ? 'border-red-500/50' : ''}`} />
                {errors.venue && <p className="text-red-400 text-xs mt-1">{errors.venue}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={setField('date')}
                    className={`input-field ${errors.date ? 'border-red-500/50' : ''}`}
                    style={{ colorScheme: 'dark' }} />
                  {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Time *</label>
                  <input type="time" value={form.time} onChange={setField('time')}
                    className={`input-field ${errors.time ? 'border-red-500/50' : ''}`}
                    style={{ colorScheme: 'dark' }} />
                  {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">
                    <span className="flex items-center gap-1"><Clock size={12} />Duration (min) *</span>
                  </label>
                  <input type="number" min="1" max="1440" placeholder="60"
                    value={form.duration} onChange={setField('duration')}
                    className={`input-field ${errors.duration ? 'border-red-500/50' : ''}`} />
                  {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  <span className="flex items-center gap-1.5"><FileText size={12} />Description</span>
                </label>
                <textarea rows={3} placeholder="Brief description of the event..."
                  value={form.description} onChange={setField('description')}
                  className="input-field resize-none" />
              </div>
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Crown size={16} className="text-ink-400" />
                <h2 className="text-white font-semibold">Organizing Committee</h2>
              </div>
              <button type="button" onClick={addOrganizer}
                className="flex items-center gap-1.5 text-ink-400 hover:text-ink-300 text-sm font-medium transition-colors">
                <Plus size={14} />Add organizer
              </button>
            </div>

            <p className="text-white/40 text-sm mb-4">Enter the college email addresses of the students organizing this event.</p>

            <div className="space-y-3">
              {organizers.map((email, i) => (
                <div key={i} className="flex items-center gap-3 animate-slide-in">
                  <input
                    type="email"
                    placeholder="student@muj.manipal.edu"
                    value={email}
                    onChange={e => setOrganizer(i, e.target.value)}
                    className="input-field flex-1"
                  />
                  {organizers.length > 1 && (
                    <button type="button" onClick={() => removeOrganizer(i)}
                      className="p-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
