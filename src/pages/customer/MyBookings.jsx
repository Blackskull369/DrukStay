import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, MapPin, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function MyBookings() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(id, title, address, dzongkhag, images, price_per_night)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error) setBookings(data || [])
    setLoading(false)
  }

  async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setCancelling(null)
    fetchBookings()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>My Bookings</h1>
        <p className="page-subtitle">Track all your reservations in one place</p>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <CalendarDays size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 8 }}>No bookings yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Browse listings and book your first stay</p>
          <Link to="/explore" className="btn btn-primary">Explore Listings</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => (
            <div key={b.id} className="card fade-in" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Image */}
              <div style={{
                width: 100, height: 80, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden'
              }}>
                {b.listings?.images?.[0] ? (
                  <img src={b.listings.images[0]} alt={b.listings.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>
                    <Link to={`/explore/listing/${b.listings?.id}`} style={{ color: 'inherit' }}>
                      {b.listings?.title}
                    </Link>
                  </h3>
                  <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0 }}>
                    {b.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                  </span>
                </div>

                <div style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <MapPin size={12} /> {b.listings?.address}, {b.listings?.dzongkhag}
                </div>

                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-in</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{format(parseISO(b.check_in), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-out</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{format(parseISO(b.check_out), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{b.total_nights} night{b.total_nights > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Nu. {Number(b.total_price).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Cancel */}
              {b.status === 'confirmed' && (
                <button
                  className="btn btn-danger"
                  onClick={() => cancelBooking(b.id)}
                  disabled={cancelling === b.id}
                  style={{ flexShrink: 0, padding: '7px 14px', fontSize: 12, gap: 5 }}
                >
                  {cancelling === b.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><X size={13} /> Cancel</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
