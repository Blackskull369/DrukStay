import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, CalendarDays, LogOut, User } from 'lucide-react'

export default function CustomerLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64, borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent)', letterSpacing: '0.02em' }}>
          Druk Stay
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/explore', label: 'Explore', icon: <Home size={16} /> },
            { to: '/explore/bookings', label: 'My Bookings', icon: <CalendarDays size={16} /> },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/explore'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
                borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all 200ms'
              })}
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-glow)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <User size={15} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {profile?.full_name?.split(' ')[0]}
            </span>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
