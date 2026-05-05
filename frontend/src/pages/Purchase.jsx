import { useState, useEffect } from 'react'
import { TOKENS } from '../tokens'
import { Button, Notice } from '../components/ui'
import Icon from '../components/Icon'
import { api } from '../api/client'

const STATUS_MAP = {
  DRAFT:     { label: '草稿',    bg: TOKENS.line2,   fg: TOKENS.muted  },
  CONFIRMED: { label: '已確認',  bg: '#E3F2FD',       fg: '#1565C0'     },
  PARTIAL:   { label: '部分到貨', bg: TOKENS.warnBg,  fg: '#A86A00'     },
  COMPLETED: { label: '已完成',  bg: TOKENS.okBg,     fg: TOKENS.ok     },
  CANCELLED: { label: '已取消',  bg: TOKENS.dangerBg, fg: TOKENS.danger },
}

const REQ_STATUS_MAP = {
  DRAFT:     { label: '草稿',   bg: TOKENS.line2,   fg: TOKENS.muted  },
  PENDING:   { label: '待審核', bg: '#FFF3E0',       fg: '#E65100'     },
  APPROVED:  { label: '已核准', bg: TOKENS.okBg,     fg: TOKENS.ok     },
  REJECTED:  { label: '已退回', bg: TOKENS.dangerBg, fg: TOKENS.danger },
  ORDERED:   { label: '已下單', bg: '#E3F2FD',       fg: '#1565C0'     },
  CANCELLED: { label: '已取消', bg: TOKENS.line2,    fg: TOKENS.muted  },
}

const STATUS_OPTIONS = ['全部', '草稿', '已確認', '部分到貨', '已完成']
const STATUS_LABEL_TO_KEY = { '草稿': 'DRAFT', '已確認': 'CONFIRMED', '部分到貨': 'PARTIAL', '已完成': 'COMPLETED' }

export default function Purchase() {
  const [tab,          setTab]          = useState('orders')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [orders,       setOrders]       = useState([])
  const [requests,     setRequests]     = useState([])
  const [ordersTotal,  setOrdersTotal]  = useState(0)
  const [reqTotal,     setReqTotal]     = useState(0)
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    if (tab !== 'orders') return
    setLoading(true)
    const params = new URLSearchParams({ limit: 50 })
    if (statusFilter !== '全部') params.set('status', STATUS_LABEL_TO_KEY[statusFilter])
    api.get(`/purchase/orders?${params}`)
      .then(r => { setOrders(r.data ?? []); setOrdersTotal(r.pagination?.total ?? 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab, statusFilter])

  useEffect(() => {
    if (tab !== 'requests') return
    setLoading(true)
    api.get('/purchase/requests?limit=50')
      .then(r => { setRequests(r.data ?? []); setReqTotal(r.pagination?.total ?? 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>採購管理</h1>
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>
            {ordersTotal} 張採購單 · {reqTotal} 張申請單
          </div>
        </div>
        <Button icon="plus" variant="primary">建立採購單</Button>
      </div>

      <div style={{ padding: '0 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', gap: 0 }}>
        {[['orders', '採購單'], ['requests', '採購申請']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            color: tab === key ? TOKENS.brand : TOKENS.muted,
            borderBottom: tab === key ? `2px solid ${TOKENS.brand}` : '2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 24px 24px' }}>

        {tab === 'orders' && (
          <div>
            <div style={{ marginBottom: 12, display: 'flex', gap: 4, background: TOKENS.line2, borderRadius: 6, padding: 3, width: 'fit-content' }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: statusFilter === s ? TOKENS.surface : 'transparent',
                  color: statusFilter === s ? TOKENS.ink : TOKENS.muted,
                  fontSize: 12, fontWeight: 600,
                  boxShadow: statusFilter === s ? '0 1px 3px #0001' : 'none',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 90px 80px 100px 80px', padding: '10px 18px', background: TOKENS.brandLight, borderBottom: `2px solid ${TOKENS.brand}` }}>
                {['採購單號', '供應商', '訂單日期', '預計到貨', '品項', '金額', '狀態'].map(h => (
                  <div key={h} style={{ fontSize: 12, fontWeight: 700, color: TOKENS.brandDark }}>{h}</div>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted, fontSize: 14 }}>載入中…</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted }}>
                  <Icon name="package" size={36} color={TOKENS.line}/>
                  <div style={{ marginTop: 12, fontSize: 14 }}>尚無採購單</div>
                </div>
              ) : orders.map((o, i) => {
                const s = STATUS_MAP[o.status] ?? STATUS_MAP.DRAFT
                return (
                  <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 90px 90px 80px 100px 80px', padding: '14px 18px', borderBottom: i < orders.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt, cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600, color: TOKENS.brand }}>{o.poNo}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{o.supplier?.name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>{o.orderDate ? new Date(o.orderDate).toLocaleDateString('zh-TW') : '—'}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>{o.expectedDate ? new Date(o.expectedDate).toLocaleDateString('zh-TW') : '—'}</div>
                    <div style={{ fontSize: 13 }}>{o.items?.length ?? 0} 項</div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      NT$ {o.totalAmount ? Number(o.totalAmount).toLocaleString() : '—'}
                    </div>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.fg }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div>
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px 80px', padding: '10px 18px', background: TOKENS.brandLight, borderBottom: `2px solid ${TOKENS.brand}` }}>
                {['申請單號', '申請人', '申請日期', '品項', '狀態'].map(h => (
                  <div key={h} style={{ fontSize: 12, fontWeight: 700, color: TOKENS.brandDark }}>{h}</div>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted, fontSize: 14 }}>載入中…</div>
              ) : requests.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: TOKENS.muted }}>
                  <Icon name="package" size={36} color={TOKENS.line}/>
                  <div style={{ marginTop: 12, fontSize: 14 }}>尚無採購申請</div>
                </div>
              ) : requests.map((r, i) => {
                const s = REQ_STATUS_MAP[r.status] ?? REQ_STATUS_MAP.DRAFT
                return (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px 80px', padding: '14px 18px', borderBottom: i < requests.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', alignItems: 'center', background: i % 2 === 0 ? TOKENS.surface : TOKENS.surfaceAlt }}>
                    <div style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600, color: TOKENS.brand }}>{r.requestNo}</div>
                    <div style={{ fontSize: 13 }}>{r.requester?.fullName ?? '—'}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>{new Date(r.createdAt).toLocaleDateString('zh-TW')}</div>
                    <div style={{ fontSize: 13 }}>{r.items?.length ?? 0} 項</div>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.fg }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
