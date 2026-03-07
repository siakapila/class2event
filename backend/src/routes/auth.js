import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = Router()

const STUDENT_DOMAIN = '@muj.manipal.edu'
const CLUB_DOMAIN = '@muj.manipal.edu'
const TEACHER_DOMAIN = '@jaipur.manipal.edu'

// --- CLUB AUTH ---
router.post('/club/signup', async (req, res) => {
  try {
    const { clubName, email, password } = req.body

    if (!clubName || !email || !password) return res.status(400).json({ error: 'All fields are required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
    if (!email.endsWith(CLUB_DOMAIN)) return res.status(400).json({ error: `Club email must end with ${CLUB_DOMAIN}` })

    const existing = await prisma.club.findFirst({
      where: { OR: [{ email }, { name: clubName }] }
    })
    if (existing) {
      if (existing.email === email) return res.status(409).json({ error: 'Email already registered' })
      return res.status(409).json({ error: 'Club name already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const club = await prisma.club.create({
      data: { name: clubName, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }
    })

    const token = jwt.sign({ userId: club.id, role: 'club' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: club, role: 'club' })
  } catch (err) {
    console.error('Club signup error:', err)
    res.status(500).json({ error: 'Server error during signup' })
  }
})

router.post('/club/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const club = await prisma.club.findUnique({ where: { email } })
    if (!club) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, club.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const expiresIn = rememberMe ? '30d' : '7d'
    const token = jwt.sign({ userId: club.id, role: 'club' }, process.env.JWT_SECRET, { expiresIn })

    const { password: _, ...clubData } = club
    res.json({ token, user: clubData, role: 'club' })
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' })
  }
})

// --- STUDENT AUTH ---
router.post('/student/signup', async (req, res) => {
  try {
    const { name, email, password, registrationNo, className, year } = req.body

    if (!name || !email || !password || !registrationNo || !className || !year) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
    if (!email.endsWith(STUDENT_DOMAIN)) return res.status(400).json({ error: `Student email must end with ${STUDENT_DOMAIN}` })

    const existing = await prisma.student.findFirst({
      where: { OR: [{ email }, { registrationNo }] }
    })
    if (existing) {
      if (existing.email === email) return res.status(409).json({ error: 'Email already registered' })
      return res.status(409).json({ error: 'Registration number already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const student = await prisma.student.create({
      data: { name, email, password: hashedPassword, registrationNo, className, year: parseInt(year) },
      select: { id: true, name: true, email: true, registrationNo: true, className: true, year: true }
    })

    const token = jwt.sign({ userId: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: student, role: 'student' })
  } catch (err) {
    console.error('Student signup error:', err)
    res.status(500).json({ error: 'Server error during signup' })
  }
})

router.post('/student/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const student = await prisma.student.findUnique({ where: { email } })
    if (!student) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, student.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const expiresIn = rememberMe ? '30d' : '7d'
    const token = jwt.sign({ userId: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn })

    const { password: _, ...studentData } = student
    res.json({ token, user: studentData, role: 'student' })
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' })
  }
})

// --- TEACHER AUTH ---
router.post('/teacher/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
    if (!email.endsWith(TEACHER_DOMAIN)) return res.status(400).json({ error: `Teacher email must end with ${TEACHER_DOMAIN}` })

    const existing = await prisma.teacher.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const teacher = await prisma.teacher.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true }
    })

    const token = jwt.sign({ userId: teacher.id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: teacher, role: 'teacher' })
  } catch (err) {
    console.error('Teacher signup error:', err)
    res.status(500).json({ error: 'Server error during signup' })
  }
})

router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const teacher = await prisma.teacher.findUnique({ where: { email } })
    if (!teacher) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, teacher.password)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const expiresIn = rememberMe ? '30d' : '7d'
    const token = jwt.sign({ userId: teacher.id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn })

    const { password: _, ...teacherData } = teacher
    res.json({ token, user: teacherData, role: 'teacher' })
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' })
  }
})

// --- ME (Universal token check) ---
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' })
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    let user = null
    // Fallback logic in case old tokens with clubId exist
    const userId = decoded.userId || decoded.clubId
    const role = decoded.role || 'club'

    if (role === 'club') {
      user = await prisma.club.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } })
    } else if (role === 'student') {
      user = await prisma.student.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, registrationNo: true, className: true, year: true } })
    } else if (role === 'teacher') {
      user = await prisma.teacher.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } })
    }

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user, role })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
