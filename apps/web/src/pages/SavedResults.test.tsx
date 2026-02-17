import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SavedResults } from './SavedResults'

describe('SavedResults', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should fetch and display saved results', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          { id: 1, type: 'mac', value: '00:50:56:00:00:01', vm_name: 'VM-001', comment: null, created_at: '2025-02-17T00:00:00Z' }
        ]
      })
    } as Response)
    render(
      <MemoryRouter>
        <SavedResults />
      </MemoryRouter>
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/results')))
    expect(screen.getByText('00:50:56:00:00:01')).toBeInTheDocument()
  })

  it('should show Saved Results heading', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, results: [] })
    } as Response)
    render(
      <MemoryRouter>
        <SavedResults />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /saved results/i })).toBeInTheDocument()
  })
})
