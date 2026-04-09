import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { format } from 'date-fns'
import { ArrowLeft, Users, Zap, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function RegisterEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  
  const [teamName, setTeamName] = useState('')
  const [emails, setEmails] = useState([''])
  const [transactionId, setTransactionId] = useState('')
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get('/api/student/events')
        const ev = res.data.events.find(e => e.id === id)
        if (ev) setEvent(ev)
        else navigate('/events')
      } catch {
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSubmitting(true)
    
    const members = emails.filter(m => m.trim().length > 0)
    
    if (event.isPaid) {
      if (!transactionId.trim() || !paymentScreenshotUrl) {
        setApiError('You must provide your Transaction ID and a payment screenshot for paid events')
        setSubmitting(false)
        return
      }
    }
    
    try {
      await api.post(`/api/student/events/${id}/register`, {
        teamName: teamName.trim() || undefined,
        members,
        transactionId: transactionId.trim() || undefined,
        paymentScreenshotUrl: paymentScreenshotUrl || undefined
      })
      setSuccess(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const addEmail = () => setEmails(e => [...e, ''])
  const removeEmail = (i) => setEmails(e => e.filter((_, idx) => idx !== i))
  const updateEmail = (i, val) => setEmails(e => e.map((str, idx) => idx === i ? val : str))

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setApiError('Screenshot must be less than 2MB')
      return
    }
    setApiError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPaymentScreenshotUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
       <div className="max-w-lg w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] text-center p-12 animate-fade-up shadow-2xl">
        <div className="w-24 h-24 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-3 text-green-500">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Registration Submitted!</h2>
        <p className="text-white/60 font-semibold mb-10 text-lg">Your registration is now pending club verification.</p>
        <Link to="/dashboard" className="btn-primary inline-flex justify-center w-full !py-4 text-lg bg-slate-900 hover:bg-slate-800">Return to Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative bg-transparent pb-12">
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-4">
          <button onClick={() => navigate('/events')}
            className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all bg-transparent">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center transform rotate-3 shadow-md flex-shrink-0">
               <Zap size={20} className="text-white" />
             </div>
             <span className="text-white font-black text-xl truncate">Register for {event?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {apiError && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-bold text-sm animate-fade-in shadow-sm">
            {apiError}
          </div>
        )}

        <div className="card mb-8 animate-fade-up !p-8">
          <h2 className="text-2xl font-black text-white mb-2">{event?.name}</h2>
          <p className="text-white/60 font-bold text-sm uppercase tracking-widest">{event?.club?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {event?.isPaid && (
            <div className="card !p-8 border-amber-500/30 bg-amber-500/5">
              <h2 className="text-white font-black text-xl mb-4 flex items-center gap-3">
                 <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                   <Zap size={20} />
                 </div>
                 Payment Required
              </h2>
              <p className="text-white/60 mb-6 font-semibold">
                This is a paid event. Please pay the registration fee of <span className="text-amber-400 font-bold">₹{event.registrationFee}</span> using the QR below and enter your UPI Transaction ID.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-2">
                 {event.qrCodeUrl && (
                   <div className="bg-white p-2 rounded-xl self-start flex-shrink-0 shadow-lg">
                     <img src={event.qrCodeUrl} alt="Payment QR" className="w-40 h-40 object-cover rounded-lg" />
                   </div>
                 )}
                 <div className="flex-1 mt-auto space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">UPI Transaction / Reference ID <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. 332412891910"
                        value={transactionId} onChange={e => setTransactionId(e.target.value)}
                        className="input-field bg-white/5 backdrop-blur-md shadow-sm border-white/10 w-full"
                        required={event.isPaid}
                      />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-bold text-white/90 mb-2">Payment Screenshot <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required={event.isPaid && !paymentScreenshotUrl} />
                         <div className={`flex items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-colors ${!paymentScreenshotUrl ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20' : 'border-green-500/30 bg-green-500/10'}`}>
                           {paymentScreenshotUrl ? (
                             <div className="flex items-center gap-4">
                               <img src={paymentScreenshotUrl} alt="Preview" className="h-12 w-12 object-cover rounded shadow-sm" />
                               <span className="text-sm font-bold text-green-400">Screenshot Attached! Click to replace</span>
                             </div>
                           ) : (
                             <span className="text-sm font-bold text-amber-400">Upload Screenshot (Max 2MB)</span>
                           )}
                         </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          <div className="card !p-8">
            <h2 className="text-white font-black text-xl mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Users size={20} />
              </div>
              Registration Details
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Team Name <span className="text-white/40 font-semibold">(Optional)</span></label>
                <input type="text" placeholder="e.g. Code Ninjas"
                  value={teamName} onChange={e => setTeamName(e.target.value)}
                  className="input-field bg-white/5 backdrop-blur-md shadow-sm !py-3.5 border-white/10" />
                <p className="text-xs font-bold text-white/40 mt-2">Required only if registering a group.</p>
              </div>

              <div className="pt-8 border-t-2 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-white/90">Teammates <span className="text-white/40 font-semibold">(College Emails)</span></label>
                  <button type="button" onClick={addEmail}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-700 bg-blue-500/20 hover:bg-blue-500/30 font-bold px-4 py-2 rounded-xl transition-colors text-sm">
                    <Plus size={16} />Add Teammate
                  </button>
                </div>
                
                <div className="space-y-3">
                  {emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-3 animate-slide-in">
                      <input
                        type="email"
                        placeholder="teammate@muj.manipal.edu"
                        value={email}
                        onChange={e => updateEmail(i, e.target.value)}
                        className="input-field bg-white/5 backdrop-blur-md shadow-sm flex-1 !py-3.5 border-white/10"
                      />
                      <button type="button" onClick={() => removeEmail(i)}
                        className="p-3.5 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-transparent border border-white/10 rounded-xl">
                  <p className="text-sm font-bold text-white/60 leading-relaxed">
                    You <span className="text-white border-b-2 border-[#FFB800]">do not</span> need to add your own email, we'll include you automatically in the submission. Make sure your teammates already have accounts on Class2Event.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 flex justify-center mt-6 text-lg font-bold">
            {submitting ? 'Submitting Registration...' : 'Submit Registration'}
          </button>
        </form>
      </main>
    </div>
  )
}
