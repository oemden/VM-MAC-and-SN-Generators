import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VmDeleteModal } from './VmDeleteModal'

describe('VmDeleteModal', () => {
  it('should render when open', () => {
    render(
      <VmDeleteModal
        open={true}
        vmName="TestVM"
        associatedCount={3}
        onOrphan={vi.fn()}
        onCascade={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText(/TestVM/)).toBeInTheDocument()
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('should call onOrphan when Keep results clicked', async () => {
    const onOrphan = vi.fn()
    render(
      <VmDeleteModal
        open={true}
        vmName="VM1"
        associatedCount={1}
        onOrphan={onOrphan}
        onCascade={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /keep results/i }))
    expect(onOrphan).toHaveBeenCalledTimes(1)
  })

  it('should call onCascade when Delete all clicked', async () => {
    const onCascade = vi.fn()
    render(
      <VmDeleteModal
        open={true}
        vmName="VM1"
        associatedCount={1}
        onOrphan={vi.fn()}
        onCascade={onCascade}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /delete all/i }))
    expect(onCascade).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when Cancel clicked', () => {
    const onCancel = vi.fn()
    render(
      <VmDeleteModal
        open={true}
        vmName="VM1"
        associatedCount={1}
        onOrphan={vi.fn()}
        onCascade={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should not render when open is false', () => {
    render(
      <VmDeleteModal
        open={false}
        vmName="VM1"
        associatedCount={1}
        onOrphan={vi.fn()}
        onCascade={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.queryByText(/VM1/)).not.toBeInTheDocument()
  })
})
