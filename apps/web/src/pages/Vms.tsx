import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../lib/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { VmDeleteModal } from '../components/VmDeleteModal'

interface Vm {
  id: number
  name: string
  created_at: string
  associated_count: number
}

export function Vms() {
  const [vms, setVms] = useState<Vm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vm | null>(null)

  const fetchVms = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/vms`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.vms)) {
          setVms(data.vms)
        } else {
          setError(data.error ?? 'Failed to load')
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchVms()
  }, [fetchVms])

  const handleDeleteConfirm = async (cascade: boolean) => {
    if (!deleteTarget) return
    const url = `${API_URL}/api/vms/${deleteTarget.id}${cascade ? '?cascade=true' : ''}`
    try {
      const res = await fetch(url, { method: 'DELETE' })
      setDeleteTarget(null)
      if (res.status === 204) {
        fetchVms()
      } else if (res.status === 404) {
        setError('VM not found')
        fetchVms()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Delete failed')
      }
    } catch {
      setDeleteTarget(null)
      setError('Network error')
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  const hasResults = deleteTarget && deleteTarget.associated_count > 0

  return (
    <div className="container">
      <h2 className="saved-results-title">VMs</h2>

      {loading && <p className="saved-results-loading">Loading...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="saved-results-table-wrapper">
          <table className="saved-results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="saved-results-empty">
                    No VMs yet
                  </td>
                </tr>
              ) : (
                vms.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.name}</td>
                    <td>{formatDate(v.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary saved-results-delete-btn"
                        onClick={() => setDeleteTarget(v)}
                        data-testid={`delete-vm-${v.id}`}
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

      {deleteTarget && !hasResults && (
        <ConfirmModal
          open={true}
          title={`Delete VM "${deleteTarget.name}"?`}
          message="This VM has no associated results. Delete it?"
          onConfirm={() => handleDeleteConfirm(false)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget && hasResults && (
        <VmDeleteModal
          open={true}
          vmName={deleteTarget.name}
          associatedCount={deleteTarget.associated_count}
          onOrphan={() => handleDeleteConfirm(false)}
          onCascade={() => handleDeleteConfirm(true)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
