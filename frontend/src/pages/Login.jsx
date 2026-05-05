import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TOKENS } from '../tokens'
import { Button, Input, Notice } from '../components/ui'
import Icon from '../components/Icon'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) return setError('請輸入帳號與密碼')
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: TOKENS.bg }}>
      <div style={{ width: 380, background: TOKENS.surface, borderRadius: 16, border: `1px solid ${TOKENS.line}`, boxShadow: '0 12px 40px #0F1B1612', padding: 40 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: TOKENS.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="boxes" size={22} color="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: TOKENS.ink }}>備品管理系統</div>
            <div style={{ fontSize: 11, color: TOKENS.muted }}>Spare Parts System</div>
          </div>
        </div>

        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>登入</h2>

        {error && (
          <div style={{ marginBottom: 16 }}>
            <Notice kind="danger" icon="bell">{error}</Notice>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink2, marginBottom: 6 }}>帳號</div>
              <Input value={username} onChange={setUsername} placeholder="請輸入帳號" icon="user" width="100%"/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink2, marginBottom: 6 }}>密碼</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '9px 40px 9px 12px',
                    border: `1px solid ${TOKENS.line}`, borderRadius: 8,
                    fontSize: 14, background: TOKENS.surface, color: TOKENS.ink,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.muted, padding: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Icon name={showPwd ? 'eyeOff' : 'eye'} size={16}/>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: 24, padding: '11px', borderRadius: 9,
              background: loading ? TOKENS.muted : TOKENS.brand,
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'background 150ms',
            }}
          >
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
