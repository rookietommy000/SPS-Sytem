import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import prisma from '../utils/prisma.js'
import { ok, fail } from '../utils/response.js'

const router = Router()

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return fail(res, '請輸入帳號與密碼')

  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true },
  })
  if (!user || !user.isActive) return fail(res, '帳號不存在或已停用', 401)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return fail(res, '密碼錯誤', 401)

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )

  ok(res, {
    token,
    user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role.name },
  })
})

import { authenticate } from '../middlewares/auth.js'

// GET /api/v1/auth/roles
router.get('/roles', authenticate, async (_req, res) => {
  const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } })
  ok(res, roles)
})

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, fullName: true, employeeNo: true, role: { select: { name: true } } },
  })
  ok(res, user)
})

export default router
