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

    const userId = decoded.userId || decoded.clubId
    const role = decoded.role || 'club'
    let dbUser = null

    if (role === 'club') {
      dbUser = await prisma.club.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isVerified: true } })
    } else if (role === 'student') {
      dbUser = await prisma.student.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, registrationNo: true, className: true, year: true, isVerified: true } })
    } else if (role === 'teacher') {
      dbUser = await prisma.teacher.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, isVerified: true } })
    }

    if (!dbUser) {
      return res.status(401).json({ error: 'User not found or deleted' })
    }

    // Require verification for all protected endpoints
    if (!dbUser.isVerified) {
      return res.status(403).json({ error: 'Please verify your email to access this feature' })
    }

    req.user = {
      id: userId,
      role: role,
      ...dbUser
    }

    // Keep backwards compatibility for legacy club requests relying on req.club
    if (role === 'club') req.club = dbUser

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
