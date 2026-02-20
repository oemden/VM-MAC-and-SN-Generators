import { useEffect } from 'react'

export interface VmDeleteModalProps {
  open: boolean
  vmName: string
  associatedCount: number
  onOrphan: () => void
  onCascade: () => void
  onCancel: () => void
}

/**
 * Modal for VM delete when VM has associated results.
 * Offers: Keep results (orphan), Delete all (cascade), or Cancel.
 */
export function VmDeleteModal({
  open,
  vmName,
  associatedCount,
  onOrphan,
  onCascade,
  onCancel
}: VmDeleteModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vm-delete-modal-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="confirm-modal-card">
        <h3 id="vm-delete-modal-title" className="confirm-modal-title">
          Delete VM &quot;{vmName}&quot;?
        </h3>
        <p className="confirm-modal-message">
          This VM has {associatedCount} associated result{associatedCount !== 1 ? 's' : ''} (SN
          and/or MAC). Choose how to proceed:
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            data-testid="vm-delete-modal-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOrphan}
            data-testid="vm-delete-modal-orphan"
          >
            Keep results
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onCascade}
            data-testid="vm-delete-modal-cascade"
          >
            Delete all
          </button>
        </div>
      </div>
    </div>
  )
}
