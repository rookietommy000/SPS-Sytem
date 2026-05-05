import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, paginated, fail } from '../utils/response.js'
import { authenticate } from '../middlewares/auth.js'
import { genNo } from '../utils/txnNo.js'

const router = Router()
router.use(authenticate)

// GET /api/v1/inventory  庫存全覽（支援產線、設備、低庫存篩選）
router.get('/', async (req, res) => {
  const { equipmentId, productionLineId, lowStock, page = 1, limit = 100 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where = {
    ...(equipmentId      && { equipmentId: Number(equipmentId) }),
    ...(productionLineId && { equipment: { productionLineId: Number(productionLineId) } }),
    ...(lowStock === 'true' && {
      // 庫存數量 <= 最低庫存（用 raw 比較）
      AND: [{ quantity: { lte: prisma.inventory.fields.minStock } }],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.inventory.findMany({
      where, skip, take: Number(limit),
      include: {
        part:      { include: { category: { select: { name: true } } } },
        equipment: { include: { productionLine: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.inventory.count({ where }),
  ])

  // 附加低庫存旗標
  const enriched = data.map(inv => ({
    ...inv,
    isLowStock:   inv.quantity <= inv.minStock,
    isOutOfStock: inv.quantity === 0,
  }))

  paginated(res, enriched, total, Number(page), Number(limit))
})

// GET /api/v1/inventory/low-stock  低庫存清單
router.get('/low-stock', async (_req, res) => {
  const rows = await prisma.$queryRaw`
    SELECT * FROM v_low_stock ORDER BY production_line_code, equipment_code
  `
  ok(res, rows)
})

// POST /api/v1/inventory/stock-in  入庫
router.post('/stock-in', async (req, res) => {
  const { partId, equipmentId, location, quantity, remark, refType, refId } = req.body
  if (!partId || !equipmentId || !quantity) return fail(res, '缺少必要欄位')
  if (quantity <= 0) return fail(res, '入庫數量必須大於 0')

  const result = await _adjustStock({
    partId, equipmentId, location,
    delta:   Number(quantity),
    txnType: 'STOCK_IN',
    remark, refType, refId,
    userId:  req.user.id,
  })
  ok(res, result, '入庫完成')
})

// POST /api/v1/inventory/stock-out  出庫（領用）
router.post('/stock-out', async (req, res) => {
  const { partId, equipmentId, location, quantity, remark } = req.body
  if (!partId || !equipmentId || !quantity) return fail(res, '缺少必要欄位')
  if (quantity <= 0) return fail(res, '出庫數量必須大於 0')

  // 先確認庫存足夠
  const inv = await prisma.inventory.findUnique({ where: { partId_equipmentId: { partId, equipmentId } } })
  if (!inv || inv.quantity < quantity) return fail(res, '庫存不足')

  const result = await _adjustStock({
    partId, equipmentId, location,
    delta:   -Number(quantity),
    txnType: 'STOCK_OUT',
    remark,
    userId:  req.user.id,
  })
  ok(res, result, '出庫完成')
})

// POST /api/v1/inventory/adjust  庫存調整（盤盈/盤虧）
router.post('/adjust', async (req, res) => {
  const { partId, equipmentId, location, quantity, remark } = req.body
  if (!partId || !equipmentId || quantity == null) return fail(res, '缺少必要欄位')

  const inv = await prisma.inventory.findUnique({ where: { partId_equipmentId: { partId, equipmentId } } })
  const before = inv?.quantity ?? 0
  const delta  = Number(quantity) - before
  const txnType = delta >= 0 ? 'ADJUST_PLUS' : 'ADJUST_MINUS'

  const result = await _adjustStock({ partId, equipmentId, location, delta, txnType, remark, userId: req.user.id })
  ok(res, result, '調整完成')
})

// ── 內部：原子性更新庫存 + 寫入異動紀錄 ──
async function _adjustStock({ partId, equipmentId, location, delta, txnType, remark, refType, refId, userId }) {
  return prisma.$transaction(async (tx) => {
    // upsert 庫存
    const inv = await tx.inventory.upsert({
      where:  { partId_equipmentId: { partId, equipmentId } },
      update: { quantity: { increment: delta }, location },
      create: { partId, equipmentId, location, quantity: Math.max(0, delta) },
    })

    // 寫入異動紀錄
    const txn = await tx.stockTransaction.create({
      data: {
        txnNo:          genNo('TXN'),
        txnType,
        partId,
        equipmentId,
        location,
        quantity:       delta,
        quantityBefore: inv.quantity - delta,
        quantityAfter:  inv.quantity,
        refType, refId, remark,
        operatedBy:     userId,
      },
    })

    return { inventory: inv, transaction: txn }
  })
}

export default router
