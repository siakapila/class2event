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
              <div className="text-white/60 font-bold text-xs leading-none mt-0.5">{user?.name} (Faculty)</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="p-2.5 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/10 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-black text-white mb-2">Faculty Tracking</h1>
          <p className="text-white/60 font-semibold text-lg">View verified participants and organizers for valid absence tracking.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search events or clubs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-12 w-full shadow-sm border-2 border-white/10/60"
            />
          </div>
          <div className="flex gap-5 items-center pl-2">
            <div className="flex items-center gap-2 whitespace-nowrap bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-white/10">
              <Circle size={12} className="text-green-500 fill-green-500" />
              <span className="text-sm font-bold text-white/90">Participant</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-white/10">
              <Circle size={12} className="text-amber-300 fill-amber-500" />
              <span className="text-sm font-bold text-white/90">Organizer</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in card border-dashed border-2 border-white/10 shadow-none bg-transparent">
            <ShieldCheck size={48} className="text-white/30 mx-auto mb-5" />
            <h3 className="text-white/90 font-black text-xl mb-2">No verified events available</h3>
            <p className="text-white/60 font-semibold mb-8 max-w-sm mx-auto">Clubs need to verify student registrations before they securely appear here.</p>
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
                <div key={event.id} className={`card p-0 overflow-hidden animate-fade-up border-2 transition-colors ${isExpanded ? 'border-[#FFB800]/50 shadow-2xl shadow-amber-900/10' : 'border-transparent'}`} style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : event.id)}
                    className="w-full text-left p-6 sm:p-8 flex items-start sm:items-center justify-between hover:bg-transparent/50 transition-colors group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">{event.club.name}</span>
                        <span className="text-white/60 font-bold text-xs flex items-center gap-1.5">
                          <Calendar size={13} className="text-white/40" /> {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-white font-black text-2xl leading-tight group-hover:text-amber-300 transition-colors mb-4">{event.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-bold text-green-300 bg-green-100 px-3 py-1.5 rounded-lg">{pCount} Participants</span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">{oCount} Organizers</span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all ${isExpanded ? 'bg-amber-100 text-amber-400' : 'bg-white/10 text-white/60 group-hover:bg-white/20'}`}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t-2 border-white/10 bg-transparent/50 hover:bg-transparent p-6 sm:p-8 animate-slide-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h4 className="text-sm font-black text-white/40 uppercase tracking-widest">Verified Student Roster</h4>
                        <button onClick={() => downloadCSV(event)}
                          className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-white bg-amber-100 hover:bg-amber-500 px-5 py-2.5 rounded-xl transition-all shadow-sm">
                          <ArrowDownToLine size={16} /> Export CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-transparent/80 border-b border-white/10">
                            <tr>
                              <th className="py-4 px-5 font-bold text-white/60">Participant</th>
                              <th className="py-4 px-5 font-bold text-white/60">Reg No.</th>
                              <th className="py-4 px-5 font-bold text-white/60">Class/Sec</th>
                              <th className="py-4 px-5 font-bold text-white/60 text-right">Role Indicator</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {event.organizers.map(o => (
                              <tr key={o.id} className="hover:bg-transparent/50 transition-colors">
                                <td className="py-4 px-5 text-white font-bold">{o.student.name}</td>
                                <td className="py-4 px-5 text-white/60 font-mono text-xs font-medium">{o.student.registrationNo}</td>
                                <td className="py-4 px-5 text-white/80 font-medium">{o.student.className} <span className="text-white/40">(Yr {o.student.year})</span></td>
                                <td className="py-4 px-5 text-right">
                                  <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30/60 px-3 py-1.5 rounded-xl">
                                    <Circle size={10} className="text-amber-300 fill-amber-500" />
                                    <span className="text-xs text-amber-700 font-black uppercase tracking-wider">Organizer</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {event.registrations.map(r => r.members.map(m => (
                              <tr key={m.id} className="hover:bg-transparent/50 transition-colors">
                                <td className="py-4 px-5 text-white font-bold">{m.student.name}</td>
                                <td className="py-4 px-5 text-white/60 font-mono text-xs font-medium">{m.student.registrationNo}</td>
                                <td className="py-4 px-5 text-white/80 font-medium">{m.student.className} <span className="text-white/40">(Yr {m.student.year})</span></td>
                                <td className="py-4 px-5 text-right">
                                  <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30/60 px-3 py-1.5 rounded-xl">
                                    <Circle size={10} className="text-green-500 fill-green-500" />
                                    <span className="text-xs text-green-300 font-black uppercase tracking-wider">Participant</span>
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
