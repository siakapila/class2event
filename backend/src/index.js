import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'
import studentRoutes from './routes/student.js'
import teacherRoutes from './routes/teacher.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/teacher', teacherRoutes)

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 class2event backend running on http://localhost:${PORT}`)
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
})
