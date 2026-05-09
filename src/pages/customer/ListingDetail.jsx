import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { MapPin, BedDouble, Users, Phone, ChevronLeft, CalendarDays, ShieldCheck } from 'lucide-react'
import { format, differenceInDays, parseISO, eachDayOfInterval } from 'date-fns'

export default function ListingDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [availability, setAvailability] = useState([])
  const [bookedDates, setBookedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageIdx, setImageIdx] = useState(0)

  const [booking, setBooking] = useState({ checkIn: '', checkOut: '', guests: 1, specialRequests: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  async function fetchListing() {
    const [{ data: l }, { data: av }, { data: bk }] = await Promise.all([
      supabase.from('listings').select('*, profiles(full_name, business_name, phone)').eq('id', id).single(),
      supabase.from('availability').select('available_date').eq('listing_id', id),
      supabase.from('bookings').select('check_in, check_out').eq('listing_id', id).eq('status', 'confirmed'),
    ])
    setListing(l)
    setAvailability((av || []).map(a => a.available_date))
    // Expand booked ranges to individual dates
    const allBooked = []
    for (const b of bk || []) {
      const days = eachDayOfInterval({ start: parseISO(b.check_in), end: parseISO(b.check_out) })
      days.forEach(d => allBooked.push(format(d, 'yyyy-MM-dd')))
    }
    setBookedDates(allBooked)
    setLoading(false)
  }

  function isDateAvailable(dateStr) {
    if (bookedDates.includes(dateStr)) return false
    if (availability.length > 0 && !availability.includes(dateStr)) return false
    return true
  }

  async function handleBook(e) {
    e.preventDefault()
    setBookingError('')
    if (!booking.checkIn || !booking.checkOut) return setBookingError('Please select check-in and check-out dates.')

    const nights = differenceInDays(parseISO(booking.checkOut), parseISO(booking.checkIn))
    if (nights < 1) return setBookingError('Check-out must be after check-in.')
    if (booking.guests > listing.max_guests) return setBookingError(`Maximum ${listing.max_guests} guests allowed.`)

    // Check availability for selected range
    const days = eachDayOfInterval({ start: parseISO(booking.checkIn), end: parseISO(booking.checkOut) })
    for (const d of days) {
      const s = format(d, 'yyyy-MM-dd')
      if (!isDateAvailable(s)) return setBookingError(`${s} is not available. Please choose different dates.`)
    }

    const totalPrice = nights * listing.price_per_night

    setBookingLoading(true)
    const { error } = await supabase.from('bookings').insert({
      listing_id: listing.id,
      customer_id: profile.id,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      total_nights: nights,
      total_price: totalPrice,
      guest_count: booking.guests,
      special_requests: booking.specialRequests || null,
      status: 'confirmed',
    })
    setBookingLoading(false)

    if (error) return setBookingError(error.message)
    setBookingSuccess(true)
    fetchListing()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (!listing) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--text-secondary)' }}>Listing not found.</p>
    </div>
  )

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(0, differenceInDays(parseISO(booking.checkOut), parseISO(booking.checkIn)))
    : 0

  const totalPrice = nights * listing.price_per_night

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button onClick={() => navigate('/explore')} className="btn btn-ghost" style={{ marginBottom: 24, fontSize: 13, gap: 6 }}>
        <ChevronLeft size={15} /> Back to listings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Image gallery */}
          <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            background: 'var(--bg-elevated)', marginBottom: 24,
            height: 380, position: 'relative'
          }}>
            {listing.images?.length > 0 ? (
              <>
                <img
                  src={listing.images[imageIdx]}
                  alt={listing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {listing.images.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: 6
                  }}>
                    {listing.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIdx(i)}
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: i === imageIdx ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                          border: 'none', cursor: 'pointer', padding: 0
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
                No images provided
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, overflowX: 'auto' }}>
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setImageIdx(i)}
                  style={{
                    width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', opacity: i === imageIdx ? 1 : 0.5,
                    border: i === imageIdx ? '2px solid var(--accent)' : '2px solid transparent',
                    flexShrink: 0, transition: 'all 200ms'
                  }}
                  alt=""
                />
              ))}
            </div>
          )}

          {/* Title & meta */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 12 }}>{listing.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
            <MapPin size={15} />
            <span>{listing.address}, {listing.dzongkhag} Dzongkhag</span>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            <span className="badge badge-accent">{listing.bhk} BHK</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
              <BedDouble size={14} /> {listing.bhk} Bedroom{listing.bhk > 1 ? 's' : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
              <Users size={14} /> Up to {listing.max_guests} guests
            </span>
          </div>

          <div className="divider" />

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 12 }}>About this property</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 14 }}>Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {listing.amenities.map(a => (
                  <span key={a} style={{
                    padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {listing.rules && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 12 }}>House Rules</h3>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {listing.rules}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--accent-glow)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: 18
            }}>
              {(listing.profiles?.business_name || listing.profiles?.full_name || 'B')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 500, marginBottom: 2 }}>
                {listing.profiles?.business_name || listing.profiles?.full_name}
              </p>
              {listing.profiles?.phone && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={12} /> {listing.profiles.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column — booking card */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--accent)' }}>
                Nu. {Number(listing.price_per_night).toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> / night</span>
            </div>

            {bookingSuccess ? (
              <div style={{
                background: 'rgba(82,168,130,0.1)', border: '1px solid rgba(82,168,130,0.3)',
                borderRadius: 'var(--radius)', padding: 20, textAlign: 'center'
              }}>
                <CalendarDays size={28} style={{ color: 'var(--green)', margin: '0 auto 10px' }} />
                <p style={{ color: 'var(--green)', fontWeight: 500, marginBottom: 6 }}>Booking Confirmed</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Your stay at {listing.title} has been booked.
                </p>
                <button className="btn btn-ghost" style={{ marginTop: 14, width: '100%' }} onClick={() => { setBookingSuccess(false); setBooking({ checkIn: '', checkOut: '', guests: 1, specialRequests: '' }) }}>
                  Book another date
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="label">Check-in</label>
                  <input
                    className="input-field"
                    type="date"
                    value={booking.checkIn}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setBooking(b => ({ ...b, checkIn: e.target.value }))}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Check-out</label>
                  <input
                    className="input-field"
                    type="date"
                    value={booking.checkOut}
                    min={booking.checkIn || format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setBooking(b => ({ ...b, checkOut: e.target.value }))}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Guests</label>
                  <input
                    className="input-field"
                    type="number"
                    value={booking.guests}
                    min={1}
                    max={listing.max_guests}
                    onChange={e => setBooking(b => ({ ...b, guests: parseInt(e.target.value) }))}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max {listing.max_guests} guests</span>
                </div>
                <div className="form-group">
                  <label className="label">Special Requests</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={booking.specialRequests}
                    onChange={e => setBooking(b => ({ ...b, specialRequests: e.target.value }))}
                    placeholder="Any special requirements..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {nights > 0 && (
                  <div style={{
                    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px', fontSize: 13
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-secondary)' }}>
                      <span>Nu. {Number(listing.price_per_night).toLocaleString()} x {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>Nu. {Number(totalPrice).toLocaleString()}</span>
                    </div>
                    <div className="divider" style={{ margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--accent)' }}>Nu. {Number(totalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {bookingError && <p className="error-text">{bookingError}</p>}

                <button className="btn btn-primary" type="submit" disabled={bookingLoading} style={{ width: '100%', padding: 13 }}>
                  {bookingLoading ? <span className="spinner" /> : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
