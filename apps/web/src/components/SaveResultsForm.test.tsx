import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SaveResultsForm } from './SaveResultsForm'

describe('SaveResultsForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should render VM combobox, comment field, and Save button', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, vms: [] })
    } as Response)
    render(
      <SaveResultsForm type="mac" values={['00:50:56:00:00:01']} />
    )
    expect(screen.getByPlaceholderText(/select or type vm/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/comment/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save to virtual machine/i })).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
  })

  it('should disable Save when no VM selected', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, vms: [] })
    } as Response)
    render(
      <SaveResultsForm type="mac" values={['00:50:56:00:00:01']} />
    )
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: /save to virtual machine/i })).toBeDisabled()
  })
})
