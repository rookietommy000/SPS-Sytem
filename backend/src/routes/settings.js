import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma.js'
import { ok, created, fail } from '../utils/response.js'
import { authenticate, requireRole } from '../middlewares/auth.js'

const router = Router()
router.use(authenticate)

// ── 產線 ──────────────────────────────────────────────────

router.get('/lines', async (_req, res) => {
  const lines = await prisma.productionLine.findMany({
    include: { _count: { select: { equipment: true } } },
    orderBy: { code: 'asc' },
  })
  ok(res, lines)
})

router.post('/lines', requireRole('admin'), async (req, res) => {
  const { code, name } = req.body
  if (!code) return fail(res, '代碼為必填')
  const line = await prisma.productionLine.create({ data: { code, name } })
  created(res, line)
})

router.patch('/lines/:id', requireRole('admin'), async (req, res) => {
  const { code, name, isActive } = req.body
  const line = await prisma.productionLine.update({
    where: { id: Number(req.params.id) }, data: { code, name, isActive },
  })
  ok(res, line)
})

// ── 設備 ──────────────────────────────────────────────────

router.get('/equipment', async (req, res) => {
  const { productionLineId } = req.query
  const equipment = await prisma.equipment.findMany({
    where: productionLineId ? { productionLineId: Number(productionLineId) } : {},
    include: { productionLine: { select: { code: true } } },
    orderBy: [{ productionLineId: 'asc' }, { code: 'asc' }],
  })
  ok(res, equipment)
})

router.post('/equipment', requireRole('admin'), async (req, res) => {
  const { productionLineId, code, name } = req.body
  if (!productionLineId || !code) return fail(res, '產線與代碼為必填')
  const eq = await prisma.equipment.create({
    data: { productionLineId: Number(productionLineId), code, name },
  })
  created(res, eq)
})

router.patch('/equipment/:id', requireRole('admin'), async (req, res) => {
  const { code, name, isActive } = req.body
  const eq = await prisma.equipment.update({
    where: { id: Number(req.params.id) }, data: { code, name, isActive },
  })
  ok(res, eq)
})

// ── 備品分類 ──────────────────────────────────────────────

router.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { parts: true } } },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  })
  ok(res, categories)
})

router.post('/categories', requireRole('admin'), async (req, res) => {
  const { code, name, parentId, level, sortOrder } = req.body
  if (!code || !name) return fail(res, '代碼與名稱為必填')
  const cat = await prisma.category.create({
    data: { code, name, parentId, level: level || 1, sortOrder: sortOrder || 0 },
  })
  created(res, cat)
})

// ── 供應商 ────────────────────────────────────────────────

router.get('/suppliers', async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    include: { _count: { select: { partSuppliers: true } } },
    orderBy: { name: 'asc' },
  })
  ok(res, suppliers)
})

router.post('/suppliers', requireRole('admin', 'warehouse'), async (req, res) => {
  const { code, name, supplierType, contact, phone, email, address, taxId, paymentTerms } = req.body
  if (!code || !name) return fail(res, '代碼與名稱為必填')
  const supplier = await prisma.supplier.create({
    data: { code, name, supplierType, contact, phone, email, address, taxId, paymentTerms },
  })
  created(res, supplier)
})

router.patch('/suppliers/:id', requireRole('admin', 'warehouse'), async (req, res) => {
  const allowed = ['name','supplierType','contact','phone','email','address','taxId','paymentTerms','isActive']
  const data    = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data })
  ok(res, supplier)
})

// ── 使用者 ────────────────────────────────────────────────

router.get('/users', requireRole('admin'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, employeeNo: true, username: true, fullName: true, isActive: true, role: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  ok(res, users)
})

router.post('/users', requireRole('admin'), async (req, res) => {
  const { employeeNo, username, password, fullName, roleId } = req.body
  if (!username || !password || !fullName || !roleId) return fail(res, '缺少必要欄位')

  const hashed = await bcrypt.hash(password, 10)
  const user   = await prisma.user.create({
    data: { employeeNo, username, password: hashed, fullName, roleId: Number(roleId) },
    select: { id: true, username: true, fullName: true },
  })
  created(res, user)
})

router.patch('/users/:id', requireRole('admin'), async (req, res) => {
  const { fullName, isActive, roleId, password } = req.body
  const data = {
    ...(fullName  != null && { fullName }),
    ...(isActive  != null && { isActive }),
    ...(roleId    != null && { roleId: Number(roleId) }),
    ...(password           && { password: await bcrypt.hash(password, 10) }),
  }
  const user = await prisma.user.update({
    where: { id: req.params.id }, data,
    select: { id: true, username: true, fullName: true, isActive: true },
  })
  ok(res, user)
})

export default router
