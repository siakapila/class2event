import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format, isPast, isToday } from 'date-fns'
import {
  Calendar, MapPin, Clock, ArrowLeft, LogOut, Zap, Search
} from 'lucide-react'

export default function StudentEvents() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/student/events')
      setEvents(res.data.events.filter(e => !isPast(new Date(e.date)) || isToday(new Date(e.date))))
    } catch (err) {
      console.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.club.name.toLowerCase().includes(search.toLowerCase())
  )

  const fmtDuration = (mins) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60), m = mins % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d1a' }}>
      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 mr-3 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">class2event</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">Upcoming Events</h1>
          <p className="text-white/50">Discover and register for upcoming club events.</p>
        </div>

        <div className="relative mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by event or club name..."
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
          <div className="text-center py-20 animate-fade-in opacity-50">
            <Calendar size={40} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 font-medium mb-1">No upcoming events found</h3>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => (
              <div key={event.id} className="card group hover:border-ink-500/30 hover:bg-white/6 animate-fade-up opacity-0 flex flex-col"
                style={{ animationDelay: `${i * 0.05 + 0.1}s` }}>
                <div className="mb-4">
                  <div className="text-xs text-ink-400 font-semibold mb-1 uppercase tracking-wider">{event.club.name}</div>
                  <h3 className="text-white font-semibold text-lg group-hover:text-ink-300 transition-colors line-clamp-2">{event.name}</h3>
                </div>
                
                <div className="mt-auto space-y-2 mb-6">
                  <span className="flex items-center gap-2 text-white/50 text-sm">
                    <Calendar size={14} className="text-white/30" /> {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                  </span>
                  <span className="flex items-center gap-2 text-white/50 text-sm">
                    <MapPin size={14} className="text-white/30" /> {event.venue}
                  </span>
                  <span className="flex items-center gap-2 text-white/50 text-sm">
                    <Clock size={14} className="text-white/30" /> {fmtDuration(event.duration)}
                  </span>
                </div>
                
                <Link to={`/events/${event.id}/register`} className="btn-primary w-full text-center py-2.5 text-sm">
                  Register Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
