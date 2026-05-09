import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, PlusSquare, CalendarDays, LogOut, Building2 } from 'lucide-react'

export default function BusinessLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
        height: '100vh', flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', marginBottom: 4 }}>Druk Stay</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Portal</div>
        </div>

        <div style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { to: '/business', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
            { to: '/business/add-listing', label: 'Add Listing', icon: <PlusSquare size={15} /> },
            { to: '/business/bookings', label: 'Bookings', icon: <CalendarDays size={15} /> },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/business'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, marginBottom: 4,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all 200ms', textDecoration: 'none'
              })}
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-glow)',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <Building2 size={14} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>{profile?.business_name || profile?.full_name}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Property Owner</p>
            </div>
          </div>
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%',
            background: 'transparent', color: 'var(--text-muted)', fontSize: 12, borderRadius: 'var(--radius-sm)',
            transition: 'all 200ms'
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(224,82,82,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
