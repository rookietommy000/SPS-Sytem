import { useState, useEffect } from 'react'
import { TOKENS } from '../tokens'
import { Button, Input } from '../components/ui'
import Icon from '../components/Icon'
import { api } from '../api/client'

const TXN_LABEL = {
  STOCK_IN:     '入庫',
  STOCK_OUT:    '出庫',
  RETURN_IN:    '退料',
  ADJUST_PLUS:  '盤盈',
  ADJUST_MINUS: '盤虧',
}

const TYPE_OPTIONS = ['全部', '入庫', '出庫', '退料', '盤盈', '盤虧']
const TYPE_MAP = { '入庫': 'STOCK_IN', '出庫': 'STOCK_OUT', '退料': 'RETURN_IN', '盤盈': 'ADJUST_PLUS', '盤虧': 'ADJUST_MINUS' }

function isInbound(txnType) {
  return txnType === 'STOCK_IN' || txnType === 'ADJUST_PLUS' || txnType === 'RETURN_IN'
}

export default function Transactions() {
  const [q,          setQ]          = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [data,       setData]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 50 })
    if (typeFilter !== '全部') params.set('txnType', TYPE_MAP[typeFilter])
    api.get(`/transactions?${params}`)
      .then(res => { setData(res.data); setTotal(res.pagination?.total ?? 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [typeFilter, page])

  const filtered = q
    ? data.filter(t => ((t.part?.name ?? '') + (t.operator?.fullName ?? '') + (t.equipment?.code ?? '')).toLowerCase().includes(q.toLowerCase()))
    : data

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>進出紀錄</h1>
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>共 {total} 筆紀錄</div>
        </div>
        <Button icon="export">匯出 Excel</Button>
      </div>

      <div style={{ padding: '16px 24px 12px' }}>
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Input value={q} onChange={setQ} placeholder="搜尋品名 / 人員 / 設備…" icon="search" width={240}/>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', background: TOKENS.line2, borderRadius: 6, padding: 3 }}>
            {TYPE_OPTIONS.map(s => (
              <button key={s} onClick={() => { setTypeFilter(s); setPage(1) }} style={{
                padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: typeFilter === s ? TOKENS.surface : 'transparent',
                color: typeFilter === s ? TOKENS.ink : TOKENS.muted,
                fontSize: 12, fontWeight: 600,
                boxShadow: typeFilter === s ? '0 1px 3px #0001' : 'none',
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px 100px 80px 80px', padding: '10px 18px', background: TOKENS.brandLight, borderBottom: `2px solid ${TOKENS.brand}` }}>
            {['日期', '備品', '設備 / 位置', '人員', '數量', '類型'].map(h => (
              <div key={h} style={{ fontSize: 12, fontWeight: 700, color: TOKENS.brandDark }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted, fontSize: 14 }}>載入中…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted }}>
              <Icon name="history" size={36} color={TOKENS.line}/>
              <div style={{ marginTop: 12, fontSize: 14 }}>無符合條件的紀錄</div>
            </div>
          ) : filtered.map((t, i) => {
            const isIn = isInbound(t.txnType)
            return (
              <div key={String(t.id)} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px 100px 80px 80px', padding: '12px 18px', borderBottom: i < filtered.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt, alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', color: TOKENS.muted }}>
                  {new Date(t.operatedAt).toLocaleDateString('zh-TW')}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.part?.name ?? '—'}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{t.part?.brand} {t.part?.modelNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.equipment?.code ?? '—'}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{t.location ?? '—'}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.operator?.fullName ?? '—'}</div>
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 700, fontSize: 14, color: isIn ? TOKENS.ok : TOKENS.danger }}>
                  {isIn ? '+' : ''}{t.quantity}
                </div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger }}>
                    <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={11}/>
                    {TXN_LABEL[t.txnType] ?? t.txnType}
                  </span>
                </div>
              </div>
            )
          })}

          <div style={{ padding: '10px 18px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, fontSize: 12, color: TOKENS.muted, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>顯示 {filtered.length} 筆 / 共 {total} 筆</span>
            {total > 50 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 12 }}>上一頁</button>
                <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, cursor: page * 50 >= total ? 'not-allowed' : 'pointer', opacity: page * 50 >= total ? 0.4 : 1, fontSize: 12 }}>下一頁</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
