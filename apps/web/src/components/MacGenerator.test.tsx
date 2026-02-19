import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MacGenerator } from './MacGenerator'

describe('MacGenerator', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should show SaveResultsForm when Assign to VM is ON and results exist', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ mac: '00:50:56:00:00:01' }] })
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, vms: [] })
      } as Response)

    render(<MacGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate mac/i }))
    await waitFor(() => expect(screen.getByText('00:50:56:00:00:01')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: /save to virtual machine/i })).toBeInTheDocument()
  })

  it('should hide SaveResultsForm when Assign to VM is OFF and results exist', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ mac: '00:50:56:00:00:01' }] })
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, vms: [] })
      } as Response)

    render(<MacGenerator />)
    fireEvent.click(screen.getByRole('button', { name: /generate mac/i }))
    await waitFor(() => expect(screen.getByText('00:50:56:00:00:01')).toBeInTheDocument())

    fireEvent.click(screen.getByText(/options/i))
    fireEvent.click(screen.getByLabelText(/assign to vm/i))

    expect(screen.queryByRole('button', { name: /save to virtual machine/i })).not.toBeInTheDocument()
  })
})
