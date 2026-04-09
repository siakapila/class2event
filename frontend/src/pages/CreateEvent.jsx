import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import {
  ArrowLeft, Plus, Trash2, Crown, Calendar, 
  MapPin, Clock, FileText, Save, Zap
} from 'lucide-react'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', venue: '', date: '', time: '', duration: 60, description: '',
    isPaid: false, registrationFee: '', qrCodeUrl: ''
  })
  
  const [organizers, setOrganizers] = useState([''])
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isEdit) loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const res = await api.get(`/api/events/${id}`)
      const ev = res.data.event
      const d = new Date(ev.date)
      setForm({
        name: ev.name,
        venue: ev.venue,
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5),
        duration: ev.duration,
        description: ev.description || '',
        isPaid: ev.isPaid || false,
        registrationFee: ev.registrationFee || '',
        qrCodeUrl: ev.qrCodeUrl || ''
      })
      
      const orgs = ev.organizers.map(o => o.student.email)
      setOrganizers(orgs.length ? orgs : [''])
    } catch {
      navigate('/dashboard')
    } finally {
      setFetching(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.duration || form.duration < 1) e.duration = 'Duration must be at least 1 minute'
    if (form.duration > 1440) e.duration = 'Duration cannot exceed 1440 minutes'
    if (form.isPaid) {
      if (!form.registrationFee || form.registrationFee <= 0) e.registrationFee = 'Valid registration fee is required'
      if (!form.qrCodeUrl) e.qrCodeUrl = 'Payment QR Code is required'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const validOrgs = organizers.filter(email => email.trim() !== '')

    const payload = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      date: new Date(`${form.date}T${form.time}`).toISOString(),
      duration: parseInt(form.duration),
      description: form.description.trim() || null,
      organizers: validOrgs,
      isPaid: form.isPaid,
      registrationFee: form.isPaid ? parseInt(form.registrationFee) : null,
      qrCodeUrl: form.isPaid ? form.qrCodeUrl : null,
    }

    try {
      if (isEdit) {
        await api.put(`/api/events/${id}`, payload)
      } else {
        await api.post('/api/events', payload)
      }
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save event. Double check organizer emails.')
    } finally {
      setLoading(false)
    }
  }

  const setField = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const addOrganizer = () => setOrganizers(o => [...o, ''])
  const removeOrganizer = (i) => setOrganizers(o => o.filter((_, idx) => idx !== i))
  const setOrganizer = (i, val) => setOrganizers(o => o.map((email, idx) => idx === i ? val : email))

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors(err => ({ ...err, qrCodeUrl: 'Image size must be less than 2MB' }))
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setForm(f => ({ ...f, qrCodeUrl: event.target.result }))
      if (errors.qrCodeUrl) setErrors(er => ({ ...er, qrCodeUrl: '' }))
    }
    reader.readAsDataURL(file)
  }

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-transparent pb-12">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all bg-transparent">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFB800] rounded-[1rem] flex items-center justify-center transform rotate-3 shadow-sm">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-white font-black text-xl">{isEdit ? 'Edit Event' : 'New Event'}</span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-sm">
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Event'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {apiError && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-bold text-sm animate-fade-in shadow-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="card animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Calendar size={20} />
              </div>
              <h2 className="text-white font-black text-xl">Event Details</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Event Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Annual Tech Fest 2025"
                  value={form.name} onChange={setField('name')}
                  className={`input-field bg-white/5 backdrop-blur-md !py-3.5 shadow-sm ${errors.name ? 'border-red-300 focus:ring-red-200' : ''}`} />
                {errors.name && <p className="text-red-500 font-bold text-xs mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-white/40" />Venue <span className="text-red-500">*</span></span>
                </label>
                <input type="text" placeholder="e.g. Main Auditorium, Block A"
                  value={form.venue} onChange={setField('venue')}
                  className={`input-field bg-white/5 backdrop-blur-md !py-3.5 shadow-sm ${errors.venue ? 'border-red-300 focus:ring-red-200' : ''}`} />
                {errors.venue && <p className="text-red-500 font-bold text-xs mt-2">{errors.venue}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-bold text-white/90 mb-2">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={setField('date')}
                    className={`input-field bg-white/5 backdrop-blur-md !py-3.5 shadow-sm ${errors.date ? 'border-red-300 focus:ring-red-200' : ''}`} />
                  {errors.date && <p className="text-red-500 font-bold text-xs mt-2">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Time <span className="text-red-500">*</span></label>
                  <input type="time" value={form.time} onChange={setField('time')}
                    className={`input-field bg-white/5 backdrop-blur-md !py-3.5 shadow-sm ${errors.time ? 'border-red-300 focus:ring-red-200' : ''}`} />
                  {errors.time && <p className="text-red-500 font-bold text-xs mt-2">{errors.time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-white/40"/>Duration (m) <span className="text-red-500">*</span></span>
                  </label>
                  <input type="number" min="1" max="1440" placeholder="60"
                    value={form.duration} onChange={setField('duration')}
                    className={`input-field bg-white/5 backdrop-blur-md !py-3.5 shadow-sm ${errors.duration ? 'border-red-300 focus:ring-red-200' : ''}`} />
                  {errors.duration && <p className="text-red-500 font-bold text-xs mt-2">{errors.duration}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  <span className="flex items-center gap-2"><FileText size={14} className="text-white/40" />Description</span>
                </label>
                <textarea rows={4} placeholder="What should attendees expect at this event?"
                  value={form.description} onChange={setField('description')}
                  className="input-field bg-white/5 backdrop-blur-md shadow-sm resize-none" />
              </div>
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-green-500/20 text-green-400 rounded-xl">
                 <Zap size={20} />
               </div>
               <h2 className="text-white font-black text-xl">Payment & Registration Fee</h2>
            </div>
            
            <div className="space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-12 h-6 rounded-full transition-colors ${form.isPaid ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isPaid ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={form.isPaid} onChange={e => setField('isPaid')({ target: { value: e.target.checked }})} />
                <span className="text-white/90 font-bold group-hover:text-amber-400 transition-colors">This is a Paid Event</span>
              </label>

              {form.isPaid && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Registration Fee (₹) <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="e.g. 150" min="1"
                      value={form.registrationFee} onChange={setField('registrationFee')}
                      className={`input-field bg-white/10 !py-3.5 shadow-sm ${errors.registrationFee ? 'border-red-300 focus:ring-red-200' : ''}`} />
                    {errors.registrationFee && <p className="text-red-500 font-bold text-xs mt-2">{errors.registrationFee}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-white/90 mb-2">Payment QR Code <span className="text-red-500">*</span></label>
                     <div className="relative">
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                       <div className={`flex items-center justify-center border-2 border-dashed rounded-xl p-4 text-center transition-colors ${errors.qrCodeUrl ? 'border-red-400 bg-red-500/10' : 'border-white/20 bg-white/5 hover:border-amber-400/50 hover:bg-white/10'}`}>
                         {form.qrCodeUrl ? (
                           <div className="flex flex-col items-center">
                             <img src={form.qrCodeUrl} alt="QR Code Preview" className="h-20 object-contain rounded-lg shadow-sm mb-2" />
                             <span className="text-xs font-bold text-amber-400">Click to replace</span>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center text-white/40 py-2">
                             <span className="text-sm font-bold uppercase tracking-widest mb-1 text-white/60">Upload QR Image</span>
                             <span className="text-xs font-semibold">JPG, PNG up to 2MB</span>
                           </div>
                         )}
                       </div>
                     </div>
                     {errors.qrCodeUrl && <p className="text-red-500 font-bold text-xs mt-2">{errors.qrCodeUrl}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                  <Crown size={20} />
                </div>
                <h2 className="text-white font-black text-xl">Supervisors</h2>
              </div>
              <button type="button" onClick={addOrganizer}
                className="flex items-center gap-2 text-[#FFB800] hover:text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 font-bold px-4 py-2 rounded-xl transition-colors text-sm">
                <Plus size={16} />Add Organizer
              </button>
            </div>

            <p className="text-white/60 font-semibold text-sm mb-6 mt-1 ml-11">Provide @muj.manipal.edu emails of students managing this event.</p>

            <div className="space-y-4 ml-[44px]">
              {organizers.map((email, i) => (
                <div key={i} className="flex items-center gap-3 animate-slide-in">
                  <input
                    type="email"
                    placeholder="student@muj.manipal.edu"
                    value={email}
                    onChange={e => setOrganizer(i, e.target.value)}
                    className="input-field bg-white/5 backdrop-blur-md shadow-sm flex-1 !py-3 border-white/10"
                  />
                  {organizers.length > 1 && (
                    <button type="button" onClick={() => removeOrganizer(i)}
                      className="p-3.5 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-500/20 transition-all">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </form>
      </main>
    </div>
  )
}
