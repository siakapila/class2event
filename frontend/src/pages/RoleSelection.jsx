import { Link } from 'react-router-dom'
import { Users, GraduationCap, Building2, ChevronRight, Zap, Sparkles } from 'lucide-react'

export default function RoleSelection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-[#0a0a16]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen opacity-20 blur-[100px] animate-pulse" 
             style={{ background: 'radial-gradient(circle, #6246ff, transparent)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-pulse" 
             style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', animationDelay: '2s' }} />
             
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-lg shadow-ink-500/10 hover:bg-white/10 transition-colors cursor-default">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">The Future of Event Management</span>
          </div>
          
          <div className="flex justify-center mb-2">
            <div className="relative w-24 h-24 bg-gradient-to-tr from-ink-600 to-sky-400 rounded-3xl flex items-center justify-center transform rotate-3 hover:rotate-6 hover:scale-105 transition-all duration-300 shadow-2xl shadow-ink-500/30">
              <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm" />
              <Zap size={40} className="text-white relative z-10 drop-shadow-md" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Welcome to <span className="gradient-text">class2event</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium">
            A unified platform bridging the gap between Clubs, Students, and Faculty. Select your portal to proceed.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2">
          
          {/* Student Role */}
          <Link to="/login?role=student" className="group relative rounded-3xl p-[1px] overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-mint-400/50 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-[#111122]/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-start border border-white/10 group-hover:border-mint-400/30 transition-all duration-300 group-hover:bg-[#15152a]/90 group-hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 bg-mint-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-mint-400/20 transition-all duration-300 shadow-lg shadow-mint-400/5">
                <GraduationCap size={28} className="text-mint-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Student</h2>
              <p className="text-white/50 leading-relaxed mb-8 flex-1">
                Discover thrilling events, register with your peers, and form dynamic teams seamlessly.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-mint-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Enter Portal <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Club Role */}
          <Link to="/login?role=club" className="group relative rounded-3xl p-[1px] overflow-hidden animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-ink-400/50 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-[#111122]/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-start border border-white/10 group-hover:border-ink-400/30 transition-all duration-300 group-hover:bg-[#15152a]/90 group-hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 bg-ink-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-ink-500/20 transition-all duration-300 shadow-lg shadow-ink-500/5">
                <Building2 size={28} className="text-ink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Club</h2>
              <p className="text-white/50 leading-relaxed mb-8 flex-1">
                Orchestrate your events powerfully. Manage registrations, assign organizers, and streamline operations.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-ink-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Enter Portal <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Teacher Role */}
          <Link to="/login?role=teacher" className="group relative rounded-3xl p-[1px] overflow-hidden animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/50 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-[#111122]/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-start border border-white/10 group-hover:border-amber-400/30 transition-all duration-300 group-hover:bg-[#15152a]/90 group-hover:-translate-y-1 shadow-xl">
              <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-400/20 transition-all duration-300 shadow-lg shadow-amber-400/5">
                <Users size={28} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Faculty</h2>
              <p className="text-white/50 leading-relaxed mb-8 flex-1">
                Oversee student participation effortlessly. Access verified attendee lists for valid absence tracking.
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-amber-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Enter Portal <ChevronRight size={16} />
              </div>
            </div>
          </Link>

        </div>
        
        {/* Footer info */}
        <div className="mt-16 text-center text-sm text-white/30 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p>Built exclusively for Manipal University Jaipur</p>
        </div>
      </div>
    </div>
  )
}
