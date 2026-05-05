import { TOKENS } from '../tokens'
import { SPARE_PARTS } from '../data/mockData'
import { Button } from '../components/ui'
import { StatusPill, StockBar } from '../components/ui'
import Icon from '../components/Icon'

const categoryStats = ['電控元件', '氣動元件', '機械元件', '耗材'].map(cat => {
  const parts = SPARE_PARTS.filter(p => p.category === cat)
  const lowStock = parts.filter(p => p.stock < p.minStock)
  return { cat, total: parts.length, lowStock: lowStock.length, value: parts.reduce((s, p) => s + p.stock * p.unitPrice, 0) }
})

const maxValue = Math.max(...categoryStats.map(c => c.value))

export default function Reports() {
  const lowStockParts = SPARE_PARTS.filter(p => p.stock < p.minStock).sort((a, b) => a.stock - b.stock)

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      {/* 頁標 */}
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>統計報表</h1>
          <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>資料截至 2026-05-04</div>
        </div>
        <Button icon="export">匯出報表</Button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 類別庫存統計 */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line2}` }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>各類別庫存統計</div>
          </div>
          <div style={{ padding: 18 }}>
            {categoryStats.map(c => (
              <div key={c.cat} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.cat}</span>
                    <span style={{ fontSize: 11, color: TOKENS.muted }}>{c.total} 種</span>
                    {c.lowStock > 0 && (
                      <span style={{ fontSize: 11, background: TOKENS.dangerBg, color: TOKENS.danger, padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>
                        {c.lowStock} 項低庫存
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    NT$ {c.value.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 10, background: TOKENS.line2, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.value / maxValue) * 100}%`, height: '100%', background: TOKENS.brand, borderRadius: 999, transition: 'width 600ms ease' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 低庫存清單 */}
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>低庫存報表</span>
              <span style={{ fontSize: 11, color: TOKENS.danger, fontWeight: 600 }}>{lowStockParts.length} 項</span>
            </div>
            {lowStockParts.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: TOKENS.muted }}>
                <Icon name="check" size={32} color={TOKENS.ok}/>
                <div style={{ marginTop: 8 }}>所有備品庫存充足</div>
              </div>
            ) : lowStockParts.map((p, i) => (
              <div key={p.id} style={{ padding: '12px 18px', borderBottom: i < lowStockParts.length - 1 ? `1px solid ${TOKENS.line2}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusPill status={p.status}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{p.equipment}</div>
                </div>
                <StockBar stock={p.stock} min={p.minStock} width={60}/>
              </div>
            ))}
          </div>

          {/* 備品價值摘要 */}
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line2}` }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>庫存價值摘要</span>
            </div>
            <div style={{ padding: 18 }}>
              {[
                { label: '庫存總價值',   val: SPARE_PARTS.reduce((s, p) => s + p.stock * p.unitPrice, 0), color: TOKENS.brand  },
                { label: '低庫存損失預估', val: lowStockParts.reduce((s, p) => s + (p.minStock - p.stock) * p.unitPrice, 0), color: TOKENS.danger },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${TOKENS.line2}` }}>
                  <span style={{ fontSize: 13, color: TOKENS.ink2 }}>{row.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: row.color, fontVariantNumeric: 'tabular-nums' }}>NT$ {row.val.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, fontSize: 11, color: TOKENS.muted, lineHeight: 1.6 }}>
                ＊ 庫存價值以單價 × 現有庫存計算<br/>
                ＊ 低庫存損失預估 = 需補貨量 × 單價
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
