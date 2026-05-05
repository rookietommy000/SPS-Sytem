import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, created, paginated, fail } from '../utils/response.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()
router.use(authenticate)

// GET /api/v1/parts  查詢備品清單（支援分頁、篩選、搜尋）
router.get('/', async (req, res) => {
  const { q, categoryId, isActive = 'true', page = 1, limit = 50 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {
    isActive: isActive === 'true',
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(q && {
      OR: [
        { name:               { contains: q, mode: 'insensitive' } },
        { partNo:             { contains: q, mode: 'insensitive' } },
        { internalPartNo:     { contains: q, mode: 'insensitive' } },
        { manufacturerPartNo: { contains: q, mode: 'insensitive' } },
        { brand:              { contains: q, mode: 'insensitive' } },
        { modelNo:            { contains: q, mode: 'insensitive' } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.part.findMany({
      where, skip, take: Number(limit),
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.part.count({ where }),
  ])

  paginated(res, data, total, Number(page), Number(limit))
})

// GET /api/v1/parts/:id  單筆備品詳細（含庫存、供應商）
router.get('/:id', async (req, res) => {
  const part = await prisma.part.findUnique({
    where: { id: req.params.id },
    include: {
      category:     { select: { id: true, name: true } },
      partSuppliers: { include: { supplier: { select: { id: true, name: true, supplierType: true } } } },
      inventory:    { include: { equipment: { include: { productionLine: true } } } },
    },
  })
  if (!part) return fail(res, '備品不存在', 404)
  ok(res, part)
})

// POST /api/v1/parts  新增備品
router.post('/', async (req, res) => {
  const { partNo, internalPartNo, manufacturerPartNo, name, specDescription,
          categoryId, brand, modelNo, unit, isSubstitutable, substituteNote,
          sharedEquipment, minStock, quotationRef } = req.body

  if (!name) return fail(res, '品名為必填')

  const part = await prisma.part.create({
    data: {
      partNo, internalPartNo, manufacturerPartNo, name, specDescription,
      categoryId, brand, modelNo, unit: unit || '個',
      isSubstitutable: !!isSubstitutable, substituteNote,
      sharedEquipment, minStock: Number(minStock) || 0, quotationRef,
      createdBy: req.user.id,
    },
  })
  created(res, part)
})

// PATCH /api/v1/parts/:id  更新備品
router.patch('/:id', async (req, res) => {
  const allowed = ['partNo','internalPartNo','manufacturerPartNo','name','specDescription',
                   'categoryId','brand','modelNo','unit','isSubstitutable','substituteNote',
                   'sharedEquipment','minStock','quotationRef','isActive']
  const data = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  )
  const part = await prisma.part.update({ where: { id: req.params.id }, data })
  ok(res, part)
})

// DELETE /api/v1/parts/:id  軟刪除（設為停用）
router.delete('/:id', async (req, res) => {
  await prisma.part.update({ where: { id: req.params.id }, data: { isActive: false } })
  ok(res, null, '已停用')
})

export default router
