import { useNavigate } from 'react-router-dom'
import ListingForm from '../../components/business/ListingForm'

export default function AddListing() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '32px 36px', maxWidth: 840 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Add New Listing</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fill in the details to publish your property on Druk Stay</p>
      </div>
      <ListingForm onSave={() => navigate('/business')} />
    </div>
  )
}
