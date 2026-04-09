import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { format } from 'date-fns'
import {
  LogOut, Zap, Search, Calendar, ChevronDown, ChevronRight,
  ShieldCheck, AlertCircle, Circle, ArrowDownToLine, Users, Building2
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [department, setDepartment] = useState('')
  const [section, setSection] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const departments = ['CSE', 'IT', 'AIML', 'CCE', 'DSE', 'DS', 'MECH', 'EEE']
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

  useEffect(() => {
    if (department && section) {
      fetchSectionAttendance()
    } else {
      setStudents([])
    }
  }, [department, section])

  const fetchSectionAttendance = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/teacher/section-attendance?department=${department}&section=${section}`)
      setStudents(res.data.students)
    } catch (err) {
      console.error('Failed to fetch section attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const downloadCSV = () => {
    let csv = 'Name,Registration Number,Department,Section,Year,Total Events Attended,Event Details (Name - Date - Role)\n'
    
    students.forEach(s => {
      const eventDetails = s.events.map(e => `${e.name} (${format(new Date(e.date), 'MMM d yyyy')} - ${e.role})`).join(' | ')
      csv += `"${s.name}","${s.registrationNo}","${s.department}","${s.section}","${s.year}","${s.totalEvents}","${eventDetails}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${department}_Section_${section}_Attendance.csv`
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        
        <div className="mb-10 animate-fade-up">
          <h1 className="text-4xl font-black text-white mb-2">Class Attendance Tracker</h1>
          <p className="text-white/60 font-semibold text-lg">Select a department and section to view verified event participation.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">Department</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="input-field pl-12 w-full shadow-sm border-2 border-white/10/60 bg-transparent py-4 text-lg appearance-none font-bold"
              >
                <option value="" className="bg-slate-900">Select Department</option>
                {departments.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
              </select>
            </div>
          </div>

          <div className="relative flex-1">
            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">Section</label>
            <div className="relative">
              <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                disabled={!department}
                className="input-field pl-12 w-full shadow-sm border-2 border-white/10/60 bg-transparent py-4 text-lg appearance-none font-bold disabled:opacity-50"
              >
                <option value="" className="bg-slate-900">Select Section</option>
                {sections.map(s => <option key={s} value={s} className="bg-slate-900">Section {s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-end pb-1">
            <button 
              onClick={downloadCSV}
              disabled={students.length === 0}
              className="h-[58px] px-8 flex items-center justify-center gap-2 text-sm font-bold text-amber-400 hover:text-white bg-amber-100/10 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-100/10 disabled:hover:text-amber-400 border border-amber-500/30 rounded-xl transition-all"
            >
              <ArrowDownToLine size={20} /> Export CSV
            </button>
          </div>
        </div>

        {/* Results */}
        {department && section && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">Student Roster: {department} - {section}</h3>
              <div className="text-sm font-bold text-white/60 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                {students.length} Students Found
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#FFB800] rounded-full animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-24 card border-dashed border-2 border-white/10 shadow-none bg-transparent">
                <ShieldCheck size={48} className="text-white/30 mx-auto mb-5" />
                <h3 className="text-white/90 font-black text-xl mb-2">No students found</h3>
                <p className="text-white/60 font-semibold mb-8 max-w-sm mx-auto">There are no registered students in this section yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student, i) => {
                  const isExpanded = expanded === student.id
                  return (
                    <div key={student.id} className={`card p-0 overflow-hidden border-2 transition-colors ${isExpanded ? 'border-[#FFB800]/50 shadow-2xl shadow-amber-900/10' : 'border-transparent'}`} style={{ animationDelay: `${i * 0.05}s` }}>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : student.id)}
                        className="w-full text-left p-6 sm:p-8 flex items-start sm:items-center justify-between hover:bg-transparent/50 transition-colors group"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">{student.registrationNo}</span>
                            <span className="text-white/60 font-bold text-xs flex items-center gap-1.5">
                              Year {student.year}
                            </span>
                          </div>
                          <h3 className="text-white font-black text-2xl leading-tight group-hover:text-amber-300 transition-colors mb-4">{student.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            {student.totalEvents > 0 ? (
                              <span className="text-xs font-bold text-green-300 bg-green-100 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Circle size={8} className="fill-green-400 text-green-400"/>
                                {student.totalEvents} Verified Event{student.totalEvents > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Circle size={8} className="fill-slate-500 text-slate-500"/>
                                No Event Participation
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all ${isExpanded ? 'bg-amber-100 text-amber-400' : 'bg-white/10 text-white/60 group-hover:bg-white/20'}`}>
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t-2 border-white/10 bg-transparent/50 hover:bg-transparent p-6 sm:p-8 animate-slide-in">
                          <h4 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6">Participation Details</h4>
                          
                          {student.totalEvents === 0 ? (
                            <p className="text-white/40 font-medium italic">No verified participation yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {student.events.map((event, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                  <div>
                                    <div className="text-white font-bold mb-1">{event.name}</div>
                                    <div className="text-white/40 text-xs font-semibold flex items-center gap-2">
                                      <Calendar size={12} /> {format(new Date(event.date), 'MMM d, yyyy')}
                                    </div>
                                  </div>
                                  <div>
                                     {event.role === 'Organizer' ? (
                                        <span className="text-xs font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-1 rounded-md">Organizer</span>
                                     ) : (
                                        <span className="text-xs font-black uppercase text-green-300 bg-green-500/20 px-2 py-1 rounded-md">Participant</span>
                                     )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
