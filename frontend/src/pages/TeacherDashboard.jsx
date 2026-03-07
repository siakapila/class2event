import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  LogOut, Zap, Search, Calendar, ChevronDown, ChevronRight,
  ShieldCheck, AlertCircle, Circle, ArrowDownToLine
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/teacher/dashboard')
      setEvents(res.data.events)
    } catch (err) {
      console.error('Failed to fetch teacher events data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.club.name.toLowerCase().includes(search.toLowerCase())
  )

  const downloadCSV = (event) => {
    let csv = 'Name,Registration Number,Class,Year,Role\n'
    
    // Add Organizers
    event.organizers.forEach(o => {
      csv += `${o.student.name},${o.student.registrationNo},${o.student.className},${o.student.year},Organizer (Yellow)\n`
    })

    // Add Participants
    event.registrations.forEach(r => {
      r.members.forEach(m => {
        csv += `${m.student.name},${m.student.registrationNo},${m.student.className},${m.student.year},Participant (Green)\n`
      })
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.name.replace(/\s+/g, '_')}_Attendance.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d1a' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 rounded-full"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, rgba(245,158,11,0.2) 40%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      </div>

      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">class2event</span>
              <div className="text-white/30 text-xs leading-none">{user?.name} (Faculty)</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="p-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">Faculty Tracking</h1>
          <p className="text-white/50">View verified participants and organizers for valid absence tracking.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search events or clubs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex gap-4 items-center pl-2">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Circle size={10} className="text-mint-400 fill-mint-400" />
              <span className="text-xs text-white/50">Participant</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Circle size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-white/50">Organizer</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in opacity-50 card">
            <ShieldCheck size={40} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 font-medium mb-1">No verified events available</h3>
            <p className="text-white/30 text-sm">Clubs need to verify student registrations before they appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((event, i) => {
              const oCount = event.organizers.length
              const pCount = event.registrations.reduce((acc, r) => acc + r.members.length, 0)
              const total = oCount + pCount
              const isExpanded = expanded === event.id

              if (total === 0) return null

              return (
                <div key={event.id} className="card p-0 overflow-hidden animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : event.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between hover:bg-white/4 transition-colors group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-amber-500/80 uppercase tracking-widest">{event.club.name}</span>
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <Calendar size={11} /> {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-amber-400 transition-colors">{event.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-mint-400/80 font-medium">{pCount} Participants</span>
                        <span className="text-xs text-amber-400/80 font-medium">{oCount} Organizers</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white/40 flex-shrink-0">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 bg-black/20 p-4 sm:p-5 animate-slide-in">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-white/50">Verified Student Roster</h4>
                        <button onClick={() => downloadCSV(event)}
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-500/80 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors">
                          <ArrowDownToLine size={12} /> Export CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="text-xs text-white/30 uppercase tracking-wider border-b border-white/5">
                            <tr>
                              <th className="pb-3 px-2 font-medium">Participant</th>
                              <th className="pb-3 px-2 font-medium">Reg No.</th>
                              <th className="pb-3 px-2 font-medium">Class/Sec</th>
                              <th className="pb-3 px-2 font-medium text-right">Role Indicator</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {event.organizers.map(o => (
                              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 text-white font-medium">{o.student.name}</td>
                                <td className="py-3 px-2 text-white/50 font-mono text-xs">{o.student.registrationNo}</td>
                                <td className="py-3 px-2 text-white/50">{o.student.className} (Yr {o.student.year})</td>
                                <td className="py-3 px-2 text-right">
                                  <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
                                    <Circle size={8} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-amber-400 font-medium">Organizer</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {event.registrations.map(r => r.members.map(m => (
                              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 text-white font-medium">{m.student.name}</td>
                                <td className="py-3 px-2 text-white/50 font-mono text-xs">{m.student.registrationNo}</td>
                                <td className="py-3 px-2 text-white/50">{m.student.className} (Yr {m.student.year})</td>
                                <td className="py-3 px-2 text-right">
                                  <div className="inline-flex items-center gap-1.5 bg-mint-500/10 border border-mint-500/20 px-2 py-1 rounded-md">
                                    <Circle size={8} className="text-mint-400 fill-mint-400" />
                                    <span className="text-xs text-mint-400 font-medium">Participant</span>
                                  </div>
                                </td>
                              </tr>
                            )))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
