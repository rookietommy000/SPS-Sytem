import jwt from 'jsonwebtoken'
import { fail } from '../utils/response.js'

const DEV_MODE = process.env.NODE_ENV !== 'production'

export const authenticate = (req, res, next) => {
  if (DEV_MODE) {
    req.user = { id: 'dev-user', username: 'admin', role: 'admin' }
    return next()
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return fail(res, '請先登入', 401)

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    fail(res, '登入憑證無效或已過期', 401)
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (DEV_MODE) return next()
  if (!roles.includes(req.user?.role)) return fail(res, '權限不足', 403)
  next()
}
