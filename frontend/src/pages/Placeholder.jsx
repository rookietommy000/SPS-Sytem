import { TOKENS } from '../tokens'
import Icon from '../components/Icon'

export default function Placeholder({ title, icon }) {
  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TOKENS.bg }}>
      <div style={{ textAlign: 'center', color: TOKENS.muted }}>
        <Icon name={icon} size={48} color={TOKENS.line}/>
        <div style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color: TOKENS.ink2 }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 13 }}>此頁面建置中</div>
      </div>
    </main>
  )
}
