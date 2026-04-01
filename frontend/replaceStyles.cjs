const fs = require('fs')
const path = require('path')

const files = [
  'Login.jsx', 'Signup.jsx', 'ClubDashboard.jsx', 
  'StudentDashboard.jsx', 'TeacherDashboard.jsx', 
  'CreateEvent.jsx', 'EventDetails.jsx', 
  'RegisterEvent.jsx', 'StudentEvents.jsx'
]

const replacements = [
  { search: /\bbg-white\b/g, replace: 'bg-white/5 backdrop-blur-md' },
  { search: /\bbg-slate-50\b/g, replace: 'bg-transparent' },
  { search: /\btext-slate-900\b/g, replace: 'text-white' },
  { search: /\btext-slate-800\b/g, replace: 'text-white' },
  { search: /\btext-slate-700\b/g, replace: 'text-white/90' },
  { search: /\btext-slate-600\b/g, replace: 'text-white/80' },
  { search: /\btext-slate-500\b/g, replace: 'text-white/60' },
  { search: /\btext-slate-400\b/g, replace: 'text-white/40' },
  { search: /\btext-slate-300\b/g, replace: 'text-white/30' },
  { search: /\bborder-slate-100\b/g, replace: 'border-white/10' },
  { search: /\bborder-slate-200\b/g, replace: 'border-white/10' },
  { search: /\bbg-slate-100\b/g, replace: 'bg-white/10' },
  { search: /\bbg-slate-200\b/g, replace: 'bg-white/20' },
  { search: /\bhover:bg-slate-100\b/g, replace: 'hover:bg-white/10' },
  { search: /\bhover:bg-slate-50\b/g, replace: 'hover:bg-white/5' },
  { search: /\bborder-t-[#FFB800]\b/g, replace: 'border-t-white' },
  { search: /\btext-[#FFB800]\b/g, replace: 'text-amber-400' },
  { search: /\bbg-[#FFB800]\b/g, replace: 'bg-amber-500' },
  { search: /\btext-amber-600\b/g, replace: 'text-amber-400' },
  { search: /\btext-amber-500\b/g, replace: 'text-amber-300' },
  { search: /\btext-blue-600\b/g, replace: 'text-blue-400' },
  { search: /\btext-blue-500\b/g, replace: 'text-blue-400' },
  { search: /\bbg-blue-50\b/g, replace: 'bg-blue-500/20' },
  { search: /\bbg-amber-50\b/g, replace: 'bg-amber-500/20' },
  { search: /\bbg-emerald-50\b/g, replace: 'bg-emerald-500/20' },
  { search: /\bbg-purple-50\b/g, replace: 'bg-purple-500/20' },
  { search: /\bbg-green-50\b/g, replace: 'bg-green-500/20' },
  { search: /\bbg-red-50\b/g, replace: 'bg-red-500/20' },
  { search: /\bhover:bg-amber-100\b/g, replace: 'hover:bg-amber-500/30' },
  { search: /\bhover:bg-blue-100\b/g, replace: 'hover:bg-blue-500/30' },
  { search: /\bborder-amber-100\b/g, replace: 'border-amber-500/30' },
  { search: /\bborder-amber-200\b/g, replace: 'border-amber-500/30' },
  { search: /\bborder-blue-100\b/g, replace: 'border-blue-500/30' },
  { search: /\bborder-blue-200\b/g, replace: 'border-blue-500/30' },
  { search: /\bborder-emerald-100\b/g, replace: 'border-emerald-500/30' },
  { search: /\bborder-purple-100\b/g, replace: 'border-purple-500/30' },
  { search: /\bborder-green-100\b/g, replace: 'border-green-500/30' },
  { search: /\bborder-green-200\b/g, replace: 'border-green-500/30' },
  { search: /\bborder-red-100\b/g, replace: 'border-red-500/30' },
  { search: /\bborder-red-200\b/g, replace: 'border-red-500/30' },
  { search: /\btext-red-600\b/g, replace: 'text-red-400' },
  { search: /\btext-red-700\b/g, replace: 'text-red-300' },
  { search: /\btext-green-600\b/g, replace: 'text-green-400' },
  { search: /\btext-green-700\b/g, replace: 'text-green-300' },
  { search: /style={{ background: '#FFB800' }}/g, replace: "style={{ background: 'transparent' }}" },
  { search: /style=\{\{ background: '#FFB800' \}\}/g, replace: "style={{ background: 'transparent' }}" }
]

files.forEach(f => {
  const p = path.join(__dirname, 'src', 'pages', f)
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8')
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace)
    })
    fs.writeFileSync(p, content, 'utf-8')
    console.log(`Updated ${f}`)
  }
})
