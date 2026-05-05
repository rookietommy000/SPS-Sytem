import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { TOKENS } from '../tokens'

const navItems = [
  { icon: 'dashboard', label: '儀表板',  to: '/' },
  { icon: 'boxes',     label: '備品庫存', to: '/inventory' },
  { icon: 'history',   label: '進出紀錄', to: '/transactions' },
  { icon: 'package',   label: '採購管理', to: '/purchase' },
  { icon: 'chart',     label: '統計報表', to: '/reports' },
  { icon: 'qrcode',    label: 'QR 領用',  to: '/qr' },
  { icon: 'settings',  label: '系統設定', to: '/settings' },
]

export default function Sidebar({ lowStockCount = 0, user, onLogout }) {
  const initials = user?.fullName?.charAt(0) ?? '?'

  return (
    <aside style={{
      width: 220, background: '#0E2A1E', color: '#D7E5DD',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1A3A2A' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: TOKENS.brandAccent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="boxes" size={18} color="#0E2A1E"/>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>SPS</div>
          <div style={{ fontSize: 10, color: '#7AA088' }}>備品管理系統</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: 10, flex: 1 }}>
        {navItems.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 8, marginBottom: 2,
            background: isActive ? TOKENS.brandAccent : 'transparent',
            color: isActive ? '#0E2A1E' : '#B5CDC0',
            fontSize: 13, fontWeight: isActive ? 700 : 500,
            cursor: 'pointer', textDecoration: 'none',
          })}>
            <Icon name={n.icon} size={16}/>
            <span style={{ flex: 1 }}>{n.label}</span>
            {n.to === '/inventory' && lowStockCount > 0 && (
              <span style={{ background: TOKENS.danger, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                {lowStockCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 使用者 */}
      <div style={{ padding: 14, borderTop: '1px solid #1A3A2A', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: TOKENS.brandAccent, color: '#0E2A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName ?? '—'}</div>
          <div style={{ fontSize: 10, color: '#7AA088' }}>{user?.role?.name ?? ''}</div>
        </div>
        {onLogout && (
          <button onClick={onLogout} title="登出" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7AA088', padding: 4, display: 'flex', alignItems: 'center' }}>
            <Icon name="close" size={14}/>
          </button>
        )}
      </div>
    </aside>
  )
}
