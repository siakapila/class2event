import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authenticateRole } from '../middleware/auth.js'

const router = Router()

// All teacher routes require teacher role
router.use(authenticateRole('teacher'))

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const events = await prisma.event.findMany({
      where: { date: { gte: today } },
      include: {
        club: { select: { name: true } },
        organizers: {
          select: {
            student: { select: { name: true, registrationNo: true, department: true, section: true, year: true, email: true } }
          }
        },
        registrations: {
          where: { status: 'VERIFIED' },
          include: {
            members: {
              include: { student: { select: { name: true, registrationNo: true, department: true, section: true, year: true, email: true } } }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    res.json({ events })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch teacher dashboard data' })
  }
})

router.get('/section-attendance', async (req, res) => {
  try {
    const { department, section } = req.query
    if (!department || !section) return res.status(400).json({ error: 'Department and Section are required' })

    const students = await prisma.student.findMany({
      where: { department, section },
      select: {
        id: true,
        name: true,
        registrationNo: true,
        department: true,
        section: true,
        year: true,
        organizedEvents: {
          include: { event: { select: { name: true, date: true } } }
        },
        registrations: {
          where: { registration: { status: 'VERIFIED' } },
          include: { registration: { include: { event: { select: { name: true, date: true } } } } }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    const report = students.map(s => {
      const eventsAttended = s.registrations.map(r => ({
        name: r.registration.event.name,
        date: r.registration.event.date,
        role: 'Participant'
      }))
      const eventsOrganized = s.organizedEvents.map(o => ({
        name: o.event.name,
        date: o.event.date,
        role: 'Organizer'
      }))
      const allEvents = [...eventsAttended, ...eventsOrganized].sort((a,b) => new Date(a.date) - new Date(b.date))
      
      return {
        id: s.id,
        name: s.name,
        registrationNo: s.registrationNo,
        department: s.department,
        section: s.section,
        year: s.year,
        totalEvents: allEvents.length,
        events: allEvents
      }
    })

    res.json({ students: report })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch section attendance' })
  }
})

export default router
