import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Get all events for authenticated club
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { clubId: req.club.id },
      include: {
        teams: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { date: 'asc' }
    })
    res.json({ events })
  } catch (err) {
    console.error('Get events error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// Get single event
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.club.id },
      include: { teams: { orderBy: { createdAt: 'asc' } } }
    })

    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json({ event })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// Create event
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, venue, date, duration, description, teams } = req.body

    if (!name || !venue || !date || !duration) {
      return res.status(400).json({ error: 'Name, venue, date, and duration are required' })
    }

    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }

    if (duration < 1 || duration > 1440) {
      return res.status(400).json({ error: 'Duration must be between 1 and 1440 minutes' })
    }

    const event = await prisma.event.create({
      data: {
        name,
        venue,
        date: new Date(date),
        duration: parseInt(duration),
        description,
        clubId: req.club.id,
        teams: {
          create: (teams || []).map(t => ({
            teamName: t.teamName,
            memberName: t.memberName,
            role: t.role || 'member'
          }))
        }
      },
      include: { teams: true }
    })

    res.status(201).json({ event })
  } catch (err) {
    console.error('Create event error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// Update event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, venue, date, duration, description, teams } = req.body

    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.club.id }
    })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    // Delete existing team members and recreate
    await prisma.teamMember.deleteMany({ where: { eventId: req.params.id } })

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        name,
        venue,
        date: date ? new Date(date) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        description,
        teams: {
          create: (teams || []).map(t => ({
            teamName: t.teamName,
            memberName: t.memberName,
            role: t.role || 'member'
          }))
        }
      },
      include: { teams: true }
    })

    res.json({ event })
  } catch (err) {
    console.error('Update event error:', err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Delete event
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.event.findFirst({
      where: { id: req.params.id, clubId: req.club.id }
    })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ message: 'Event deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
