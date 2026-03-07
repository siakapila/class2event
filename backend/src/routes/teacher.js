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
          include: { student: { select: { name: true, registrationNo: true, className: true, year: true, email: true } } }
        },
        registrations: {
          where: { status: 'VERIFIED' },
          include: {
            members: {
              include: { student: { select: { name: true, registrationNo: true, className: true, year: true, email: true } } }
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

export default router
