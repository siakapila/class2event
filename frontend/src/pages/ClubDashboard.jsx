import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format, isPast, isToday } from 'date-fns'
import {
  Plus, Calendar, MapPin, Clock, Users, LogOut,
  Zap, Search, Trash2, Edit3, ChevronRight, AlertTriangle
} from 'lucide-react'

export default function ClubDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events')
      setEvents(res.data.events)
    } catch (err) {
      console.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/api/events/${id}`)
      setEvents(ev => ev.filter(e => e.id !== id))
      setShowDeleteModal(null)
    } catch (err) {
      console.error('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  )

  const upcoming = filtered.filter(e => !isPast(new Date(e.date)) || isToday(new Date(e.date)))
  const past = filtered.filter(e => isPast(new Date(e.date)) && !isToday(new Date(e.date)))

  const fmtDuration = (mins) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60), m = mins % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }

  const statusTag = (date) => {
    const d = new Date(date)
    if (isToday(d)) return { label: 'Today', color: 'bg-mint-400/15 text-mint-400' }
    if (isPast(d)) return { label: 'Past', color: 'bg-white/8 text-white/30' }
    return { label: 'Upcoming', color: 'bg-ink-500/20 text-ink-300' }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d1a' }}>
      {/* Fixed background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 rounded-full"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0.4) 40%,, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">class2event</span>
              <div className="text-white/30 text-xs leading-none">{user?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/events/new" className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
              <Plus size={15} />
              <span className="hidden sm:inline">New Event</span>
            </Link>
            <button onClick={handleLogout}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-up">
          {[
            { label: 'Total Events', value: events.length, icon: Calendar },
            { label: 'Upcoming', value: upcoming.length, icon: ChevronRight },
            { label: 'Past Events', value: past.length, icon: Clock },
            { label: 'Teams', value: events.reduce((a, e) => a + new Set(e.teams?.map(t => t.teamName)).size, 0), icon: Users },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={label} className={`card stagger-${i + 1} animate-fade-up opacity-0`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs font-medium">{label}</span>
                <Icon size={14} className="text-ink-400" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <Calendar size={40} className="text-white/15 mx-auto mb-4" />
            <h3 className="text-white/60 font-medium mb-1">
              {search ? 'No events match your search' : 'No events yet'}
            </h3>
            <p className="text-white/30 text-sm mb-6">
              {!search && 'Create your first event to get started'}
            </p>
            {!search && (
              <Link to="/events/new" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus size={15} /> Create first event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
                <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Upcoming</h2>
                <div className="grid gap-3">
                  {upcoming.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i}
                      onDelete={() => setShowDeleteModal(event)}
                      fmtDuration={fmtDuration} statusTag={statusTag} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Past Events</h2>
                <div className="grid gap-3 opacity-70">
                  {past.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i}
                      onDelete={() => setShowDeleteModal(event)}
                      fmtDuration={fmtDuration} statusTag={statusTag} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowDeleteModal(null)}>
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
              You're about to delete <span className="text-white font-medium">"{showDeleteModal.name}"</span> and all its team data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                disabled={deletingId === showDeleteModal.id}
                className="flex-1 py-2.5 px-4 bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, index, onDelete, fmtDuration, statusTag }) {
  const navigate = useNavigate()
  const st = statusTag(event.date)
  const teamCount = new Set(event.teams?.map(t => t.teamName)).size
  const memberCount = event.teams?.length || 0

  return (
    <div
      className="card cursor-pointer group hover:border-ink-500/30 hover:bg-white/6 animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/events/${event.id}`)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`tag ${st.color}`}>{st.label}</span>
            {event.teams?.some(t => t.role === 'organizer') && (
              <span className="tag bg-amber-400/15 text-amber-400">Has organizer</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-base group-hover:text-ink-300 transition-colors truncate">{event.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5 text-white/40 text-xs">
              <MapPin size={11} />{event.venue}
            </span>
            <span className="flex items-center gap-1.5 text-white/40 text-xs">
              <Calendar size={11} />{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
            </span>
            <span className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock size={11} />{fmtDuration(event.duration)}
            </span>
            {memberCount > 0 && (
              <span className="flex items-center gap-1.5 text-white/40 text-xs">
                <Users size={11} />{memberCount} member{memberCount !== 1 ? 's' : ''} · {teamCount} team{teamCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => navigate(`/events/${event.id}/edit`)}
            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-all">
            <Edit3 size={14} />
          </button>
          <button onClick={onDelete}
            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
