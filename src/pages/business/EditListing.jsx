import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ListingForm from '../../components/business/ListingForm'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('listings').select('*').eq('id', id).single().then(({ data }) => {
      setListing(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  if (!listing) return (
    <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Listing not found.</div>
  )

  return (
    <div style={{ padding: '32px 36px', maxWidth: 840 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Edit Listing</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Update the details for: {listing.title}</p>
      </div>
      <ListingForm initial={listing} onSave={() => navigate('/business')} />
    </div>
  )
}
