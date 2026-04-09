import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Edit3,
  Trash2, Crown, Zap, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(null)

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

  const verifyRegistration = async (regId, status) => {
    setUpdating(regId)
    try {
      await api.put(`/api/events/${id}/registrations/${regId}`, { status })
      await loadEvent()
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  const fmtDuration = (mins) => {
    if (mins < 60) return `${mins} minutes`
    const h = Math.floor(mins / 60), m = mins % 60
    return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
    </div>
  )

  if (!event) return null

  const pendingRegs = event.registrations.filter(r => r.status === 'PENDING')
  const verifiedRegs = event.registrations.filter(r => r.status !== 'PENDING')

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all bg-transparent">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center transform rotate-3 shadow-md">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-white font-black text-lg truncate max-w-[150px] sm:max-w-none">{event.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to={`/events/${id}/edit`}
              className="flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-blue-400 bg-transparent border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/20 px-4 py-2.5 rounded-xl transition-all shadow-sm">
              <Edit3 size={16} />Edit
            </Link>
            <button onClick={() => setShowDelete(true)}
              className="p-2.5 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        <div className="card animate-fade-up">
          <h1 className="text-3xl font-black text-white mb-3">{event.name}</h1>
          {event.description && (
            <p className="text-white/60 font-medium text-base mb-8 leading-relaxed max-w-2xl">{event.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-500/20/50 border border-blue-500/30">
              <div className="w-12 h-12 rounded-[1rem] bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="text-white/40 font-bold text-xs uppercase tracking-wider mb-1">Date & Time</div>
                <div className="text-white text-base font-bold">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-white/80 font-semibold text-sm mt-0.5">
                  {format(new Date(event.date), 'h:mm a')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/20/50 border border-amber-500/30">
              <div className="w-12 h-12 rounded-[1rem] bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={20} className="text-amber-400" />
              </div>
              <div>
                <div className="text-white/40 font-bold text-xs uppercase tracking-wider mb-1">Venue</div>
                <div className="text-white text-base font-bold">{event.venue}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/20/50 border border-emerald-500/30">
              <div className="w-12 h-12 rounded-[1rem] bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-white/40 font-bold text-xs uppercase tracking-wider mb-1">Duration</div>
                <div className="text-white text-base font-bold">{fmtDuration(event.duration)}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-purple-500/20/50 border border-purple-500/30">
              <div className="w-12 h-12 rounded-[1rem] bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-white/40 font-bold text-xs uppercase tracking-wider mb-1">Interactions</div>
                <div className="text-white text-base font-bold">
                  {event.registrations.length} Teams Registered
                </div>
                <div className="text-white/80 font-semibold text-sm mt-0.5">
                  {event.organizers.length} active organizers
                </div>
              </div>
            </div>
          </div>
        </div>

        {event.organizers.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-4 ml-2">
              Organizing Committee
            </h2>
            <div className="card !p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {event.organizers.map(o => (
                  <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl bg-transparent border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                    <div className="p-2.5 bg-amber-100 text-amber-300 rounded-xl">
                      <Crown size={20} />
                    </div>
                    <div>
                      <div className="text-white font-bold">{o.student.name}</div>
                      <div className="text-white/60 font-semibold text-xs mt-0.5">{o.student.registrationNo} • {o.student.department} {o.student.section}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pendingRegs.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-sm font-black text-amber-300 uppercase tracking-widest mb-4 ml-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Pending Actions Required
            </h2>
            <div className="space-y-4">
              {pendingRegs.map(r => (
                <div key={r.id} className="card border-2 border-amber-500/30 bg-amber-500/20 shadow-sm shadow-amber-100">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div>
                      {r.teamName && <h3 className="text-white text-xl font-black mb-3">{r.teamName}</h3>}
                      <div className="space-y-2.5">
                        {r.members.map(m => (
                          <div key={m.id} className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {m.student.name} <span className="text-white/40 font-semibold font-mono">({m.student.registrationNo})</span>
                            <span className="text-white/40 font-semibold">— {m.student.department} {m.student.section}</span>
                          </div>
                        ))}
                        {r.transactionId && (
                          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-sm animate-fade-in shadow-inner">
                            <span className="text-amber-400 font-black uppercase tracking-wider text-[10px] block mb-0.5">UPI Transaction ID</span>
                            <span className="font-mono text-white/90 font-bold block mb-2">{r.transactionId}</span>
                            {r.paymentScreenshotUrl && (
                              <a href={r.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative group">
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <span className="text-white text-xs font-bold">Enlarge</span>
                                </div>
                                <img src={r.paymentScreenshotUrl} alt="Payment Proof" className="h-16 w-16 object-cover rounded-lg border border-white/20 shadow-sm" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button 
                        disabled={updating === r.id}
                        onClick={() => verifyRegistration(r.id, 'REJECTED')}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm bg-white/5 backdrop-blur-md border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 font-bold transition-all shadow-sm"
                      >
                        Reject
                      </button>
                      <button
                        disabled={updating === r.id}
                        onClick={() => verifyRegistration(r.id, 'VERIFIED')}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm bg-green-500 hover:bg-green-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-green-500/20"
                      >
                        <CheckCircle2 size={16} /> Verify Team
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {verifiedRegs.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-4 ml-2">
              Processed Registrations
            </h2>
            <div className="space-y-4">
              {verifiedRegs.map(r => (
                <div key={r.id} className={`card border-2 transition-opacity ${r.status === 'VERIFIED' ? 'border-green-500/30 bg-white/5 backdrop-blur-md' : 'border-red-500/30 bg-transparent'} opacity-80 hover:opacity-100`}>
                   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                    <div>
                      {r.teamName && <h3 className="text-white font-black text-lg mb-2">{r.teamName}</h3>}
                      <div className="space-y-2">
                        {r.members.map(m => (
                          <div key={m.id} className="text-sm font-semibold text-white/80 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'VERIFIED' ? 'bg-green-400' : 'bg-red-400'}`} />
                            {m.student.name} <span className="text-white/40 font-mono">({m.student.registrationNo})</span>
                          </div>
                        ))}
                        {r.transactionId && (
                          <div className="mt-2 text-xs font-semibold text-white/40 border-t border-white/10 pt-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="uppercase tracking-wider mr-2 text-white/60">UPI Ref:</span>
                                <span className="font-mono text-white/80">{r.transactionId}</span>
                              </div>
                              {r.paymentScreenshotUrl && (
                                <a href={r.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group">
                                  <img src={r.paymentScreenshotUrl} alt="Proof" className="h-8 w-8 object-cover rounded border border-white/20 group-hover:opacity-80 transition-opacity" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-2 sm:mt-0">
                      {r.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-green-300 bg-green-100 px-3 py-1.5 rounded-lg border border-green-500/30"><CheckCircle2 size={14} /> Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-red-300 bg-red-100 px-3 py-1.5 rounded-lg border border-red-500/30"><XCircle size={14} /> Rejected</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowDelete(false)}>
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
            <p className="text-white/80 font-medium mb-8 leading-relaxed">
              All registrations and data for <span className="text-white font-black">"{event.name}"</span> will be permanently deleted across the platform.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
