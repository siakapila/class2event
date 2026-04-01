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
    if (isToday(d)) return { label: 'Today', color: 'bg-green-100 text-green-300' }
    if (isPast(d)) return { label: 'Past', color: 'bg-white/10 text-white/60' }
    return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#FFB800]/20 transform rotate-3">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-black text-lg">class2event</span>
              <div className="text-white/60 font-bold text-xs leading-none mt-0.5">{user?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/events/new" className="btn-primary flex items-center gap-1.5 !py-2.5 !px-5 text-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">New Event</span>
            </Link>
            <button onClick={handleLogout}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/10 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fade-up">
          {[
            { label: 'Total Events', value: events.length, icon: Calendar },
            { label: 'Upcoming', value: upcoming.length, icon: ChevronRight },
            { label: 'Past Events', value: past.length, icon: Clock },
            { label: 'Teams', value: events.reduce((a, e) => a + new Set(e.teams?.map(t => t.teamName)).size, 0), icon: Users },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={label} className={`card stagger-${i + 1} opacity-0`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm font-bold uppercase tracking-wide">{label}</span>
                <div className="p-2 bg-transparent rounded-lg text-white/40">
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-4xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12 max-w-md shadow-sm border-2 border-white/10/60"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in card border-dashed border-2 border-white/10 shadow-none bg-transparent">
            <Calendar size={48} className="text-white/30 mx-auto mb-5" />
            <h3 className="text-white/90 font-black text-xl mb-2">
              {search ? 'No events match your search' : 'No events yet'}
            </h3>
            <p className="text-white/60 font-semibold mb-8">
              {!search && 'Create your first event to get started'}
            </p>
            {!search && (
              <Link to="/events/new" className="btn-primary inline-flex items-center gap-2 text-base">
                <Plus size={18} /> Create First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
                <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-5 ml-2">Upcoming Events</h2>
                <div className="grid gap-4">
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
                <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-5 ml-2">Past Events</h2>
                <div className="grid gap-4 opacity-80">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(null)}>
          <div className="bg-white/5 backdrop-blur-md rounded-[32px] shadow-2xl p-8 max-w-sm w-full animate-fade-up border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-black text-xl">Delete Event?</h3>
                <p className="text-white/60 font-bold text-sm">Action cannot be undone</p>
              </div>
            </div>
            <p className="text-white/80 font-medium mb-8">
              You're about to delete <span className="text-white font-black">"{showDeleteModal.name}"</span> and all its team data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                disabled={deletingId === showDeleteModal.id}
                className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50">
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
      className="card group hover:border-blue-500/30 cursor-pointer p-6 animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/events/${event.id}`)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`tag ${st.color}`}>{st.label}</span>
            {event.teams?.some(t => t.role === 'organizer') && (
              <span className="tag bg-amber-100 text-amber-700">Has Organizer</span>
            )}
          </div>
          <h3 className="text-white font-black text-xl group-hover:text-blue-400 transition-colors truncate">{event.name}</h3>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
            <span className="flex items-center gap-2 text-white/60 font-semibold text-sm">
              <MapPin size={14} className="text-white/40" />{event.venue}
            </span>
            <span className="flex items-center gap-2 text-white/60 font-semibold text-sm">
              <Calendar size={14} className="text-white/40" />{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
            </span>
            <span className="flex items-center gap-2 text-white/60 font-semibold text-sm">
              <Clock size={14} className="text-white/40" />{fmtDuration(event.duration)}
            </span>
            {memberCount > 0 && (
              <span className="flex items-center gap-2 text-white/60 font-semibold text-sm">
                <Users size={14} className="text-white/40" />{memberCount} member{memberCount !== 1 ? 's' : ''} · {teamCount} team{teamCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => navigate(`/events/${event.id}/edit`)}
            className="p-2.5 rounded-xl text-white/40 hover:text-blue-400 hover:bg-blue-500/20 transition-all">
            <Edit3 size={18} />
          </button>
          <button onClick={onDelete}
            className="p-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
