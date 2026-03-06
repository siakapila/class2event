import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Edit3,
  Trash2, Crown, Zap, AlertTriangle
} from 'lucide-react'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadEvent() }, [id])

  const loadEvent = async () => {
    try {
      const res = await api.get(`/api/events/${id}`)
      setEvent(res.data.event)
    } catch {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/events/${id}`)
      navigate('/dashboard')
    } catch {
      setDeleting(false)
    }
  }

  const fmtDuration = (mins) => {
    if (mins < 60) return `${mins} minutes`
    const h = Math.floor(mins / 60), m = mins % 60
    return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
  }

  // Group members by team
  const teamGroups = event ? (() => {
    const g = {}
    event.teams.forEach(t => {
      if (!g[t.teamName]) g[t.teamName] = []
      g[t.teamName].push(t)
    })
    return Object.entries(g)
  })() : []

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d1a' }}>
      <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!event) return null

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
              <span className="text-white font-semibold text-sm truncate max-w-[200px]">{event.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/events/${id}/edit`}
              className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-2 rounded-xl transition-all">
              <Edit3 size={13} />Edit
            </Link>
            <button onClick={() => setShowDelete(true)}
              className="p-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Event info card */}
        <div className="card animate-fade-up">
          <h1 className="text-2xl font-bold text-white mb-1">{event.name}</h1>
          {event.description && (
            <p className="text-white/50 text-sm mb-5 leading-relaxed">{event.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/4">
              <div className="w-8 h-8 rounded-lg bg-ink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={14} className="text-ink-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Date & Time</div>
                <div className="text-white text-sm font-medium">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-white/50 text-xs mt-0.5">
                  {format(new Date(event.date), 'h:mm a')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/4">
              <div className="w-8 h-8 rounded-lg bg-ink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-ink-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Venue</div>
                <div className="text-white text-sm font-medium">{event.venue}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/4">
              <div className="w-8 h-8 rounded-lg bg-ink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={14} className="text-ink-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Duration</div>
                <div className="text-white text-sm font-medium">{fmtDuration(event.duration)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/4">
              <div className="w-8 h-8 rounded-lg bg-ink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users size={14} className="text-ink-400" />
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Participants</div>
                <div className="text-white text-sm font-medium">
                  {event.teams.length} member{event.teams.length !== 1 ? 's' : ''} · {teamGroups.length} team{teamGroups.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams section */}
        {teamGroups.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
              Participating Teams
            </h2>
            <div className="space-y-3">
              {teamGroups.map(([teamName, members], i) => {
                const organizers = members.filter(m => m.role === 'organizer')
                const regular = members.filter(m => m.role !== 'organizer')

                return (
                  <div key={teamName} className="card animate-fade-up opacity-0"
                    style={{ animationDelay: `${i * 0.05 + 0.15}s` }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">{teamName}</h3>
                      <span className="tag bg-ink-500/15 text-ink-300 text-xs">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {organizers.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Organizers</div>
                        <div className="flex flex-wrap gap-2">
                          {organizers.map(m => (
                            <div key={m.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                              <Crown size={11} className="text-amber-400" />
                              <span className="text-amber-300 text-sm font-medium">{m.memberName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {regular.length > 0 && (
                      <div>
                        {organizers.length > 0 && <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Members</div>}
                        <div className="flex flex-wrap gap-2">
                          {regular.map(m => (
                            <div key={m.id}
                              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/60 text-sm">
                              {m.memberName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {teamGroups.length === 0 && (
          <div className="card text-center py-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <Users size={28} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No teams added yet</p>
            <Link to={`/events/${id}/edit`} className="inline-flex items-center gap-1.5 text-ink-400 hover:text-ink-300 text-sm font-medium mt-3 transition-colors">
              <Edit3 size={13} />Add teams
            </Link>
          </div>
        )}
      </main>

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowDelete(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-fade-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete event?</h3>
                <p className="text-white/40 text-xs">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-5">
              All team members and data for <span className="text-white font-medium">"{event.name}"</span> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
