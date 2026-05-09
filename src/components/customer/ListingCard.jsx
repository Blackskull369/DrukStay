import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Users } from 'lucide-react'

export default function ListingCard({ listing }) {
  const image = listing.images?.[0]

  return (
    <Link to={`/explore/listing/${listing.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card fade-in" style={{
        overflow: 'hidden', transition: 'transform 200ms, box-shadow 200ms', cursor: 'pointer'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {/* Image */}
        <div style={{
          height: 200, background: 'var(--bg-elevated)',
          position: 'relative', overflow: 'hidden'
        }}>
          {image ? (
            <img src={image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 13
            }}>
              No image
            </div>
          )}
          <div style={{
            position: 'absolute', top: 12, right: 12
          }}>
            <span className="badge badge-accent">{listing.bhk} BHK</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '18px 20px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 8,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
          }}>
            {listing.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>
            <MapPin size={13} />
            <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {listing.address}, {listing.dzongkhag}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BedDouble size={13} /> {listing.bhk} bed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={13} /> up to {listing.max_guests}
              </span>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', fontWeight: 600 }}>
                Nu. {Number(listing.price_per_night).toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/night</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
