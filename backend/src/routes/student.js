import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticateRole } from '../middleware/auth.js'

const router = Router()

// All student routes require student role
router.use(authenticateRole('student'))

// Get all upcoming events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        club: { select: { name: true } }
      }
    })
    res.json({ events })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// Get my registrations and organized events
router.get('/me', async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        members: { some: { studentId: req.user.id } }
      },
      include: {
        event: { select: { name: true, date: true, club: { select: { name: true } } } },
        members: { include: { student: { select: { name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const organized = await prisma.eventOrganizer.findMany({
      where: { studentId: req.user.id },
      include: {
        event: { select: { name: true, date: true, club: { select: { name: true } } } }
      }
    })

    res.json({ registrations, organized })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student profile data' })
  }
})

// Register for an event
router.post('/events/:id/register', async (req, res) => {
  try {
    const { teamName, members } = req.body // members is an array of emails
    if (!members || !members.length) return res.status(400).json({ error: 'At least one participant is required' })

    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    // Include the current student if not already in the list
    const myStudent = await prisma.student.findUnique({ where: { id: req.user.id } })
    const allEmails = new Set(members.map(e => e.toLowerCase()))
    allEmails.add(myStudent.email.toLowerCase())
    
    const emailArray = Array.from(allEmails)
    const students = await prisma.student.findMany({
      where: { email: { in: emailArray } }
    })

    if (students.length !== emailArray.length) {
      const foundEmails = students.map(s => s.email.toLowerCase())
      const missing = emailArray.filter(e => !foundEmails.includes(e))
      return res.status(400).json({ error: `Not all emails are registered students. Missing: ${missing.join(', ')}` })
    }

    // Check if any student is already registered for this event
    const existingReg = await prisma.registrationMember.findFirst({
      where: {
        studentId: { in: students.map(s => s.id) },
        registration: { eventId: req.params.id }
      },
      include: { student: true }
    })
    
    if (existingReg) {
      return res.status(400).json({ error: `${existingReg.student.email} is already registered for this event` })
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: req.params.id,
        teamName: teamName || null,
        members: {
          create: students.map(s => ({
            studentId: s.id
          }))
        }
      },
      include: { members: { include: { student: { select: { name: true, email: true } } } } }
    })

    res.status(201).json({ registration })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Failed to process registration' })
  }
})

// Search students by email (for adding team members)
router.get('/search-students', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) return res.json({ students: [] })

    const students = await prisma.student.findMany({
      where: { email: { contains: email, mode: 'insensitive' } },
      select: { name: true, email: true, className: true },
      take: 5
    })
    res.json({ students })
  } catch (err) {
    res.status(500).json({ error: 'Failed to search students' })
  }
})

export default router
