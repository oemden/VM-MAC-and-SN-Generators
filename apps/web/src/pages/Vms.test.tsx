import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Vms } from './Vms'

describe('Vms', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              vms: [{ id: 1, name: 'vm1', created_at: '2025-01-01T00:00:00Z', associated_count: 0 }]
            })
        })
      )
    )
  })

  it('should render VMs page title', () => {
    render(
      <MemoryRouter>
        <Vms />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /vms/i })).toBeInTheDocument()
  })

  it('should render table headers after load', async () => {
    render(
      <MemoryRouter>
        <Vms />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText(/id/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/name/i)).toBeInTheDocument()
    expect(screen.getByText(/created/i)).toBeInTheDocument()
  })
})
