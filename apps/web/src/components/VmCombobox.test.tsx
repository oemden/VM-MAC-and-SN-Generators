import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { VmCombobox } from './VmCombobox'

describe('VmCombobox', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should render with placeholder', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, vms: [] })
    } as Response)
    render(<VmCombobox value="" onChange={() => {}} placeholder="Select VM" />)
    expect(screen.getByPlaceholderText('Select VM')).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
  })

  it('should fetch VMs on mount', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, vms: [{ id: 1, name: 'VM-001' }] })
    } as Response)
    render(<VmCombobox value="" onChange={() => {}} placeholder="Select VM" />)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/vms'))
    })
  })
})
