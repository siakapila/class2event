import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  Calendar, Search, ChevronRight, Crown, CheckCircle2,
  Zap, LogOut
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
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#FFB800]/20 transform -rotate-3">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-black text-lg">class2event</span>
              <div className="text-white/60 font-bold text-xs leading-none mt-0.5">{user?.name} (Student)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/events" className="btn-primary flex items-center gap-1.5 !py-2.5 !px-5 text-sm bg-[#FFB800] hover:bg-yellow-500 shadow-yellow-500/20 text-white">
              <Search size={18} />
              <span className="hidden sm:inline">Browse Events</span>
            </Link>
            <button onClick={handleLogout}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/10 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-black text-white mb-2">My Overview</h1>
          <p className="text-white/60 font-semibold text-lg">Manage your event registrations and organizing duties.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {organized.length > 0 && (
              <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-5 ml-2 flex items-center gap-2">
                  <Crown size={18} className="text-[#FFB800]" /> Events I'm Organizing
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {organized.map((org) => (
                    <div key={org.id} className="card border-2 border-amber-500/30 bg-amber-500/20/50 hover:bg-amber-500/20 hover:-translate-y-1 transition-all">
                      <div className="text-xs text-amber-400 font-bold mb-1 uppercase tracking-wider">{org.event.club.name}</div>
                      <h3 className="text-white font-black text-xl mb-3 truncate">{org.event.name}</h3>
                      <div className="flex items-center gap-2 text-white/60 font-bold text-sm">
                        <Calendar size={14} className="text-amber-300" />{format(new Date(org.event.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-5 ml-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-400" /> My Registrations
              </h2>
              {registrations.length === 0 ? (
                <div className="card text-center py-20 border-dashed border-2 border-white/10 shadow-none bg-transparent">
                  <Calendar size={48} className="mx-auto text-white/30 mb-4" />
                  <p className="text-white/60 font-bold text-lg mb-6">You haven't registered for any upcoming events yet.</p>
                  <Link to="/events" className="btn-primary inline-flex items-center text-base !py-3 !px-6 bg-[#FFB800] hover:bg-yellow-500 text-white shadow-yellow-500/20">
                    Browse coming events
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {registrations.map(reg => (
                    <div key={reg.id} className={`card border-2 ${
                      reg.status === 'VERIFIED' ? 'border-green-500/30 bg-green-500/20/30' : 
                      reg.status === 'REJECTED' ? 'border-red-500/30 bg-red-500/20/30' : 
                      'border-white/10 hover:border-white/10'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{reg.event.club.name}</span>
                            <span className={`tag ${
                              reg.status === 'VERIFIED' ? 'bg-green-100 text-green-300' :
                              reg.status === 'REJECTED' ? 'bg-red-100 text-red-300' :
                              'bg-amber-100 text-amber-700'
                            }`}>{reg.status}</span>
                          </div>
                          <h3 className="text-white font-black text-2xl">{reg.event.name}</h3>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-2 text-white/60 font-bold text-sm">
                              <Calendar size={14} className="text-white/40" />{format(new Date(reg.event.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right bg-transparent sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                          <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Team Roster</div>
                          <div className="text-sm font-bold text-white/80 leading-relaxed">
                            {reg.teamName ? <span className="text-white block mb-1">{reg.teamName}</span> : ''}
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
