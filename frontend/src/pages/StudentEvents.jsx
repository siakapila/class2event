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
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center">
          <button onClick={() => navigate('/dashboard')}
            className="p-2.5 mr-4 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all bg-transparent">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-md transform rotate-3">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white font-black text-lg">class2event</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-black text-white mb-2">Upcoming Events</h1>
          <p className="text-white/60 font-semibold text-lg">Discover and register for upcoming club events.</p>
        </div>

        <div className="relative mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by event or club name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12 max-w-md shadow-sm border-2 border-white/10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in card bg-transparent border-dashed border-2 border-white/10 shadow-none max-w-2xl mx-auto">
            <Calendar size={48} className="text-white/30 mx-auto mb-4" />
            <h3 className="text-white/90 font-black text-2xl mb-2">No upcoming events found</h3>
            <p className="text-white/60 font-semibold">We couldn't find anything matching your search query.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => (
              <div key={event.id} className="card group hover:border-[#FFB800]/60 hover:-translate-y-1 animate-fade-up opacity-0 flex flex-col p-6 border-2 border-white/10 transition-all shadow-sm"
                style={{ animationDelay: `${i * 0.05 + 0.1}s` }}>
                <div className="mb-5">
                  <div className="text-xs text-amber-400 font-bold mb-2 uppercase tracking-widest">{event.club.name}</div>
                  <h3 className="text-white font-black text-2xl group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">{event.name}</h3>
                </div>
                
                <div className="mt-auto space-y-3 mb-8">
                  <span className="flex items-center gap-3 text-white/80 font-semibold text-sm">
                    <Calendar size={16} className="text-white/40" /> {format(new Date(event.date), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-3 text-white/80 font-semibold text-sm">
                    <Clock size={16} className="text-white/40" /> {format(new Date(event.date), 'h:mm a')} <span className="text-white/40 font-bold text-xs ml-1">• {fmtDuration(event.duration)}</span>
                  </span>
                  <span className="flex items-center gap-3 text-white/80 font-semibold text-sm">
                    <MapPin size={16} className="text-white/40" /> {event.venue}
                  </span>
                </div>
                
                <Link to={`/events/${event.id}/register`} className="btn-primary w-full text-center !py-3.5 text-base bg-slate-900 hover:bg-[#FFB800] hover:text-white transition-colors duration-300">
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
