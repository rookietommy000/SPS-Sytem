import { useState, useEffect, useCallback } from 'react'
import { TOKENS } from '../tokens'
import { StatusPill, StockBar, Stepper, Button, Select, Input, Notice } from '../components/ui'
import Icon from '../components/Icon'
import { api } from '../api/client'
import PartModal from '../components/PartModal'

function stockStatus(qty, min) {
  if (qty === 0)   return '需採購'
  if (qty <= min)  return '低庫存'
  return '正常'
}

export default function Inventory() {
  const [items,       setItems]       = useState([])
  const [lines,       setLines]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [line,        setLine]        = useState('全部')
  const [statusFilter,setStatusFilter]= useState('全部')
  const [q,           setQ]           = useState('')
  const [sel,         setSel]         = useState(null)
  const [selTxns,     setSelTxns]     = useState([])
  const [pending,     setPending]     = useState({})
  const [toast,       setToast]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [view,        setView]        = useState('card')
  const [partModal,   setPartModal]   = useState(null) // null | { mode:'add'|'edit', item? }

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 200 })
    api.get(`/inventory?${params}`)
      .then(res => { setItems(res.data ?? []); setTotal(res.pagination?.total ?? 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/settings/lines').then(r => setLines(r.data ?? [])).catch(() => {})
  }, [])

  // 載入 drawer 的進出紀錄
  useEffect(() => {
    if (!sel) return
    api.get(`/transactions?partId=${sel.partId}&limit=20`)
      .then(r => setSelTxns(r.data ?? []))
      .catch(() => setSelTxns([]))
  }, [sel])

  const filtered = items.filter(inv => {
    const status = stockStatus(inv.quantity, inv.minStock)
    if (line !== '全部' && inv.equipment?.productionLine?.code !== line) return false
    if (statusFilter !== '全部' && status !== statusFilter) return false
    if (q) {
      const hay = (inv.part?.name + inv.part?.brand + inv.part?.modelNo + inv.part?.partNo).toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const lowStockItems = items.filter(inv => inv.quantity <= inv.minStock)

  const adjust = (id, v) => setPending(prev => ({ ...prev, [id]: v }))

  async function save() {
    const entries = Object.entries(pending).filter(([, v]) => v !== 0)
    if (!entries.length) return
    setSaving(true)
    try {
      for (const [invId, delta] of entries) {
        const inv = items.find(i => String(i.id) === invId)
        if (!inv) continue
        if (delta > 0) {
          await api.post('/inventory/stock-in', { partId: inv.partId, equipmentId: inv.equipmentId, quantity: delta, location: inv.location })
        } else {
          await api.post('/inventory/stock-out', { partId: inv.partId, equipmentId: inv.equipmentId, quantity: Math.abs(delta), location: inv.location })
        }
      }
      setPending({})
      setToast(`已儲存 ${entries.length} 項變更`)
      setTimeout(() => setToast(''), 2200)
      load()
      if (sel) setSel(null)
    } catch (err) {
      setToast('儲存失敗：' + err.message)
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const lineOptions = ['全部', ...lines.map(l => l.code)]

  return (
    <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: TOKENS.bg }}>
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>備品庫存</h1>
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>共 {total} 項備品 · {lowStockItems.length} 項低於庫存</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon="export">匯出</Button>
          <Button icon="plus" variant="primary" onClick={() => setPartModal({ mode: 'add' })}>新增備品</Button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ padding: '16px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: '總備品種類',  val: total,                                                     color: TOKENS.brand,  icon: 'boxes'   },
          { label: '低庫存項目',  val: lowStockItems.length,                                      color: TOKENS.warn,   icon: 'bell'    },
          { label: '需採購項目',  val: items.filter(i => i.quantity === 0).length,                color: TOKENS.danger, icon: 'package' },
          { label: '有庫存項目',  val: items.filter(i => i.quantity > i.minStock).length,         color: TOKENS.ok,     icon: 'history' },
        ].map(k => (
          <div key={k.label} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.color + '15', color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={k.icon} size={20}/>
            </div>
            <div>
              <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 篩選列 */}
      <div style={{ padding: '16px 24px 12px' }}>
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Input value={q} onChange={setQ} placeholder="搜尋品名 / 型號 / 編號…" icon="search" width={240}/>
          <Select label="產線" value={line} options={lineOptions} onChange={setLine}/>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', background: TOKENS.line2, borderRadius: 6, padding: 3 }}>
            {['全部', '正常', '低庫存', '需採購'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: statusFilter === s ? TOKENS.surface : 'transparent',
                color: statusFilter === s ? TOKENS.ink : TOKENS.muted,
                fontSize: 12, fontWeight: 600,
                boxShadow: statusFilter === s ? '0 1px 3px #0001' : 'none',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, background: TOKENS.line2, borderRadius: 6, padding: 3 }}>
            {[['card', 'grid'], ['list', 'list']].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                width: 30, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer',
                background: view === v ? TOKENS.surface : 'transparent',
                color: view === v ? TOKENS.brand : TOKENS.muted,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={icon} size={14}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主內容 */}
      <div style={{ padding: '0 24px 100px', flex: 1 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: TOKENS.muted, fontSize: 14 }}>載入中…</div>
        ) : view === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {filtered.map(inv => {
              const status = stockStatus(inv.quantity, inv.minStock)
              const delta  = pending[String(inv.id)] || 0
              const preview = Math.max(0, inv.quantity + delta)
              const dotColor = status === '正常' ? TOKENS.ok : status === '低庫存' ? TOKENS.warn : TOKENS.danger
              return (
                <div key={String(inv.id)} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 120ms, box-shadow 120ms' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px #0F1B1614' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ height: 4, background: dotColor }}/>
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, cursor: 'pointer' }} onClick={() => setSel(inv)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 2 }}>{inv.part?.category?.name ?? '—'} · {inv.part?.partNo ?? ''}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{inv.part?.name ?? '—'}</div>
                      </div>
                      <StatusPill status={status}/>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: TOKENS.muted }}>
                      <div>品牌 <span style={{ color: TOKENS.ink2, fontWeight: 600 }}>{inv.part?.brand ?? '—'}</span></div>
                      <div>位置 <span style={{ color: TOKENS.ink2, fontWeight: 600 }}>{inv.location ?? '—'}</span></div>
                      <div style={{ gridColumn: '1 / -1' }}>設備 <span style={{ color: TOKENS.ink2 }}>{inv.equipment?.code ?? '—'} · {inv.equipment?.productionLine?.code ?? ''}</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: `1px solid ${TOKENS.line2}`, paddingTop: 10, marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: 10, color: TOKENS.muted, marginBottom: 2 }}>庫存 {preview} / 最低 {inv.minStock}</div>
                        <StockBar stock={preview} min={inv.minStock} width={70}/>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: TOKENS.muted }}>單位</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{inv.part?.unit ?? '個'}</div>
                      </div>
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} style={{ padding: '10px 14px', background: TOKENS.surfaceAlt, borderTop: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 600 }}>領用數量</span>
                    <Stepper value={delta} onChange={v => adjust(String(inv.id), v)} min={-inv.quantity} max={999} size="sm"/>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
            {filtered.map((inv, i) => {
              const status = stockStatus(inv.quantity, inv.minStock)
              const delta  = pending[String(inv.id)] || 0
              return (
                <div key={String(inv.id)} onClick={() => setSel(inv)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderBottom: i < filtered.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', cursor: 'pointer' }}>
                  <StatusPill status={status}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{inv.part?.name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>{inv.part?.brand} {inv.part?.modelNo} · {inv.equipment?.code}</div>
                  </div>
                  <StockBar stock={Math.max(0, inv.quantity + delta)} min={inv.minStock}/>
                  <div onClick={e => e.stopPropagation()}>
                    <Stepper value={delta} onChange={v => adjust(String(inv.id), v)} min={-inv.quantity} max={999} size="sm"/>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 浮動儲存列 */}
      {Object.keys(pending).filter(k => pending[k] !== 0).length > 0 && (
        <div style={{ position: 'sticky', bottom: 16, padding: '0 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: TOKENS.ink, color: '#fff', padding: '10px 14px 10px 18px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 12px 28px #0F1B1640' }}>
            <span style={{ fontSize: 13 }}>有 <strong>{Object.keys(pending).filter(k => pending[k] !== 0).length}</strong> 項待儲存變更</span>
            <Button variant="primary" icon="save" onClick={save} size="sm" disabled={saving}>{saving ? '儲存中…' : '儲存'}</Button>
            <button onClick={() => setPending({})} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6, fontSize: 12 }}>取消</button>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      {sel && (
        <>
          <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: '#0F1B1655', zIndex: 50 }}/>
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 100%)', background: TOKENS.surface, zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 30px #0F1B1620' }}>
            <div style={{ padding: '20px 22px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <StatusPill status={stockStatus(sel.quantity, sel.minStock)}/>
                  <span style={{ fontSize: 11, color: TOKENS.muted }}>{sel.part?.partNo ?? ''} · {sel.part?.category?.name ?? ''}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{sel.part?.name ?? '—'}</h2>
              </div>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: TOKENS.muted }}>
                <Icon name="close" size={18}/>
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>
              <div style={{ background: TOKENS.brandLight, border: `1px solid ${TOKENS.brand}33`, borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: TOKENS.brandDark, fontWeight: 600, marginBottom: 4 }}>目前庫存</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: TOKENS.brandDark, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {sel.quantity} <span style={{ fontSize: 13, color: TOKENS.muted, fontWeight: 500 }}>/ 最低 {sel.minStock}</span>
                  </div>
                </div>
                <Stepper value={pending[String(sel.id)] || 0} onChange={v => adjust(String(sel.id), v)} min={-sel.quantity} max={999} size="lg"/>
              </div>

              <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>規格資訊</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {[
                  ['規格描述',        sel.part?.specDescription ?? '—'],
                  ['原廠部品採購編號', sel.part?.manufacturerPartNo ?? '—'],
                  ['國光備品編號',    sel.part?.internalPartNo ?? '—'],
                  ['部品編號',        sel.part?.partNo ?? '—'],
                  ['可替代性',        sel.part?.substituteNote ?? '無'],
                  ['共用性',          sel.part?.sharedEquipment ?? '無'],
                  ['品牌',            sel.part?.brand ?? '—'],
                  ['型號',            sel.part?.modelNo ?? '—'],
                  ['設備',            sel.equipment?.code ?? '—'],
                  ['位置',            sel.location ?? '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: TOKENS.muted, fontWeight: 500 }}>{k}</div>
                    <div style={{ fontSize: 13, color: TOKENS.ink, fontWeight: 500, fontFamily: 'ui-monospace,Menlo,monospace', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="history" size={12}/> 進出紀錄
              </div>
              {selTxns.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: TOKENS.muted, fontSize: 13 }}>暫無紀錄</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selTxns.map(t => {
                    const isIn = t.txnType === 'STOCK_IN' || t.txnType === 'ADJUST_PLUS' || t.txnType === 'RETURN_IN'
                    return (
                      <div key={String(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: TOKENS.surfaceAlt, borderRadius: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: isIn ? TOKENS.okBg : TOKENS.dangerBg, color: isIn ? TOKENS.ok : TOKENS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={14}/>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {t.operator?.fullName ?? '—'} <span style={{ fontWeight: 700, fontFamily: 'ui-monospace,Menlo,monospace', color: isIn ? TOKENS.ok : TOKENS.danger }}>{isIn ? '+' : ''}{t.quantity}</span>
                          </div>
                          <div style={{ fontSize: 11, color: TOKENS.muted }}>{new Date(t.operatedAt).toLocaleDateString('zh-TW')}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 22px', borderTop: `1px solid ${TOKENS.line2}`, background: TOKENS.surfaceAlt, display: 'flex', gap: 8 }}>
              <Button icon="edit" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setPartModal({ mode: 'edit', item: sel.part })}>編輯</Button>
              <Button icon="save" variant="primary" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? '儲存中…' : '儲存'}</Button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 60 }}>
          <Notice kind={toast.includes('失敗') ? 'danger' : 'ok'} icon="check">{toast}</Notice>
        </div>
      )}

      {partModal && (
        <PartModal
          mode={partModal.mode}
          item={partModal.item}
          onClose={() => setPartModal(null)}
          onSaved={() => { load(); setSel(null) }}
        />
      )}
    </main>
  )
}
