import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DZONGKHAGS, BHK_OPTIONS } from '../../lib/constants'
import ListingCard from '../../components/customer/ListingCard'
import FilterPanel from '../../components/customer/FilterPanel'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function CustomerHome() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    dzongkhag: '',
    bhk: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
  })

  useEffect(() => {
    fetchListings()
  }, [filters])

  async function fetchListings() {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select(`*, profiles(full_name, business_name, phone)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters.dzongkhag) query = query.eq('dzongkhag', filters.dzongkhag)
    if (filters.bhk) query = query.eq('bhk', parseInt(filters.bhk))
    if (filters.minPrice) query = query.gte('price_per_night', parseFloat(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price_per_night', parseFloat(filters.maxPrice))

    const { data, error } = await query
    if (!error) {
      let results = data || []
      if (filters.amenities.length > 0) {
        results = results.filter(l =>
          filters.amenities.every(a => (l.amenities || []).includes(a))
        )
      }
      setListings(results)
    }
    setLoading(false)
  }

  const filtered = listings.filter(l =>
    search === '' ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase()) ||
    l.dzongkhag.toLowerCase().includes(search.toLowerCase())
  )

  const hasActiveFilters = filters.dzongkhag || filters.bhk || filters.minPrice || filters.maxPrice || filters.amenities.length > 0

  function clearFilters() {
    setFilters({ dzongkhag: '', bhk: '', minPrice: '', maxPrice: '', amenities: [] })
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Find your next home</h1>
        <p className="page-subtitle">Explore verified rentals across all 20 Dzongkhags of Bhutan</p>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 40 }}
            placeholder="Search by location, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowFilters(v => !v)}
          style={{ gap: 8 }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span style={{
              background: 'var(--bg-base)', color: 'var(--accent)',
              borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700
            }}>
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button className="btn btn-ghost" onClick={clearFilters} style={{ gap: 6 }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Quick dzongkhag pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <button
          onClick={() => setFilters(f => ({ ...f, dzongkhag: '' }))}
          style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
            background: !filters.dzongkhag ? 'var(--accent)' : 'var(--bg-card)',
            color: !filters.dzongkhag ? '#0a0a0b' : 'var(--text-secondary)',
            border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 200ms'
          }}
        >
          All
        </button>
        {DZONGKHAGS.slice(0, 10).map(dz => (
          <button
            key={dz}
            onClick={() => setFilters(f => ({ ...f, dzongkhag: f.dzongkhag === dz ? '' : dz }))}
            style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: filters.dzongkhag === dz ? 'var(--accent)' : 'var(--bg-card)',
              color: filters.dzongkhag === dz ? '#0a0a0b' : 'var(--text-secondary)',
              border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 200ms'
            }}
          >
            {dz}
          </button>
        ))}
        {!showFilters && (
          <button
            onClick={() => setShowFilters(true)}
            style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: 'transparent', color: 'var(--accent)',
              border: '1px solid rgba(201,168,108,0.3)', cursor: 'pointer'
            }}
          >
            + More filters
          </button>
        )}
      </div>

      {/* Full filter panel */}
      {showFilters && (
        <div style={{ marginBottom: 28 }}>
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 8 }}>No listings found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try adjusting your filters or search term</p>
          {hasActiveFilters && (
            <button className="btn btn-ghost" onClick={clearFilters} style={{ margin: '16px auto 0' }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24
          }}>
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
