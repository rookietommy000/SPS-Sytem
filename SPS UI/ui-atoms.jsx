// 共用 UI atoms / 圖示 / 工具
const { useState, useEffect, useMemo, useRef, useCallback, Fragment } = React;

// === 綠色工廠風 設計 tokens ===
const TOKENS = {
  // 主色：森林綠（製造業常見、不刺眼）
  brand:       '#1F6E43',
  brandDark:   '#15553A',
  brandLight:  '#E6F1EA',
  brandAccent: '#3FA86C',

  // 中性灰
  ink:         '#0F1B16',
  ink2:        '#34403B',
  muted:       '#6B776F',
  line:        '#D8DFD9',
  line2:       '#EAEFEB',
  bg:          '#F4F6F3',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FAFBF9',

  // 警示色
  warn:        '#F9A825',
  warnBg:      '#FFF8E1',
  danger:      '#E53935',
  dangerBg:    '#FFEBEE',
  ok:          '#43A047',
  okBg:        '#E8F5E9',
  info:        '#1976D2',
};
window.TOKENS = TOKENS;

// === Icons (24x24, stroke 1.75) ===
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.75 }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths = {
    search:   <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    minus:    <><path d="M5 12h14"/></>,
    close:    <><path d="M18 6 6 18M6 6l12 12"/></>,
    save:     <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>,
    qrcode:   <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v0M14 21h0M17 17v4M21 17v4"/></>,
    export:   <><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 21h14"/></>,
    chart:    <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-5"/></>,
    bell:     <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
    box:      <><path d="m21 8-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="m12 13v8"/></>,
    factory:  <><path d="M2 20V8l6 4V8l6 4V8l6 4v8H2z"/><path d="M6 16h2M11 16h2M16 16h2"/></>,
    grid:     <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    list:     <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    filter:   <><path d="M3 4h18l-7 9v6l-4 2v-8z"/></>,
    chevron:  <><path d="m9 6 6 6-6 6"/></>,
    chevDown: <><path d="m6 9 6 6 6-6"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></>,
    trash:    <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    info:     <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></>,
    history:  <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    package:  <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></>,
    menu:     <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    location: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>,
    arrowDown:<><path d="M12 5v14M19 12l-7 7-7-7"/></>,
    arrowUp:  <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    check:    <><path d="m20 6-11 11L4 12"/></>,
    refresh:  <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    dashboard:<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>,
    boxes:    <><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 1.03 1.71l3 1.71a2 2 0 0 0 1.94 0L11 19.5"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.27a2 2 0 0 0 1.94 0l3-1.7a2 2 0 0 0 1.03-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5"/><path d="m17 16.5-5-3-5 3"/><path d="M12 8 7.26 5.15a2 2 0 0 1 0-3.4L12 .5l4.74 2.85a2 2 0 0 1 0 3.4z"/></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};
window.Icon = Icon;

// === Status pill ===
const StatusPill = ({ status, dense = false }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS['正常'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: dense ? '2px 8px' : '4px 10px',
      borderRadius: 999,
      background: c.bg, color: c.fg,
      fontSize: dense ? 11 : 12, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: c.dot,
        boxShadow: status !== '正常' ? `0 0 0 3px ${c.bg}` : 'none',
      }}/>
      {status}
    </span>
  );
};
window.StatusPill = StatusPill;

// === Stepper（領用 +/- 數量） ===
const Stepper = ({ value, onChange, min = 0, max = 999, size = 'md' }) => {
  const h = size === 'sm' ? 26 : size === 'lg' ? 40 : 32;
  const w = size === 'sm' ? 26 : size === 'lg' ? 40 : 32;
  const fz = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const btn = {
    width: w, height: h, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, color: TOKENS.ink,
    cursor: 'pointer', userSelect: 'none',
  };
  return (
    <div style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden', boxShadow: `inset 0 0 0 0px ${TOKENS.line}` }}>
      <button style={{ ...btn, borderRight: 'none', borderRadius: '6px 0 0 6px' }}
        onClick={() => onChange(Math.max(min, value - 1))} aria-label="減少">
        <Icon name="minus" size={fz}/>
      </button>
      <div style={{
        height: h, minWidth: w + 8, padding: '0 10px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: TOKENS.surface, borderTop: `1px solid ${TOKENS.line}`, borderBottom: `1px solid ${TOKENS.line}`,
        fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: fz,
      }}>{value}</div>
      <button style={{ ...btn, borderLeft: 'none', borderRadius: '0 6px 6px 0', background: TOKENS.brand, color: '#fff', borderColor: TOKENS.brand }}
        onClick={() => onChange(Math.min(max, value + 1))} aria-label="增加">
        <Icon name="plus" size={fz}/>
      </button>
    </div>
  );
};
window.Stepper = Stepper;

