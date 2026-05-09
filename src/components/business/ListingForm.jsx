import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { DZONGKHAGS, BHK_OPTIONS, AMENITIES_LIST } from '../../lib/constants'
import { Upload, X, Plus, Minus } from 'lucide-react'
import { format, addDays } from 'date-fns'

export default function ListingForm({ initial, onSave }) {
  const { profile } = useAuth()
  const fileRef = useRef()

  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    dzongkhag: initial?.dzongkhag || '',
    address: initial?.address || '',
    bhk: initial?.bhk || 1,
    price_per_night: initial?.price_per_night || '',
    max_guests: initial?.max_guests || 2,
    rules: initial?.rules || '',
    amenities: initial?.amenities || [],
    images: initial?.images || [],
    is_active: initial?.is_active !== undefined ? initial.is_active : true,
  })

  const [availDates, setAvailDates] = useState([])
  const [newDate, setNewDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  function toggleAmenity(a) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
  }

  async function uploadImages(files) {
    setUploading(true)
    const urls = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file, { upsert: false })
      if (!upErr) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function addDate() {
    if (!newDate) return
    if (!availDates.includes(newDate)) setAvailDates(d => [...d, newDate].sort())
    setNewDate('')
  }

  function removeDate(d) {
    setAvailDates(dates => dates.filter(x => x !== d))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('Title is required.')
    if (!form.description.trim()) return setError('Description is required.')
    if (!form.dzongkhag) return setError('Please select a Dzongkhag.')
    if (!form.address.trim()) return setError('Address is required.')
    if (!form.price_per_night || isNaN(form.price_per_night) || Number(form.price_per_night) <= 0) return setError('Enter a valid price.')

    setSaving(true)

    const payload = {
      ...form,
      bhk: parseInt(form.bhk),
      price_per_night: parseFloat(form.price_per_night),
      max_guests: parseInt(form.max_guests),
      business_id: profile.id,
    }

    let listingId = initial?.id
    let saveError

    if (initial?.id) {
      const { error: e } = await supabase.from('listings').update(payload).eq('id', initial.id)
      saveError = e
    } else {
      const { data, error: e } = await supabase.from('listings').insert(payload).select().single()
      saveError = e
      listingId = data?.id
    }

    if (saveError) {
      setSaving(false)
      return setError(saveError.message)
    }

    // Save availability dates
    if (availDates.length > 0 && listingId) {
      await supabase.from('availability').upsert(
        availDates.map(d => ({ listing_id: listingId, available_date: d })),
        { onConflict: 'listing_id,available_date' }
      )
    }

    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Basic Info */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 22 }}>Basic Information</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="label">Property Title *</label>
            <input className="input-field" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Cozy 2BHK in Thimphu City Center" />
          </div>

          <div className="form-group">
            <label className="label">Description *</label>
            <textarea className="input-field" rows={5} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Describe your property, its surroundings, what makes it special..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="label">Dzongkhag *</label>
              <select className="input-field" value={form.dzongkhag} onChange={e => handleChange('dzongkhag', e.target.value)}>
                <option value="">Select Dzongkhag</option>
                {DZONGKHAGS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Full Address *</label>
              <input className="input-field" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Street / area name" />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 22 }}>Property Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
          <div className="form-group">
            <label className="label">BHK *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {BHK_OPTIONS.map(n => (
                <button
                  key={n} type="button"
                  onClick={() => handleChange('bhk', n)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 'var(--radius-sm)', fontSize: 14,
                    background: form.bhk === n ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: form.bhk === n ? '#0a0a0b' : 'var(--text-secondary)',
                    border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Price per Night (Nu.) *</label>
            <input className="input-field" type="number" min="0" value={form.price_per_night} onChange={e => handleChange('price_per_night', e.target.value)} placeholder="e.g. 3500" />
          </div>
          <div className="form-group">
            <label className="label">Max Guests</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={() => handleChange('max_guests', Math.max(1, form.max_guests - 1))} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', color: 'var(--text-primary)', cursor: 'pointer' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{form.max_guests}</span>
              <button type="button" onClick={() => handleChange('max_guests', form.max_guests + 1)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', color: 'var(--text-primary)', cursor: 'pointer' }}><Plus size={14} /></button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <button
              type="button"
              onClick={() => handleChange('is_active', !form.is_active)}
              style={{
                padding: '9px 16px', borderRadius: 'var(--radius-sm)',
                background: form.is_active ? 'rgba(82,168,130,0.15)' : 'var(--bg-elevated)',
                color: form.is_active ? 'var(--green)' : 'var(--text-secondary)',
                border: `1px solid ${form.is_active ? 'rgba(82,168,130,0.3)' : 'var(--border)'}`,
                cursor: 'pointer', fontWeight: 500, fontSize: 13, textAlign: 'left'
              }}
            >
              {form.is_active ? 'Active — visible to renters' : 'Inactive — hidden from renters'}
            </button>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Amenities</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AMENITIES_LIST.map(a => {
            const active = form.amenities.includes(a)
            return (
              <button
                key={a} type="button" onClick={() => toggleAmenity(a)}
                style={{
                  padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                  background: active ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'rgba(201,168,108,0.35)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 200ms'
                }}
              >
                {a}
              </button>
            )
          })}
        </div>
      </div>

      {/* House Rules */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>House Rules</h2>
        <textarea className="input-field" rows={5} value={form.rules} onChange={e => handleChange('rules', e.target.value)} placeholder="No smoking, no pets, quiet after 10pm..." style={{ resize: 'vertical' }} />
      </div>

      {/* Images */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Photos</h2>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadImages(Array.from(e.target.files))} />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="btn btn-ghost"
          style={{ gap: 8, marginBottom: 16 }}
        >
          {uploading ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <Upload size={15} />}
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Upload photos of your property. First photo will be the cover image.</p>

        {form.images.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: i === 0 ? '2px solid var(--accent)' : '2px solid transparent' }} />
                {i === 0 && (
                  <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--accent)', color: '#0a0a0b', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover</span>
                )}
                <button
                  type="button" onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Availability Dates</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          Add specific dates when this property is available. Leave empty to mark as always available (unless booked).
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            className="input-field"
            type="date"
            value={newDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={e => setNewDate(e.target.value)}
            style={{ colorScheme: 'dark', maxWidth: 200 }}
          />
          <button type="button" onClick={addDate} className="btn btn-ghost" style={{ gap: 6 }}>
            <Plus size={15} /> Add Date
          </button>
        </div>
        {availDates.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availDates.map(d => (
              <span key={d} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                background: 'var(--accent-glow)', border: '1px solid rgba(201,168,108,0.25)',
                borderRadius: 99, fontSize: 12, color: 'var(--accent)'
              }}>
                {d}
                <button type="button" onClick={() => removeDate(d)} style={{ background: 'none', color: 'var(--accent)', display: 'flex', cursor: 'pointer' }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px' }}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : (initial ? 'Save Changes' : 'Create Listing')}
        </button>
      </div>
    </form>
  )
}
