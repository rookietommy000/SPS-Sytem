import { TOKENS } from '../tokens'

const base = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px',
  border: `1px solid ${TOKENS.line}`,
  borderRadius: 8,
  fontSize: 14,
  background: TOKENS.surface,
  color: TOKENS.ink,
  outline: 'none',
  fontFamily: 'inherit',
}

export function Field({ label, required, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink2 }}>
        {label}{required && <span style={{ color: TOKENS.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: TOKENS.danger }}>{error}</span>}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...base, opacity: disabled ? 0.5 : 1 }}
    />
  )
}

export function SelectInput({ value, onChange, options, placeholder = '請選擇…', disabled }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{ ...base, cursor: 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...base, resize: 'vertical', lineHeight: 1.5 }}
    />
  )
}