// === Button ===
const Button = ({ children, variant = 'default', size = 'md', icon, onClick, style }) => {
  const sizes = {
    sm: { h: 28, px: 10, fz: 12 },
    md: { h: 34, px: 14, fz: 13 },
    lg: { h: 40, px: 18, fz: 14 },
  }[size];
  const variants = {
    primary: { bg: TOKENS.brand, fg: '#fff', bd: TOKENS.brand, hov: TOKENS.brandDark },
    default: { bg: TOKENS.surface, fg: TOKENS.ink, bd: TOKENS.line, hov: TOKENS.bg },
    ghost:   { bg: 'transparent', fg: TOKENS.ink2, bd: 'transparent', hov: TOKENS.line2 },
    danger:  { bg: '#fff', fg: TOKENS.danger, bd: '#FFD1D1', hov: '#FFF5F5' },
  }[variant];
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`, fontSize: sizes.fz,
        borderRadius: 6, border: `1px solid ${variants.bd}`,
        background: hover ? variants.hov : variants.bg, color: variants.fg,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        fontWeight: variant === 'primary' ? 600 : 500,
        transition: 'background 120ms', whiteSpace: 'nowrap',
        ...style,
      }}>
      {icon && <Icon name={icon} size={sizes.fz + 2}/>}
      {children}
    </button>
  );
};
window.Button = Button;

// === Select / Input ===
const Select = ({ label, value, options, onChange, width }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: TOKENS.ink2 }}>
    {label && <span style={{ color: TOKENS.muted, fontWeight: 500 }}>{label}</span>}
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
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
);
window.Select = Select;

const Input = ({ value, onChange, placeholder, icon, width, style }) => (
  <div style={{ position: 'relative', display: 'inline-block', width: width || 'auto', ...style }}>
    {icon && (
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: TOKENS.muted }}>
        <Icon name={icon} size={15}/>
      </span>
    )}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        height: 34, width: '100%', padding: icon ? '0 12px 0 32px' : '0 12px',
        fontSize: 13, border: `1px solid ${TOKENS.line}`, borderRadius: 6,
        background: TOKENS.surface, color: TOKENS.ink, outline: 'none',
        boxSizing: 'border-box',
      }}/>
  </div>
);
window.Input = Input;

// === 庫存進度條 ===
const StockBar = ({ stock, min, width = 80 }) => {
  const pct = Math.min(100, (stock / Math.max(1, min * 2)) * 100);
  const color = stock === 0 ? TOKENS.danger : stock < min ? TOKENS.warn : TOKENS.ok;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width, height: 6, background: TOKENS.line2, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }}/>
      </div>
      <span style={{ fontSize: 12, fontFamily: 'ui-monospace, Menlo, monospace', color: TOKENS.ink2, fontWeight: 600, minWidth: 28 }}>
        {stock}<span style={{ color: TOKENS.muted, fontWeight: 400 }}>/{min}</span>
      </span>
    </div>
  );
};
window.StockBar = StockBar;

// === 通用 Card ===
const Card = ({ children, style, padding = 16, title, action }) => (
  <div style={{
    background: TOKENS.surface, border: `1px solid ${TOKENS.line}`,
    borderRadius: 10, ...style,
  }}>
    {title && (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${TOKENS.line2}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, letterSpacing: 0.2 }}>{title}</div>
        {action}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);
window.Card = Card;

// === Toast / Notice ===
const Notice = ({ kind = 'warn', children, icon = 'bell' }) => {
  const c = kind === 'danger' ? { bg: TOKENS.dangerBg, fg: TOKENS.danger }
          : kind === 'ok'     ? { bg: TOKENS.okBg, fg: TOKENS.ok }
          : kind === 'info'   ? { bg: '#E3F2FD', fg: TOKENS.info }
          : { bg: TOKENS.warnBg, fg: '#A86A00' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: c.bg, color: c.fg, border: `1px solid ${c.fg}22`,
      padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    }}>
      <Icon name={icon} size={16}/>
      {children}
    </div>
  );
};
window.Notice = Notice;

// 共用 fonts
const FONT_STACK = '"Noto Sans TC","PingFang TC","Microsoft JhengHei",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
window.FONT_STACK = FONT_STACK;
