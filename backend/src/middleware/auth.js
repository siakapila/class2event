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

    req.user = {
      id: decoded.userId || decoded.clubId,
      role: decoded.role || 'club'
    }

    // Keep backwards compatibility for legacy club requests
    if (req.user.role === 'club') {
      const club = await prisma.club.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true }
      })
      if (!club) return res.status(401).json({ error: 'Club not found' })
      req.club = club
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const authenticateRole = (role) => {
  return async (req, res, next) => {
    await authenticate(req, res, () => {
      if (req.user && req.user.role !== role) {
        return res.status(403).json({ error: 'Access denied: Incorrect role' })
      }
      next()
    })
  }
}
