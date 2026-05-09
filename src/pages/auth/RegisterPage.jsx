import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: params.get('role') === 'business' ? 'business' : 'customer',
    businessName: '',
    phone: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) return setError('Please fill in all required fields.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.role === 'business' && !form.businessName) return setError('Please enter your business name.')

    setLoading(true)
    const { error: err } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role,
      businessName: form.businessName,
    })
    setLoading(false)

    if (err) return setError(err.message)
    navigate(form.role === 'business' ? '/business' : '/explore')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,108,0.05) 0%, transparent 70%)',
      padding: '40px 24px'
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--accent)', display: 'block', marginBottom: 28 }}>
            Druk Stay
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 8 }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join the Druk Stay community</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Role toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
            padding: 4, marginBottom: 24
          }}>
            {['customer', 'business'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{
                  padding: '9px', borderRadius: 'var(--radius-sm)',
                  background: form.role === r ? 'var(--accent)' : 'transparent',
                  color: form.role === r ? '#0a0a0b' : 'var(--text-secondary)',
                  fontWeight: 500, fontSize: 13, transition: 'all 200ms',
                  textTransform: 'capitalize'
                }}
              >
                {r === 'customer' ? 'I am a Renter' : 'I am a Property Owner'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input className="input-field" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Tshering Dorji" />
            </div>

            {form.role === 'business' && (
              <div className="form-group">
                <label className="label">Business Name *</label>
                <input className="input-field" name="businessName" value={form.businessName} onChange={handleChange} placeholder="Dorji Properties" />
              </div>
            )}

            <div className="form-group">
              <label className="label">Email Address *</label>
              <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="label">Phone Number</label>
              <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="+975 17 xxxxxx" />
            </div>

            <div className="form-group">
              <label className="label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Confirm Password *</label>
              <input
                className="input-field"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: 4 }}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
