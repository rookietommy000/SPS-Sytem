import { useEffect } from 'react'
import { TOKENS } from '../tokens'
import { Button } from './ui'
import Icon from './Icon'

export default function Modal({ title, onClose, onConfirm, confirmLabel = '儲存', loading = false, width = 480, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* 背景遮罩 */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: '#0F1B1660' }}/>

      {/* 彈窗本體 */}
      <div style={{ position: 'relative', width, maxWidth: 'calc(100vw - 40px)', background: TOKENS.surface, borderRadius: 14, boxShadow: '0 20px 60px #0F1B1630', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 80px)' }}>
        {/* 標題列 */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${TOKENS.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, padding: 4, display: 'flex', alignItems: 'center' }}>
            <Icon name="close" size={18}/>
          </button>
        </div>

        {/* 內容區 */}
        <div style={{ padding: '22px', overflow: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* 按鈕列 */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${TOKENS.line2}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <Button onClick={onClose} disabled={loading}>取消</Button>
          <Button variant="primary" onClick={onConfirm} disabled={loading}>
            {loading ? '儲存中…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
