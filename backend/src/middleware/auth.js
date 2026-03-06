import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const club = await prisma.club.findUnique({
      where: { id: decoded.clubId },
      select: { id: true, name: true, email: true }
    })

    if (!club) {
      return res.status(401).json({ error: 'Club not found' })
    }

    req.club = club
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}
