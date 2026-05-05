import { useState, useEffect } from 'react'
import { TOKENS } from '../tokens'
import { StatusPill, StockBar, Notice } from '../components/ui'
import Icon from '../components/Icon'
import { api } from '../api/client'

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={22}/>
      </div>
      <div>
        <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [summary,   setSummary]   = useState(null)
  const [lowStock,  setLowStock]  = useState([])
  const [txns,      setTxns]      = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/low-stock'),
      api.get('/transactions?limit=5'),
    ]).then(([s, ls, t]) => {
      setSummary(s.data)
      setLowStock(ls.data ?? [])
      setTxns(t.data ?? [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TOKENS.bg }}>
      <div style={{ color: TOKENS.muted, fontSize: 14 }}>載入中…</div>
    </main>
  )

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, padding: '24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>儀表板</h1>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 4 }}>最後更新：{new Date().toLocaleString('zh-TW')}</div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="總備品種類"    value={summary?.totalParts}      sub="管理中"     color={TOKENS.brand}  icon="boxes"   />
        <KpiCard label="低庫存 / 缺料" value={summary?.lowStockCount}   sub="需注意"     color={TOKENS.warn}   icon="bell"    />
        <KpiCard label="零庫存項目"    value={summary?.outOfStockCount} sub="請儘速採購" color={TOKENS.danger} icon="package" />
        <KpiCard label="總庫存量"      value={summary?.totalQuantity}   sub="件"         color={TOKENS.info}   icon="history" />
      </div>

      {/* 低庫存警示 */}
      {lowStock.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Notice kind="danger" icon="bell">
            <strong>注意：</strong>共 {lowStock.length} 項備品低於最低庫存，請儘速採購補貨
          </Notice>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 低庫存清單 */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>低庫存 / 需採購</span>
            <span style={{ fontSize: 11, color: TOKENS.muted }}>{lowStock.length} 項</span>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>目前無低庫存項目</div>
          ) : lowStock.slice(0, 8).map((p, i) => (
            <div key={i} style={{ padding: '12px 18px', borderBottom: i < lowStock.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusPill status="低庫存"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.part_name}</div>
                <div style={{ fontSize: 11, color: TOKENS.muted }}>{p.equipment_code} · {p.location ?? '—'}</div>
              </div>
              <StockBar stock={Number(p.quantity)} min={Number(p.min_stock)} width={60}/>
            </div>
          ))}
        </div>

        {/* 最近進出紀錄 */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>最近進出紀錄</span>
            <span style={{ fontSize: 11, color: TOKENS.muted }}>最近 5 筆</span>
          </div>
          {txns.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>尚無紀錄</div>
          ) : txns.map((t, i) => {
            const isIn = t.txnType === 'STOCK_IN' || t.txnType === 'ADJUST_PLUS' || t.txnType === 'RETURN_IN'
            return (
              <div key={String(t.id)} style={{ padding: '12px 18px', borderBottom: i < txns.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.part?.name ?? '—'}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{t.operator?.fullName ?? '—'} · {t.equipment?.code ?? '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace,Menlo,monospace', color: isIn ? TOKENS.ok : TOKENS.danger }}>
                    {isIn ? '+' : ''}{t.quantity}
                  </div>
                  <div style={{ fontSize: 11, color: TOKENS.muted, fontFamily: 'ui-monospace,Menlo,monospace' }}>
                    {new Date(t.operatedAt).toLocaleDateString('zh-TW')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
