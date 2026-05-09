import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PlusSquare, Pencil, Trash2, Eye, EyeOff, MapPin, BedDouble } from 'lucide-react'

export default function BusinessDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, bookings: 0 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [{ data: ls }, { data: bks }] = await Promise.all([
      supabase.from('listings').select('*').eq('business_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, listing_id, status').eq('status', 'confirmed'),
    ])
    const myListingIds = (ls || []).map(l => l.id)
    const myBookings = (bks || []).filter(b => myListingIds.includes(b.listing_id))

    setListings(ls || [])
    setStats({
      total: (ls || []).length,
      active: (ls || []).filter(l => l.is_active).length,
      bookings: myBookings.length
    })
    setLoading(false)
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing? All associated bookings will also be removed. This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('listings').delete().eq('id', id)
    setDeleting(null)
    fetchData()
  }

  async function toggleActive(listing) {
    await supabase.from('listings').update({ is_active: !listing.is_active }).eq('id', listing.id)
    fetchData()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>
            {profile?.business_name || 'My'} Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your listings and track bookings</p>
        </div>
        <Link to="/business/add-listing" className="btn btn-primary" style={{ gap: 8 }}>
          <PlusSquare size={16} /> Add Listing
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Total Listings', value: stats.total },
          { label: 'Active Listings', value: stats.active },
          { label: 'Current Bookings', value: stats.bookings },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '24px 28px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--accent)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Listings */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Your Properties</h2>

      {listings.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No listings yet. Add your first property.</p>
          <Link to="/business/add-listing" className="btn btn-primary">Add Your First Listing</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {listings.map(l => (
            <div key={l.id} className="card fade-in" style={{
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 80, height: 64, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden'
              }}>
                {l.images?.[0] ? (
                  <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {l.title}
                  </h3>
                  <span className={`badge ${l.is_active ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0 }}>
                    {l.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {l.dzongkhag}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <BedDouble size={11} /> {l.bhk} BHK
                  </span>
                  <span style={{ color: 'var(--accent)' }}>
                    Nu. {Number(l.price_per_night).toLocaleString()}/night
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive(l)}
                  className="btn btn-ghost"
                  style={{ padding: '7px 12px', fontSize: 12, gap: 5 }}
                  title={l.is_active ? 'Deactivate' : 'Activate'}
                >
                  {l.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  {l.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => navigate(`/business/edit-listing/${l.id}`)}
                  className="btn btn-ghost"
                  style={{ padding: '7px 12px', fontSize: 12, gap: 5 }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => deleteListing(l.id)}
                  disabled={deleting === l.id}
                  className="btn btn-danger"
                  style={{ padding: '7px 12px', fontSize: 12, gap: 5 }}
                >
                  {deleting === l.id ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
