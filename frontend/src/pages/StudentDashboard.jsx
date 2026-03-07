import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  Calendar, MapPin, Clock, Users, LogOut,
  Zap, Search, ChevronRight, Crown, CheckCircle2, XCircle
} from 'lucide-react'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ registrations: [], organized: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/api/student/me')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const { registrations, organized } = data

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0d0d1a' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 rounded-full"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, rgba(99,102,241,0.4) 40%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      </div>

      <header className="sticky top-0 z-40 glass-strong border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">class2event</span>
              <div className="text-white/30 text-xs leading-none">{user?.name} (Student)</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/events" className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
              <Search size={15} />
              <span className="hidden sm:inline">Browse Events</span>
            </Link>
            <button onClick={handleLogout}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">My Overview</h1>
          <p className="text-white/50">Manage your event registrations and organizing duties.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {organized.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Crown size={16} className="text-amber-400" /> Events I'm Organizing
                </h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {organized.map((org) => (
                    <div key={org.id} className="card border-amber-500/20 bg-amber-500/5">
                      <div className="text-xs text-amber-500/70 font-semibold mb-1">{org.event.club.name}</div>
                      <h3 className="text-white font-semibold text-lg mb-2 truncate">{org.event.name}</h3>
                      <div className="flex items-center gap-1.5 text-white/40 text-sm">
                        <Calendar size={13} />{format(new Date(org.event.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-sm font-semibold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-ink-400" /> My Registrations
              </h2>
              {registrations.length === 0 ? (
                <div className="card text-center py-10 opacity-70">
                  <Calendar size={32} className="mx-auto text-white/20 mb-3" />
                  <p className="text-white/50 mb-4">You haven't registered for any events yet.</p>
                  <Link to="/events" className="btn-primary inline-flex text-sm py-2 px-4">Browse coming events</Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {registrations.map(reg => (
                    <div key={reg.id} className={`card ${reg.status === 'VERIFIED' ? 'border-mint-500/30 bg-mint-500/5' : reg.status === 'REJECTED' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/50">{reg.event.club.name}</span>
                            <span className={`tag ${
                              reg.status === 'VERIFIED' ? 'bg-mint-500/20 text-mint-400' :
                              reg.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                              'bg-amber-500/20 text-amber-500'
                            }`}>{reg.status}</span>
                          </div>
                          <h3 className="text-white font-semibold text-lg">{reg.event.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-white/40 text-sm">
                              <Calendar size={13} />{format(new Date(reg.event.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-white/40 mb-1">Team Details</div>
                          <div className="text-sm text-white/70">
                            {reg.teamName ? <span className="font-medium text-white">{reg.teamName}: </span> : ''}
                            {reg.members.map((m, i) => (
                              <span key={m.id}>
                                {m.student.name}{i < reg.members.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
