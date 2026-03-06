import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { clubName, email, password } = req.body

    if (!clubName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const existing = await prisma.club.findFirst({
      where: { OR: [{ email }, { name: clubName }] }
    })

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ error: 'Email already registered' })
      }
      return res.status(409).json({ error: 'Club name already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const club = await prisma.club.create({
      data: { name: clubName, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }
    })

    const token = jwt.sign({ clubId: club.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ token, club })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error during signup' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const club = await prisma.club.findUnique({ where: { email } })

    if (!club) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, club.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const expiresIn = rememberMe ? '30d' : '7d'
    const token = jwt.sign({ clubId: club.id }, process.env.JWT_SECRET, { expiresIn })

    const { password: _, ...clubData } = club
    res.json({ token, club: clubData })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login' })
  }
})

// Get current club
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const club = await prisma.club.findUnique({
      where: { id: decoded.clubId },
      select: { id: true, name: true, email: true, createdAt: true }
    })

    if (!club) return res.status(404).json({ error: 'Club not found' })
    res.json({ club })
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
