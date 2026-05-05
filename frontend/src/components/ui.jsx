import { useState } from 'react'
import { TOKENS, STATUS_COLORS } from '../tokens'
import Icon from './Icon'

export function StatusPill({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['正常']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.dot }}/>
      {status}
    </span>
  )
}

export function StockBar({ stock, min, width = 80 }) {
  const pct = Math.min(100, (stock / Math.max(1, min * 2)) * 100)
  const color = stock === 0 ? TOKENS.danger : stock < min ? TOKENS.warn : TOKENS.ok
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width, height: 6, background: TOKENS.line2, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }}/>
      </div>
      <span style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', color: TOKENS.ink2, fontWeight: 600, minWidth: 28 }}>
        {stock}<span style={{ color: TOKENS.muted, fontWeight: 400 }}>/{min}</span>
      </span>
    </div>
  )
}

export function Stepper({ value, onChange, min = 0, max = 999, size = 'md' }) {
  const h = size === 'sm' ? 26 : size === 'lg' ? 40 : 32
  const w = size === 'sm' ? 26 : size === 'lg' ? 40 : 32
  const fz = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
  const btn = {
    width: w, height: h, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, color: TOKENS.ink,
    cursor: 'pointer', userSelect: 'none',
  }
  return (
    <div style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden' }}>
      <button style={{ ...btn, borderRight: 'none', borderRadius: '6px 0 0 6px' }}
        onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon name="minus" size={fz}/>
      </button>
      <div style={{
        height: h, minWidth: w + 8, padding: '0 10px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: TOKENS.surface, borderTop: `1px solid ${TOKENS.line}`, borderBottom: `1px solid ${TOKENS.line}`,
        fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: fz,
      }}>{value}</div>
      <button style={{ ...btn, borderLeft: 'none', borderRadius: '0 6px 6px 0', background: TOKENS.brand, color: '#fff', borderColor: TOKENS.brand }}
        onClick={() => onChange(Math.min(max, value + 1))}>
        <Icon name="plus" size={fz}/>
      </button>
    </div>
  )
}

export function Button({ children, variant = 'default', size = 'md', icon, onClick, style }) {
  const sizes = { sm: { h: 28, px: 10, fz: 12 }, md: { h: 34, px: 14, fz: 13 }, lg: { h: 40, px: 18, fz: 14 } }[size]
  const variants = {
    primary: { bg: TOKENS.brand, fg: '#fff', bd: TOKENS.brand, hov: TOKENS.brandDark },
    default: { bg: TOKENS.surface, fg: TOKENS.ink, bd: TOKENS.line, hov: TOKENS.bg },
    ghost:   { bg: 'transparent', fg: TOKENS.ink2, bd: 'transparent', hov: TOKENS.line2 },
    danger:  { bg: '#fff', fg: TOKENS.danger, bd: '#FFD1D1', hov: '#FFF5F5' },
  }[variant]
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`, fontSize: sizes.fz,
        borderRadius: 6, border: `1px solid ${variants.bd}`,
        background: hover ? variants.hov : variants.bg, color: variants.fg,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        fontWeight: variant === 'primary' ? 600 : 500, transition: 'background 120ms', whiteSpace: 'nowrap',
        ...style,
      }}>
      {icon && <Icon name={icon} size={sizes.fz + 2}/>}
      {children}
    </button>
  )
}

export function Select({ label, value, options, onChange, width }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: TOKENS.ink2 }}>
      {label && <span style={{ color: TOKENS.muted, fontWeight: 500 }}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={{
          height: 34, padding: '0 28px 0 12px', fontSize: 13,
          border: `1px solid ${TOKENS.line}`, borderRadius: 6, background: TOKENS.surface,
          color: TOKENS.ink, minWidth: width || 120, cursor: 'pointer',
          appearance: 'none', WebkitAppearance: 'none',
        }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: TOKENS.muted }}>
          <Icon name="chevDown" size={14}/>
        </span>
      </div>
    </label>
  )
}

export function Input({ value, onChange, placeholder, icon, width, style }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: width || 'auto', ...style }}>
      {icon && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: TOKENS.muted }}>
          <Icon name={icon} size={15}/>
        </span>
      )}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        height: 34, width: '100%', padding: icon ? '0 12px 0 32px' : '0 12px',
        fontSize: 13, border: `1px solid ${TOKENS.line}`, borderRadius: 6,
        background: TOKENS.surface, color: TOKENS.ink, outline: 'none', boxSizing: 'border-box',
      }}/>
    </div>
  )
}

export function Notice({ kind = 'warn', children, icon = 'bell' }) {
  const c = kind === 'danger' ? { bg: TOKENS.dangerBg, fg: TOKENS.danger }
          : kind === 'ok'     ? { bg: TOKENS.okBg, fg: TOKENS.ok }
          : kind === 'info'   ? { bg: '#E3F2FD', fg: TOKENS.info }
          : { bg: TOKENS.warnBg, fg: '#A86A00' }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: c.bg, color: c.fg, border: `1px solid ${c.fg}22`,
      padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    }}>
      <Icon name={icon} size={16}/>
      {children}
    </div>
  )
}

export function Card({ children, style, padding = 16, title, action }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 10, ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${TOKENS.line2}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, letterSpacing: 0.2 }}>{title}</div>
          {action}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  )
}
