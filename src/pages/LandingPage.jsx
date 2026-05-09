import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { MapPin, Shield, CalendarCheck } from 'lucide-react'

export default function LandingPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'business' ? '/business' : '/explore')
    }
  }, [user, profile])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, background: 'rgba(10,10,11,0.9)',
        backdropFilter: 'blur(12px)', zIndex: 100
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)', letterSpacing: '0.02em' }}>
          Druk Stay
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 13 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '100px 24px 80px',
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,108,0.07) 0%, transparent 70%)'
      }}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 99,
          background: 'var(--accent-glow)', border: '1px solid rgba(201,168,108,0.2)',
          color: 'var(--accent)', fontSize: 12, fontWeight: 500, marginBottom: 28,
          letterSpacing: '0.08em', textTransform: 'uppercase'
        }}>
          Bhutan's Premier House Rental Platform
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)',
          lineHeight: 1.1, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px'
        }}>
          Find your home<br />
          <span style={{ color: 'var(--accent)' }}>across all 20 Dzongkhags</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.7 }}>
          Browse verified homes from Thimphu to Trashigang. Rent with confidence, list with ease.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>
            Find a Home
          </Link>
          <Link to="/register?role=business" className="btn btn-ghost" style={{ padding: '13px 32px', fontSize: 15 }}>
            List Your Property
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            {
              icon: <MapPin size={22} />,
              title: 'All 20 Dzongkhags',
              desc: 'Search homes across every district in the Kingdom of Bhutan, from the highlands of Haa to the plains of Sarpang.'
            },
            {
              icon: <CalendarCheck size={22} />,
              title: 'Real-time Availability',
              desc: 'See live availability. Once a home is booked, it\'s marked instantly so you never face disappointment.'
            },
            {
              icon: <Shield size={22} />,
              title: 'Verified Listings',
              desc: 'Every property is managed directly by its owner. Transparent pricing, clear house rules, no hidden fees.'
            },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: 32 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 6,
                background: 'var(--accent-glow)', border: '1px solid rgba(201,168,108,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', marginBottom: 20
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: 'var(--font-display)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '80px 24px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 16 }}>
          Are you a property owner?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
          List your home on Druk Stay and reach thousands of verified renters across Bhutan.
        </p>
        <Link to="/register?role=business" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>
          Start Listing Today
        </Link>
      </section>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'var(--text-muted)', fontSize: 13
      }}>
        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>Druk Stay</span>
        <span>Kingdom of Bhutan — {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
