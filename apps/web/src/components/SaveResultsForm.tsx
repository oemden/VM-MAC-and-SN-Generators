import { useState } from 'react'
import { VmCombobox } from './VmCombobox'
import { API_URL } from '../lib/api'

const COMMENT_MAX_LENGTH = 500

export interface SaveResultsFormProps {
  type: 'sn' | 'mac'
  values: string[]
  onSaved?: () => void
}

export function SaveResultsForm({ type, values, onSaved }: SaveResultsFormProps) {
  const [vmName, setVmName] = useState('')
  const [vmId, setVmId] = useState<number | undefined>(undefined)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canSave = vmName.trim().length > 0 && values.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const body: Record<string, unknown> = {
        type,
        values,
        comment: comment.trim() || undefined
      }
      if (vmId) {
        body.vm_id = vmId
      } else {
        body.vm_name = vmName.trim()
      }
      const res = await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          setError('This VM already has a Serial Number')
        } else {
          setError(data.error ?? 'Failed to save')
        }
        return
      }
      setSuccess(true)
      setVmName('')
      setVmId(undefined)
      setComment('')
      onSaved?.()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="save-results-form">
      <div className="form-group">
        <label className="form-label">VM</label>
        <VmCombobox
          value={vmName}
          onChange={(name, id) => {
            setVmName(name)
            setVmId(id)
          }}
          placeholder="Select or type VM name"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Comment</label>
        <input
          type="text"
          className="form-input"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
          placeholder="Comment"
          maxLength={COMMENT_MAX_LENGTH}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Saved successfully</div>}
      <button
        className="btn btn-primary btn-full"
        onClick={handleSave}
        disabled={!canSave || loading}
      >
        {loading ? 'Saving...' : 'Save to Virtual Machine'}
      </button>
    </div>
  )
}
