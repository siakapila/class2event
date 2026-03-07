import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticateRole } from '../middleware/auth.js'

const router = Router()

// All club routes require club role
router.use(authenticateRole('club'))

// Get all events for authenticated club
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { clubId: req.user.id },
      include: {
        registrations: { include: { members: true } },
        organizers: true
      },
      orderBy: { date: 'asc' }
    })
    res.json({ events })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.user.id },
      include: {
        registrations: {
          include: { members: { include: { student: { select: { name: true, email: true, className: true, registrationNo: true } } } } }
        },
        organizers: {
          include: { student: { select: { name: true, email: true, className: true, registrationNo: true } } }
        }
      }
    })

    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json({ event })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// Create event
router.post('/', async (req, res) => {
  try {
    const { name, venue, date, duration, description, organizers } = req.body

    if (!name || !venue || !date || !duration) {
      return res.status(400).json({ error: 'Name, venue, date, and duration are required' })
    }

    // Resolve organizers by email
    const orgIds = []
    if (organizers && organizers.length) {
      const students = await prisma.student.findMany({
        where: { email: { in: organizers.map(e => e.toLowerCase()) } }
      })
      if (students.length !== organizers.length) {
        return res.status(400).json({ error: 'One or more organizer emails are not registered students' })
      }
      orgIds.push(...students.map(s => s.id))
    }

    const event = await prisma.event.create({
      data: {
        name,
        venue,
        date: new Date(date),
        duration: parseInt(duration),
        description,
        clubId: req.user.id,
        organizers: {
          create: orgIds.map(studentId => ({ studentId }))
        }
      },
      include: { organizers: true }
    })

    res.status(201).json({ event })
  } catch (err) {
    console.error('Create event error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// Update event
router.put('/:id', async (req, res) => {
  try {
    const { name, venue, date, duration, description, organizers } = req.body

    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.user.id }
    })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    const orgIds = []
    if (organizers && organizers.length) {
      const students = await prisma.student.findMany({
        where: { email: { in: organizers.map(e => e.toLowerCase()) } }
      })
      if (students.length !== organizers.length) {
        return res.status(400).json({ error: 'One or more organizer emails are not registered students' })
      }
      orgIds.push(...students.map(s => s.id))
    }

    await prisma.eventOrganizer.deleteMany({ where: { eventId: req.params.id } })

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        name, venue, description,
        date: date ? new Date(date) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        organizers: {
          create: orgIds.map(studentId => ({ studentId }))
        }
      },
      include: { organizers: { include: { student: true } } }
    })

    res.json({ event })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Verify or Reject a registration
router.put('/:eventId/registrations/:regId', async (req, res) => {
  try {
    const { status } = req.body
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const event = await prisma.event.findFirst({
      where: { id: req.params.eventId, clubId: req.user.id }
    })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.regId, eventId: req.params.eventId },
      data: { status }
    })

    res.json({ registration })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update registration status' })
  }
})

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.user.id }
    })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ message: 'Event deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
