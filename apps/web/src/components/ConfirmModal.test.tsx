import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmModal } from './ConfirmModal'

describe('ConfirmModal', () => {
  it('renders when open', () => {
    render(
      <ConfirmModal
        open={true}
        title="Delete record?"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete record?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ConfirmModal
        open={false}
        title="Delete?"
        message="Sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm when Confirm clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        open={true}
        title="Delete?"
        message="Sure?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('confirm-modal-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        open={true}
        title="Delete?"
        message="Sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByTestId('confirm-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('uses custom confirmLabel', () => {
    render(
      <ConfirmModal
        open={true}
        title="Remove?"
        message="Proceed?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmLabel="Remove"
      />
    )
    expect(screen.getByTestId('confirm-modal-confirm')).toHaveTextContent('Remove')
  })
})
