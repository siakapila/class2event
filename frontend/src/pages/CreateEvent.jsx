import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import {
  ArrowLeft, Plus, Trash2, UserPlus, Users, Crown,
  Calendar, MapPin, Clock, FileText, Save, Zap
} from 'lucide-react'

const emptyMember = () => ({ teamName: '', memberName: '', role: 'member', _id: Date.now() + Math.random() })
const emptyTeam = (name = '') => ({ name, members: [emptyMember()] })

export default function CreateEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', venue: '', date: '', time: '', duration: 60, description: ''
  })
  const [teams, setTeams] = useState([emptyTeam()])
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
      // Reconstruct teams from flat team_members
      const grouped = {}
      ev.teams.forEach(t => {
        if (!grouped[t.teamName]) grouped[t.teamName] = { name: t.teamName, members: [] }
        grouped[t.teamName].members.push({ ...t, _id: t.id })
      })
      const teamArr = Object.values(grouped)
      setTeams(teamArr.length ? teamArr : [emptyTeam()])
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

    // Flatten teams to team_members array
    const teamMembers = teams.flatMap(team =>
      team.members
        .filter(m => m.memberName?.trim() && team.name?.trim())
        .map(m => ({
          teamName: team.name.trim(),
          memberName: m.memberName.trim(),
          role: m.role || 'member'
        }))
    )

    const payload = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      date: new Date(`${form.date}T${form.time}`).toISOString(),
      duration: parseInt(form.duration),
      description: form.description.trim() || null,
      teams: teamMembers
    }

    try {
      if (isEdit) {
        await api.put(`/api/events/${id}`, payload)
      } else {
        await api.post('/api/events', payload)
      }
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  // Team management
  const addTeam = () => setTeams(ts => [...ts, emptyTeam()])
  const removeTeam = (i) => setTeams(ts => ts.filter((_, idx) => idx !== i))
  const setTeamName = (i, val) => setTeams(ts => ts.map((t, idx) => idx === i ? { ...t, name: val } : t))

  const addMember = (ti) => setTeams(ts => ts.map((t, idx) =>
    idx === ti ? { ...t, members: [...t.members, emptyMember()] } : t
  ))
  const removeMember = (ti, mi) => setTeams(ts => ts.map((t, idx) =>
    idx === ti ? { ...t, members: t.members.filter((_, midx) => midx !== mi) } : t
  ))
  const setMemberField = (ti, mi, k, val) => setTeams(ts => ts.map((t, idx) =>
    idx === ti ? {
      ...t,
      members: t.members.map((m, midx) => midx === mi ? { ...m, [k]: val } : m)
    } : t
  ))

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
          {/* Event details section */}
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

          {/* Teams section */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-ink-400" />
                <h2 className="text-white font-semibold">Participating Teams</h2>
                <span className="tag bg-ink-500/20 text-ink-300">{teams.length}</span>
              </div>
              <button type="button" onClick={addTeam}
                className="flex items-center gap-1.5 text-ink-400 hover:text-ink-300 text-sm font-medium transition-colors">
                <Plus size={14} />Add team
              </button>
            </div>

            <div className="space-y-4">
              {teams.map((team, ti) => (
                <div key={ti} className="card border-white/10 animate-slide-in">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      placeholder={`Team name (e.g. Team Alpha)`}
                      value={team.name}
                      onChange={e => setTeamName(ti, e.target.value)}
                      className="input-field flex-1 font-medium"
                    />
                    {teams.length > 1 && (
                      <button type="button" onClick={() => removeTeam(ti)}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {team.members.map((member, mi) => (
                      <div key={member._id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Member name"
                          value={member.memberName}
                          onChange={e => setMemberField(ti, mi, 'memberName', e.target.value)}
                          className="input-field flex-1 py-2.5 text-sm"
                        />
                        <select
                          value={member.role}
                          onChange={e => setMemberField(ti, mi, 'role', e.target.value)}
                          className="input-field py-2.5 text-sm w-36 flex-shrink-0"
                          style={{ colorScheme: 'dark' }}>
                          <option value="member">Member</option>
                          <option value="organizer">Organizer</option>
                        </select>
                        {team.members.length > 1 && (
                          <button type="button" onClick={() => removeMember(ti, mi)}
                            className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => addMember(ti)}
                    className="mt-3 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs font-medium transition-colors">
                    <UserPlus size={12} />Add member
                  </button>

                  {/* Organizer indicator */}
                  {team.members.some(m => m.role === 'organizer') && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-amber-400/70 text-xs">
                      <Crown size={11} />
                      {team.members.filter(m => m.role === 'organizer').map(m => m.memberName).filter(Boolean).join(', ') || 'Organizer assigned'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile submit */}
          <div className="sm:hidden pb-4">
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={15} />
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
