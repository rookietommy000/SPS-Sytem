import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar      from './components/Sidebar'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Inventory    from './pages/Inventory'
import Transactions from './pages/Transactions'
import Purchase     from './pages/Purchase'
import Reports      from './pages/Reports'
import QRScan       from './pages/QRScan'
import Settings     from './pages/Settings'

function Layout() {
  const { user, logout } = useAuth()
  if (!user) return <Navigate to="/login" replace/>

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onLogout={logout} user={user}/>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/"             element={<Dashboard/>}/>
          <Route path="/inventory"    element={<Inventory/>}/>
          <Route path="/transactions" element={<Transactions/>}/>
          <Route path="/purchase"     element={<Purchase/>}/>
          <Route path="/reports"      element={<Reports/>}/>
          <Route path="/qr"           element={<QRScan/>}/>
          <Route path="/settings"     element={<Settings/>}/>
          <Route path="*"             element={<Navigate to="/" replace/>}/>
        </Routes>
      </div>
    </div>
  )
}

function LoginGuard() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace/>
  return <Login/>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginGuard/>}/>
        <Route path="/*"     element={<Layout/>}/>
      </Routes>
    </AuthProvider>
  )
}
