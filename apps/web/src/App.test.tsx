import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('should render header with VM Generator title', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /vm generator/i })).toBeInTheDocument()
  })

  it('should render Generate and Saved links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /generate/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /saved/i })).toBeInTheDocument()
  })
})
