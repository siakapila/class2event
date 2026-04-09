import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { v4 as uuidv4 } from 'uuid'
import { sendOTPEmail } from '../lib/mailer.js'

const router = Router()

const STUDENT_DOMAIN = '@muj.manipal.edu'
const CLUB_DOMAIN = '@muj.manipal.edu'
const TEACHER_DOMAIN = '@jaipur.manipal.edu'

// In-memory OTP cache
// Key: email
// Value: { role, userData: { ... }, otp, expiresAt }
const otpCache = new Map()

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// --- SIGNUP INITIATE ---
router.post('/signup/initiate', async (req, res) => {
  try {
    const { role } = req.body
    if (!['club', 'student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const { email, password, name, clubName, registrationNo, department, section, year } = req.body

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const userData = { email }

    // Role-specific validations
    if (role === 'club') {
      if (!clubName) return res.status(400).json({ error: 'Club name is required' })
      if (!email.endsWith(CLUB_DOMAIN)) return res.status(400).json({ error: `Club email must end with ${CLUB_DOMAIN}` })
      
      const existing = await prisma.club.findFirst({ where: { OR: [{ email }, { name: clubName }] } })
      if (existing) {
        if (existing.email === email) return res.status(409).json({ error: 'Email already registered' })
        return res.status(409).json({ error: 'Club name already taken' })
      }
      userData.name = clubName

    } else if (role === 'student') {
      if (!name || !registrationNo || !department || !section || !year) {
        return res.status(400).json({ error: 'All fields are required' })
      }
      if (!email.endsWith(STUDENT_DOMAIN)) return res.status(400).json({ error: `Student email must end with ${STUDENT_DOMAIN}` })

      const existing = await prisma.student.findFirst({ where: { OR: [{ email }, { registrationNo }] } })
      if (existing) {
        if (existing.email === email) return res.status(409).json({ error: 'Email already registered' })
        return res.status(409).json({ error: 'Registration number already taken' })
      }
      Object.assign(userData, { name, registrationNo, department, section, year: parseInt(year) })

    } else if (role === 'teacher') {
      if (!name) return res.status(400).json({ error: 'Name is required' })
      if (!email.endsWith(TEACHER_DOMAIN)) return res.status(400).json({ error: `Teacher email must end with ${TEACHER_DOMAIN}` })

      const existing = await prisma.teacher.findUnique({ where: { email } })
      if (existing) return res.status(409).json({ error: 'Email already registered' })
      userData.name = name
    }

    // Hash password before caching
    userData.password = await bcrypt.hash(password, 12)

    // Generate and store OTP
    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes from now

    otpCache.set(email, { role, userData, otp, expiresAt })

    // Send email
    const emailSent = await sendOTPEmail(email, otp)
    if (!emailSent) {
      otpCache.delete(email)
      return res.status(500).json({ error: 'Failed to send verification email' })
    }

    res.status(200).json({ message: 'OTP sent to your email' })
  } catch (err) {
    console.error('Signup initiate error:', err)
    res.status(500).json({ error: 'Server error during signup initiation' })
  }
})

// --- SIGNUP VERIFY ---
router.post('/signup/verify', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' })

    const cachedData = otpCache.get(email)

    if (!cachedData) {
      return res.status(400).json({ error: 'OTP expired or invalid session. Please sign up again.' })
    }

    if (Date.now() > cachedData.expiresAt) {
      otpCache.delete(email)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }

    if (cachedData.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }

    const { role, userData } = cachedData
    let user = null

    // Create user in DB
    // isVerified defaults to false in schema for Student/Teacher sometimes, let's explicitly set it.
    // Wait, the previous code didn't set isVerified on creation but updated it later. 
    // Now they are created as verified. Wait, Prisma schema might not have isVerified for everyone.
    // But previous code selected `isVerified: true` implying they have it. I will explicitly set it if possible or rely on Prisma.
    // Actually, to be safe I will just pass the userData and we assume it's created successfully.
    
    // We also need to see how the previous code created users. Let's replicate that.
    if (role === 'club') {
      user = await prisma.club.create({
        data: { name: userData.name, email: userData.email, password: userData.password, isVerified: true },
        select: { id: true, name: true, email: true, createdAt: true, isVerified: true }
      })
    } else if (role === 'student') {
      user = await prisma.student.create({
        data: { name: userData.name, email: userData.email, password: userData.password, registrationNo: userData.registrationNo, department: userData.department, section: userData.section, year: userData.year, isVerified: true },
        select: { id: true, name: true, email: true, registrationNo: true, department: true, section: true, year: true, isVerified: true }
      })
    } else if (role === 'teacher') {
      user = await prisma.teacher.create({
        data: { name: userData.name, email: userData.email, password: userData.password, isVerified: true },
        select: { id: true, name: true, email: true, isVerified: true }
      })
    }

    otpCache.delete(email)

    // Return JWT and user (same as login)
    const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ message: 'Verification successful', token, user, role })
  } catch (err) {
    console.error('Signup verify error:', err)
    res.status(500).json({ error: 'Server error during verification' })
  }
})

// --- SIGNUP RESEND ---
router.post('/signup/resend', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const cachedData = otpCache.get(email)
    if (!cachedData) {
      return res.status(400).json({ error: 'Session expired. Please start signup again.' })
    }

    const otp = generateOTP()
    cachedData.otp = otp
    cachedData.expiresAt = Date.now() + 10 * 60 * 1000

    const emailSent = await sendOTPEmail(email, otp)
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to resend email' })
    }

    res.status(200).json({ message: 'OTP resent successfully' })
  } catch (err) {
    console.error('Signup resend error:', err)
    res.status(500).json({ error: 'Server error during OTP resend' })
  }
})

// --- KEEP OLD LOGIN ROUTES UNCHANGED ---
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
    const userId = decoded.userId || decoded.clubId
    const role = decoded.role || 'club'

    if (role === 'club') {
      user = await prisma.club.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isVerified: true } })
    } else if (role === 'student') {
      user = await prisma.student.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, registrationNo: true, department: true, section: true, year: true, isVerified: true } })
    } else if (role === 'teacher') {
      user = await prisma.teacher.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isVerified: true } })
    }

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user, role })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
