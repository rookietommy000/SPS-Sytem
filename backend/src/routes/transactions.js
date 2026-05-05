import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, paginated } from '../utils/response.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()
router.use(authenticate)

// GET /api/v1/transactions  進出紀錄查詢
router.get('/', async (req, res) => {
  const { partId, equipmentId, txnType, operatedBy,
          dateFrom, dateTo, page = 1, limit = 50 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {
    ...(partId      && { partId }),
    ...(equipmentId && { equipmentId: Number(equipmentId) }),
    ...(txnType     && { txnType }),
    ...(operatedBy  && { operatedBy }),
    ...((dateFrom || dateTo) && {
      operatedAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo   && { lte: new Date(dateTo + 'T23:59:59Z') }),
      },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.stockTransaction.findMany({
      where, skip, take: Number(limit),
      include: {
        part:      { select: { name: true, brand: true, modelNo: true, unit: true } },
        equipment: { include: { productionLine: { select: { code: true } } } },
        operator:  { select: { fullName: true, employeeNo: true } },
      },
      orderBy: { operatedAt: 'desc' },
    }),
    prisma.stockTransaction.count({ where }),
  ])

  paginated(res, data, total, Number(page), Number(limit))
})

// GET /api/v1/transactions/:id
router.get('/:id', async (req, res) => {
  const txn = await prisma.stockTransaction.findUnique({
    where: { id: BigInt(req.params.id) },
    include: {
      part:      true,
      equipment: { include: { productionLine: true } },
      operator:  { select: { fullName: true, employeeNo: true } },
    },
  })
  ok(res, txn)
})

export default router
