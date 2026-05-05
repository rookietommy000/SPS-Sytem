import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, created, paginated, fail } from '../utils/response.js'
import { authenticate, requireRole } from '../middlewares/auth.js'
import { genNo } from '../utils/txnNo.js'

const router = Router()
router.use(authenticate)

// ── 採購申請 ──────────────────────────────────────────────

// GET /api/v1/purchase/requests
router.get('/requests', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const skip  = (Number(page) - 1) * Number(limit)
  const where = { ...(status && { status }) }

  const [data, total] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where, skip, take: Number(limit),
      include: {
        requester: { select: { fullName: true } },
        approver:  { select: { fullName: true } },
        items:     { include: { part: { select: { name: true, unit: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseRequest.count({ where }),
  ])
  paginated(res, data, total, Number(page), Number(limit))
})

// POST /api/v1/purchase/requests  建立採購申請
router.post('/requests', async (req, res) => {
  const { reason, items } = req.body
  if (!items?.length) return fail(res, '請至少新增一項備品')

  const request = await prisma.purchaseRequest.create({
    data: {
      requestNo:   genNo('REQ'),
      reason,
      requestedBy: req.user.id,
      items: { create: items.map(i => ({ partId: i.partId, quantity: i.quantity, remark: i.remark })) },
    },
    include: { items: true },
  })
  created(res, request)
})

// PATCH /api/v1/purchase/requests/:id/approve  核准
router.patch('/requests/:id/approve', requireRole('admin', 'warehouse'), async (req, res) => {
  const request = await prisma.purchaseRequest.update({
    where: { id: req.params.id },
    data:  { status: 'APPROVED', approvedBy: req.user.id, approvedAt: new Date() },
  })
  ok(res, request, '已核准')
})

// PATCH /api/v1/purchase/requests/:id/reject  退回
router.patch('/requests/:id/reject', requireRole('admin', 'warehouse'), async (req, res) => {
  const { rejectReason } = req.body
  const request = await prisma.purchaseRequest.update({
    where: { id: req.params.id },
    data:  { status: 'REJECTED', approvedBy: req.user.id, rejectReason },
  })
  ok(res, request, '已退回')
})

// ── 採購單 ────────────────────────────────────────────────

// GET /api/v1/purchase/orders
router.get('/orders', async (req, res) => {
  const { status, supplierId, page = 1, limit = 20 } = req.query
  const skip  = (Number(page) - 1) * Number(limit)
  const where = {
    ...(status     && { status }),
    ...(supplierId && { supplierId }),
  }

  const [data, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where, skip, take: Number(limit),
      include: {
        supplier: { select: { name: true, supplierType: true } },
        creator:  { select: { fullName: true } },
        items:    { include: { part: { select: { name: true, unit: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseOrder.count({ where }),
  ])
  paginated(res, data, total, Number(page), Number(limit))
})

// POST /api/v1/purchase/orders  建立採購單
router.post('/orders', async (req, res) => {
  const { supplierId, orderDate, expectedDate, currency, remark, items } = req.body
  if (!supplierId)   return fail(res, '請選擇供應商')
  if (!items?.length) return fail(res, '請至少新增一項備品')

  const totalAmount = items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0)

  const order = await prisma.purchaseOrder.create({
    data: {
      poNo: genNo('PO'),
      supplierId, orderDate, expectedDate,
      currency: currency || 'TWD',
      totalAmount, remark,
      createdBy: req.user.id,
      items: {
        create: items.map(i => ({
          partId: i.partId, quantity: i.quantity,
          unitPrice: i.unitPrice, remark: i.remark,
        })),
      },
    },
    include: { items: true },
  })
  created(res, order)
})

// PATCH /api/v1/purchase/orders/:id/receive  確認到貨（觸發入庫）
router.patch('/orders/:id/receive', async (req, res) => {
  const { receivedItems } = req.body
  // receivedItems: [{ itemId, receivedQty }]

  await prisma.$transaction(async (tx) => {
    for (const ri of receivedItems) {
      const item = await tx.purchaseOrderItem.update({
        where: { id: BigInt(ri.itemId) },
        data:  { receivedQty: { increment: ri.receivedQty } },
        include: { purchaseOrder: true },
      })

      // 寫入入庫紀錄（需補上 equipmentId，此處由前端傳入）
      if (ri.equipmentId) {
        await tx.inventory.upsert({
          where:  { partId_equipmentId: { partId: item.partId, equipmentId: ri.equipmentId } },
          update: { quantity: { increment: ri.receivedQty } },
          create: { partId: item.partId, equipmentId: ri.equipmentId, quantity: ri.receivedQty },
        })
        await tx.stockTransaction.create({
          data: {
            txnNo: genNo('TXN'), txnType: 'STOCK_IN',
            partId: item.partId, equipmentId: ri.equipmentId,
            quantity: ri.receivedQty,
            quantityBefore: 0, quantityAfter: ri.receivedQty,
            refType: 'purchase_order', refId: item.poId,
            operatedBy: req.user.id,
          },
        })
      }
    }

    // 更新採購單狀態
    const order = await tx.purchaseOrder.findUnique({
      where: { id: req.params.id }, include: { items: true },
    })
    const allReceived = order.items.every(i => i.receivedQty >= i.quantity)
    await tx.purchaseOrder.update({
      where: { id: req.params.id },
      data:  { status: allReceived ? 'COMPLETED' : 'PARTIAL' },
    })
  })

  ok(res, null, '到貨確認完成')
})

export default router
