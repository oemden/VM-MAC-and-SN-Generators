import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../lib/api'
import { ConfirmModal } from '../components/ConfirmModal'

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
  const [deleteTarget, setDeleteTarget] = useState<SavedResult | null>(null)
  const [sort, setSort] = useState<'id' | 'type' | 'value' | 'vm_name' | 'created_at'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const fetchResults = useCallback(() => {
    const typeParam = typeFilter === 'all' ? '' : typeFilter
    const url = `${API_URL}/api/results?limit=50&offset=0${typeParam ? `&type=${typeParam}` : ''}&sort=${sort}&order=${order}`
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
  }, [typeFilter, sort, order])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`${API_URL}/api/results/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      if (res.status === 204) {
        fetchResults()
      } else if (res.status === 404) {
        setError('Record not found')
        fetchResults()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Delete failed')
      }
    } catch {
      setDeleteTarget(null)
      setError('Network error')
    }
  }

  const handleSort = (col: typeof sort) => {
    if (sort === col) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(col)
      setOrder('asc')
    }
  }

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
                <th>
                  <button
                    type="button"
                    className="saved-results-sort-header"
                    onClick={() => handleSort('id')}
                  >
                    ID {sort === 'id' && (order === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="saved-results-sort-header"
                    onClick={() => handleSort('type')}
                  >
                    Type {sort === 'type' && (order === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="saved-results-sort-header"
                    onClick={() => handleSort('value')}
                  >
                    Value {sort === 'value' && (order === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="saved-results-sort-header"
                    onClick={() => handleSort('vm_name')}
                  >
                    VM {sort === 'vm_name' && (order === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>Comment</th>
                <th>
                  <button
                    type="button"
                    className="saved-results-sort-header"
                    onClick={() => handleSort('created_at')}
                  >
                    Created {sort === 'created_at' && (order === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="saved-results-empty">
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
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary saved-results-delete-btn"
                        onClick={() => setDeleteTarget(r)}
                        data-testid={`delete-${r.id}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete saved result?"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.type.toUpperCase()} "${deleteTarget.value}"? This cannot be undone.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
