import { Router } from 'express'
import prisma from '../utils/prisma.js'
import { ok, fail } from '../utils/response.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()
router.use(authenticate)

// GET /api/v1/reports/summary  總覽：庫存金額、品項數、低庫存數
router.get('/summary', async (_req, res) => {
  const [totalParts, totalInventory, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.part.count({ where: { isActive: true } }),
    prisma.inventory.aggregate({
      _sum: { quantity: true },
    }),
    prisma.$queryRaw`SELECT COUNT(*) FROM inventory WHERE quantity <= min_stock`,
    prisma.inventory.count({ where: { quantity: 0 } }),
  ])

  ok(res, {
    totalParts,
    totalQuantity: totalInventory._sum.quantity ?? 0,
    lowStockCount:   Number((lowStockCount)[0].count),
    outOfStockCount,
  })
})

// GET /api/v1/reports/low-stock  低庫存清單
router.get('/low-stock', async (_req, res) => {
  const rows = await prisma.$queryRaw`
    SELECT * FROM v_low_stock ORDER BY production_line_code, equipment_code
  `
  ok(res, rows)
})

// GET /api/v1/reports/stock-value  庫存金額分析（依分類）
router.get('/stock-value', async (_req, res) => {
  const rows = await prisma.$queryRaw`
    SELECT
      c.name                           AS category_name,
      COUNT(DISTINCT p.id)             AS part_count,
      SUM(i.quantity)                  AS total_qty,
      SUM(i.quantity * COALESCE(p.unit_price, 0)) AS total_value
    FROM inventory i
    JOIN parts     p ON p.id = i.part_id
    LEFT JOIN categories c ON c.id = p.category_id
    GROUP BY c.id, c.name
    ORDER BY total_value DESC
  `
  ok(res, rows)
})

// GET /api/v1/reports/transactions  進出統計（月/週）
router.get('/transactions', async (req, res) => {
  const { dateFrom, dateTo, groupBy = 'day' } = req.query
  if (!dateFrom || !dateTo) return fail(res, '請傳入 dateFrom 與 dateTo')

  const trunc = groupBy === 'month' ? 'month' : groupBy === 'week' ? 'week' : 'day'

  const rows = await prisma.$queryRawUnsafe(`
    SELECT
      DATE_TRUNC('${trunc}', operated_at) AS period,
      txn_type,
      COUNT(*)                             AS txn_count,
      SUM(ABS(quantity))                   AS total_qty
    FROM stock_transactions
    WHERE operated_at BETWEEN $1 AND $2
    GROUP BY period, txn_type
    ORDER BY period, txn_type
  `, new Date(dateFrom), new Date(dateTo + 'T23:59:59Z'))

  ok(res, rows)
})

// GET /api/v1/reports/top-usage  用量排行（出庫最多）
router.get('/top-usage', async (req, res) => {
  const { limit = 10, dateFrom, dateTo } = req.query

  const dateFilter = dateFrom && dateTo
    ? `AND operated_at BETWEEN '${dateFrom}' AND '${dateTo}T23:59:59Z'`
    : ''

  const rows = await prisma.$queryRawUnsafe(`
    SELECT
      p.id,
      p.name,
      p.part_no,
      p.brand,
      p.unit,
      SUM(ABS(st.quantity)) AS used_qty,
      COUNT(*)              AS txn_count
    FROM stock_transactions st
    JOIN parts p ON p.id = st.part_id
    WHERE st.txn_type = 'STOCK_OUT'
    ${dateFilter}
    GROUP BY p.id, p.name, p.part_no, p.brand, p.unit
    ORDER BY used_qty DESC
    LIMIT $1
  `, Number(limit))

  ok(res, rows)
})

// GET /api/v1/reports/inventory-by-line  各產線庫存總覽
router.get('/inventory-by-line', async (_req, res) => {
  const rows = await prisma.$queryRaw`
    SELECT
      pl.code  AS line_code,
      pl.name  AS line_name,
      COUNT(DISTINCT e.id)   AS equipment_count,
      COUNT(DISTINCT i.part_id) AS part_count,
      SUM(i.quantity)        AS total_qty
    FROM production_lines pl
    LEFT JOIN equipment     e  ON e.production_line_id = pl.id  AND e.is_active = true
    LEFT JOIN inventory     i  ON i.equipment_id = e.id
    WHERE pl.is_active = true
    GROUP BY pl.id, pl.code, pl.name
    ORDER BY pl.code
  `
  ok(res, rows)
})

export default router
