import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Volume2, Users, GraduationCap, Building2, ChevronRight, X } from 'lucide-react'

export default function RoleSelection() {
  const [showRoles, setShowRoles] = useState(false)

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-transparent">
      
      {/* Top Navigation Overlay */}
      <header className="absolute top-0 w-full p-8 md:px-16 flex items-center justify-between z-20 animate-fade-in">
        <div className="text-white font-bold text-xl drop-shadow-md tracking-wide">
          class2event
        </div>
        
        <nav className="hidden md:flex items-center gap-12">
          {['Community', 'About', 'Support', 'Contact'].map(item => (
            <a key={item} href="#" className="text-white/80 hover:text-white font-medium text-sm transition-colors drop-shadow-md">
              {item}
            </a>
          ))}
          <button onClick={() => setShowRoles(true)} className="px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all drop-shadow-md">
            Enter Portal
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 pt-32 pb-24">
        <div className="max-w-3xl animate-fade-up">
          
          <div className="flex items-center gap-3 mb-6 text-white/90 font-medium drop-shadow-md text-sm md:text-base">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Building2 size={14} className="text-white" />
            </div>
            <span>Journey to new frontiers. Connect your campus.</span>
          </div>

          <h1 className="text-7xl sm:text-[10rem] font-bold text-white leading-none tracking-tight mb-8 drop-shadow-2xl font-serif">
            CLASS2<span className="opacity-90">EVENT</span>
          </h1>

          <p className="max-w-xl text-white/90 text-sm sm:text-lg mb-12 drop-shadow-md leading-relaxed font-medium">
            Away from the manic energy of ordinary student life lies a unified platform linking clubs, students, and faculty. Surprising and captivating in equal measure, this is event management entirely reimagined.
          </p>

          <button 
            onClick={() => setShowRoles(true)}
            className="group flex items-center gap-4 bg-white hover:bg-white/90 text-slate-900 font-bold px-8 py-3.5 rounded-none shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
          >
            Start the journey
            <Play size={16} className="fill-slate-900 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>



      {/* Roles Modal Overlay */}
      {showRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowRoles(false)} />
          
          <div className="relative w-full max-w-5xl bg-slate-900/50 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl animate-fade-up">
            <button onClick={() => setShowRoles(false)} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
              <X size={20} />
            </button>
            
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight font-serif">Select your Portal</h2>
              <p className="text-white/60 font-medium">Choose how you want to interact with the university universe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/login?role=student" className="group rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap size={36} className="text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Student</h3>
                <p className="text-white/50 text-sm leading-relaxed font-medium">Discover thrilling events, register with your peers, and form dynamic teams.</p>
              </Link>
              
              <Link to="/login?role=club" className="group rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Building2 size={36} className="text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Club</h3>
                <p className="text-white/50 text-sm leading-relaxed font-medium">Orchestrate events, manage registrations, and assign organizers securely.</p>
              </Link>

              <Link to="/login?role=teacher" className="group rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Users size={36} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">Faculty</h3>
                <p className="text-white/50 text-sm leading-relaxed font-medium">Oversee student participation effortlessly with verified attendee lists.</p>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
