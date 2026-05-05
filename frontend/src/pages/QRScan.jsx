import { useState } from 'react'
import { TOKENS } from '../tokens'
import { SPARE_PARTS } from '../data/mockData'
import { Button, StockBar, StatusPill, Notice } from '../components/ui'
import Icon from '../components/Icon'

export default function QRScan() {
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState(null)
  const [qty, setQty] = useState(1)
  const [done, setDone] = useState(false)

  const simulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setFound(SPARE_PARTS[2])
    }, 1800)
  }

  const confirmPickup = () => {
    setDone(true)
    setTimeout(() => { setFound(null); setQty(1); setDone(false) }, 2500)
  }

  return (
    <main style={{ flex: 1, overflow: 'auto', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 24px', background: TOKENS.surface, borderBottom: `1px solid ${TOKENS.line}` }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>QR 領用</h1>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 2 }}>掃描備品 QR Code 快速領用</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', gap: 32, flexWrap: 'wrap' }}>
        {/* 掃描區 */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 28, width: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>掃描 QR Code</div>

          {/* 鏡頭區 */}
          <div style={{ width: 240, height: 240, margin: '0 auto 20px', background: '#111', borderRadius: 12, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            onClick={!scanning && !found ? simulateScan : undefined}>
            {/* QR 格紋 */}
            <div style={{ position: 'absolute', inset: 24, background: 'repeating-conic-gradient(#fff 0% 25%, #1a1a1a 0% 50%) 0 / 14px 14px', opacity: scanning ? 0.3 : 0.15 }}/>
            {/* 掃描線 */}
            {scanning && (
              <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${TOKENS.brandAccent}, transparent)`, animation: 'scan 1.2s linear infinite', top: 0 }}/>
            )}
            {/* 四角標示 */}
            {['topleft','topright','bottomleft','bottomright'].map(p => (
              <div key={p} style={{
                position: 'absolute', width: 24, height: 24,
                top:    p.includes('top')    ? 12 : 'auto',
                bottom: p.includes('bottom') ? 12 : 'auto',
                left:   p.includes('left')   ? 12 : 'auto',
                right:  p.includes('right')  ? 12 : 'auto',
                borderTop:    p.includes('top')    ? `3px solid ${TOKENS.brandAccent}` : 'none',
                borderBottom: p.includes('bottom') ? `3px solid ${TOKENS.brandAccent}` : 'none',
                borderLeft:   p.includes('left')   ? `3px solid ${TOKENS.brandAccent}` : 'none',
                borderRight:  p.includes('right')  ? `3px solid ${TOKENS.brandAccent}` : 'none',
              }}/>
            ))}
            {!scanning && !found && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff66', fontSize: 12 }}>
                點擊模擬掃描
              </div>
            )}
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: TOKENS.brandAccent, fontSize: 13, fontWeight: 600 }}>掃描中…</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 16 }}>請將備品 QR Code 對準框內</div>
          <Button icon="qrcode" onClick={simulateScan} style={{ width: '100%', justifyContent: 'center' }} variant={scanning ? 'ghost' : 'default'}>
            {scanning ? '掃描中…' : '重新掃描'}
          </Button>
        </div>

        {/* 結果區 */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 440 }}>
          {done ? (
            <div style={{ background: TOKENS.okBg, border: `1px solid ${TOKENS.ok}33`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <Icon name="check" size={48} color={TOKENS.ok}/>
              <div style={{ fontSize: 18, fontWeight: 700, color: TOKENS.ok, marginTop: 12 }}>領用成功</div>
              <div style={{ fontSize: 13, color: TOKENS.muted, marginTop: 6 }}>紀錄已儲存</div>
            </div>
          ) : found ? (
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 4, background: TOKENS.brandAccent }}/>
              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 4 }}>{found.category} · {found.id}</div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{found.name}</div>
                    <div style={{ fontSize: 13, color: TOKENS.ink2 }}>{found.nameZh}</div>
                  </div>
                  <StatusPill status={found.status}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[['品牌', found.brand], ['型號', found.model], ['位置', found.location], ['設備', found.equipment]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: TOKENS.muted }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace,Menlo,monospace' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: TOKENS.brandLight, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: TOKENS.brandDark, fontWeight: 600, marginBottom: 6 }}>目前庫存</div>
                  <StockBar stock={found.stock} min={found.minStock} width={120}/>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 600, marginBottom: 8 }}>領用數量</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="minus" size={16}/>
                    </button>
                    <span style={{ fontSize: 22, fontWeight: 700, minWidth: 40, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(found.stock, q + 1))} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${TOKENS.brand}`, background: TOKENS.brand, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plus" size={16}/>
                    </button>
                  </div>
                </div>
                {found.stock === 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Notice kind="danger" icon="bell">庫存為零，無法領用</Notice>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => setFound(null)} style={{ flex: 1, justifyContent: 'center' }}>取消</Button>
                  <Button variant="primary" icon="check" onClick={confirmPickup} style={{ flex: 2, justifyContent: 'center' }} disabled={found.stock === 0}>
                    確認領用 {qty} 件
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 48, textAlign: 'center', color: TOKENS.muted }}>
              <Icon name="qrcode" size={48} color={TOKENS.line}/>
              <div style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>等待掃描結果</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>掃描備品上的 QR Code 後，<br/>在此確認領用數量</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
