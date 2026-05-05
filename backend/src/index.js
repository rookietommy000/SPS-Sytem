import express from 'express'
import cors    from 'cors'

import authRouter         from './routes/auth.js'
import partsRouter        from './routes/parts.js'
import inventoryRouter    from './routes/inventory.js'
import transactionsRouter from './routes/transactions.js'
import purchaseRouter     from './routes/purchase.js'
import countsRouter       from './routes/counts.js'
import settingsRouter     from './routes/settings.js'
import reportsRouter      from './routes/reports.js'

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 健康檢查
app.get('/health', (_req, res) => res.json({ ok: true }))

// API 路由
app.use('/api/v1/auth',         authRouter)
app.use('/api/v1/parts',        partsRouter)
app.use('/api/v1/inventory',    inventoryRouter)
app.use('/api/v1/transactions', transactionsRouter)
app.use('/api/v1/purchase',     purchaseRouter)
app.use('/api/v1/counts',       countsRouter)
app.use('/api/v1/settings',     settingsRouter)
app.use('/api/v1/reports',      reportsRouter)

// 統一錯誤處理
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ success: false, message: err.message || '伺服器錯誤' })
})

app.listen(PORT, () => console.log(`SPS API running on port ${PORT}`))
