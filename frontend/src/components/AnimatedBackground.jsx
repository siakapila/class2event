import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const location = useLocation()
  
  // Is this the landing page?
  const isLanding = location.pathname === '/role-selection' || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup'

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Create a subtle parallax effect based on mouse movement
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0A192F]">
      {/* Base Image Layer with Parallax */}
      <div 
        className={`absolute inset-0 transition-transform duration-700 ease-out will-change-transform ${isLanding ? 'scale-105' : 'scale-[1.02] filter blur-[8px] brightness-[0.7] sepia-[0.1]'}`}
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(${isLanding ? 1.05 : 1.02})`,
          backgroundImage: `url('/bg-night.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Dreamy Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-amber-300 rounded-full mix-blend-screen opacity-30 animate-pulse-slow blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-screen opacity-20 animate-pulse-slow blur-[100px]" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sun Ray Overlays (CSS pseudo-elements handled via tailwind utility classes if needed, or simple absolute divs) */}
      {isLanding && (
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-white/20 to-transparent pointer-events-none mix-blend-overlay" />
      )}
      
      {/* Dark vignette to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/60 pointer-events-none" />
      
      {/* Floating Light Motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full opacity-60 animate-float"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            />
          ))}
      </div>
    </div>
  )
}
