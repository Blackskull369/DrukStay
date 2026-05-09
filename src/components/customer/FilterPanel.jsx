import { DZONGKHAGS, BHK_OPTIONS, AMENITIES_LIST } from '../../lib/constants'

export default function FilterPanel({ filters, onChange }) {
  function set(key, val) {
    onChange(f => ({ ...f, [key]: val }))
  }

  function toggleAmenity(a) {
    onChange(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        {/* Dzongkhag */}
        <div className="form-group">
          <label className="label">Dzongkhag</label>
          <select className="input-field" value={filters.dzongkhag} onChange={e => set('dzongkhag', e.target.value)}>
            <option value="">All Dzongkhags</option>
            {DZONGKHAGS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* BHK */}
        <div className="form-group">
          <label className="label">Bedrooms (BHK)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => set('bhk', '')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13,
                background: !filters.bhk ? 'var(--accent)' : 'var(--bg-elevated)',
                color: !filters.bhk ? '#0a0a0b' : 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500
              }}
            >Any</button>
            {BHK_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => set('bhk', filters.bhk === String(n) ? '' : String(n))}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13,
                  background: filters.bhk === String(n) ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: filters.bhk === String(n) ? '#0a0a0b' : 'var(--text-secondary)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="label">Price per Night (Nu.)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input-field"
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={e => set('minPrice', e.target.value)}
              style={{ flex: 1 }}
              min="0"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
            <input
              className="input-field"
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={e => set('maxPrice', e.target.value)}
              style={{ flex: 1 }}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div style={{ marginTop: 24 }}>
        <label className="label" style={{ marginBottom: 12 }}>Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AMENITIES_LIST.map(a => {
            const active = filters.amenities.includes(a)
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                style={{
                  padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
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
    </div>
  )
}
