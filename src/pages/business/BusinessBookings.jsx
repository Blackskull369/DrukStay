import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, MapPin, User, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function BusinessBookings() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('confirmed')

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    // Get all listings owned by this business
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('business_id', profile.id)

    const listingIds = (listings || []).map(l => l.id)
    if (listingIds.length === 0) {
      setBookings([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('bookings')
      .select('*, listings(id, title, address, dzongkhag), profiles(full_name, email, phone)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })

    setBookings(data || [])
    setLoading(false)
  }

  async function deleteBooking(id) {
    if (!confirm('Delete this booking record? The guest will not be notified.')) return
    setDeleting(id)
    await supabase.from('bookings').delete().eq('id', id)
    setDeleting(null)
    fetchBookings()
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>All reservations across your properties</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['confirmed', 'cancelled', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
              background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
              color: filter === f ? '#0a0a0b' : 'var(--text-secondary)',
              border: '1px solid var(--border)', cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 200ms'
            }}
          >
            {f} {f !== 'all' && `(${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <CalendarDays size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No {filter !== 'all' ? filter : ''} bookings found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(b => (
            <div key={b.id} className="card fade-in" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 5 }}>{b.listings?.title}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} /> {b.listings?.address}, {b.listings?.dzongkhag}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                    {b.status}
                  </span>
                  <button
                    onClick={() => deleteBooking(b.id)}
                    disabled={deleting === b.id}
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', fontSize: 12, gap: 5 }}
                    title="Delete booking"
                  >
                    {deleting === b.id ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-in</p>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{format(parseISO(b.check_in), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check-out</p>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{format(parseISO(b.check_out), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</p>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{b.total_nights} night{b.total_nights > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guests</p>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{b.guest_count}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent)' }}>Nu. {Number(b.total_price).toLocaleString()}</p>
                </div>
              </div>

              {/* Guest info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                <User size={13} />
                <span>{b.profiles?.full_name}</span>
                {b.profiles?.email && <span style={{ color: 'var(--text-muted)' }}>· {b.profiles.email}</span>}
                {b.profiles?.phone && <span style={{ color: 'var(--text-muted)' }}>· {b.profiles.phone}</span>}
              </div>

              {b.special_requests && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Special Request: </span>
                  {b.special_requests}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
