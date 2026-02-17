import { useState, useEffect } from 'react'
import { API_URL } from '../lib/api'

interface SavedResult {
  id: number
  type: string
  value: string
  vm_name: string | null
  comment: string | null
  created_at: string
}

export function SavedResults() {
  const [results, setResults] = useState<SavedResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'sn' | 'mac'>('all')

  useEffect(() => {
    const typeParam = typeFilter === 'all' ? '' : typeFilter
    const url = `${API_URL}/api/results?limit=50&offset=0${typeParam ? `&type=${typeParam}` : ''}`
    setLoading(true)
    setError(null)
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results)
        } else {
          setError(data.error ?? 'Failed to load')
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [typeFilter])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  return (
    <div className="container">
      <h2 className="saved-results-title">Saved Results</h2>

      <div className="saved-results-filters">
        <label className="form-label">Type</label>
        <select
          className="form-select saved-results-type-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'sn' | 'mac')}
        >
          <option value="all">All</option>
          <option value="sn">SN</option>
          <option value="mac">MAC</option>
        </select>
      </div>

      {loading && <p className="saved-results-loading">Loading...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="saved-results-table-wrapper">
          <table className="saved-results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Value</th>
                <th>VM</th>
                <th>Comment</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="saved-results-empty">
                    No saved results yet
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.type}</td>
                    <td className="saved-results-value">{r.value}</td>
                    <td>{r.vm_name ?? '-'}</td>
                    <td>{r.comment ?? '-'}</td>
                    <td>{formatDate(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
