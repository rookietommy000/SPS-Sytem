import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, created, fail } from '../utils/response.js'
import { authenticate } from '../middlewares/auth.js'
import { genNo } from '../utils/txnNo.js'

const router = Router()
router.use(authenticate)

// GET /api/v1/counts  盤點單列表
router.get('/', async (_req, res) => {
  const counts = await prisma.inventoryCount.findMany({
    include: {
      equipment: { include: { productionLine: true } },
      creator:   { select: { fullName: true } },
      _count:    { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  ok(res, counts)
})

// POST /api/v1/counts  建立盤點單（自動帶入系統庫存數量）
router.post('/', async (req, res) => {
  const { equipmentId, countDate, remark } = req.body
  if (!countDate) return fail(res, '請填入盤點日期')

  // 取得該設備所有庫存作為盤點明細
  const invList = await prisma.inventory.findMany({
    where: equipmentId ? { equipmentId: Number(equipmentId) } : {},
  })

  const count = await prisma.inventoryCount.create({
    data: {
      countNo:    genNo('CNT'),
      equipmentId: equipmentId ? Number(equipmentId) : undefined,
      countDate:  new Date(countDate),
      remark,
      createdBy:  req.user.id,
      items: {
        create: invList.map(inv => ({
          partId:      inv.partId,
          equipmentId: inv.equipmentId,
          location:    inv.location,
          systemQty:   inv.quantity,
        })),
      },
    },
    include: { items: true },
  })
  created(res, count)
})

// GET /api/v1/counts/:id  盤點單明細
router.get('/:id', async (req, res) => {
  const count = await prisma.inventoryCount.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          part:      { select: { name: true, brand: true, modelNo: true, unit: true } },
          equipment: { select: { code: true } },
        },
      },
    },
  })
  if (!count) return fail(res, '盤點單不存在', 404)
  ok(res, count)
})

// PATCH /api/v1/counts/:id/items  填入實盤數量
router.patch('/:id/items', async (req, res) => {
  const { items } = req.body
  // items: [{ id, countedQty, remark }]

  await prisma.$transaction(
    items.map(i =>
      prisma.inventoryCountItem.update({
        where: { id: BigInt(i.id) },
        data:  { countedQty: i.countedQty, remark: i.remark },
      })
    )
  )
  ok(res, null, '已更新盤點數量')
})

// POST /api/v1/counts/:id/close  完成盤點（關帳）
router.post('/:id/close', async (req, res) => {
  await prisma.inventoryCount.update({
    where: { id: req.params.id },
    data:  { status: 'CLOSED', closedBy: req.user.id, closedAt: new Date() },
  })
  ok(res, null, '盤點已關帳')
})

// POST /api/v1/counts/:id/adjust  確認差異並調整庫存
router.post('/:id/adjust', async (req, res) => {
  const count = await prisma.inventoryCount.findUnique({
    where: { id: req.params.id }, include: { items: true },
  })
  if (!count) return fail(res, '盤點單不存在', 404)
  if (count.status !== 'CLOSED') return fail(res, '請先關帳再調整')

  await prisma.$transaction(async (tx) => {
    for (const item of count.items) {
      if (item.countedQty == null) continue
      const diff = item.countedQty - item.systemQty
      if (diff === 0) continue

      await tx.inventory.update({
        where: { partId_equipmentId: { partId: item.partId, equipmentId: item.equipmentId } },
        data:  { quantity: item.countedQty },
      })
      await tx.stockTransaction.create({
        data: {
          txnNo: genNo('TXN'),
          txnType:        diff > 0 ? 'ADJUST_PLUS' : 'ADJUST_MINUS',
          partId:         item.partId,
          equipmentId:    item.equipmentId,
          location:       item.location,
          quantity:       diff,
          quantityBefore: item.systemQty,
          quantityAfter:  item.countedQty,
          refType: 'inventory_count', refId: count.id,
          operatedBy: req.user.id,
        },
      })
    }
    await tx.inventoryCount.update({
      where: { id: req.params.id }, data: { status: 'ADJUSTED' },
    })
  })

  ok(res, null, '差異已調整入帳')
})

export default router
