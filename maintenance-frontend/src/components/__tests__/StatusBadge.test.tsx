import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import { vi, describe, it, expect } from 'vitest'

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('StatusBadge Component', () => {
  it('renders with PENDIENTE status', () => {
    render(<StatusBadge status="PENDIENTE" />)
    expect(screen.getByText('status.pending')).toBeInTheDocument()
  })

  it('renders with EN_PROCESO status', () => {
    render(<StatusBadge status="EN_PROCESO" />)
    expect(screen.getByText('status.in_progress')).toBeInTheDocument()
  })

  it('renders with COMPLETADO status', () => {
    render(<StatusBadge status="COMPLETADO" />)
    expect(screen.getByText('status.completed')).toBeInTheDocument()
  })

  it('renders with CANCELADO status', () => {
    render(<StatusBadge status="CANCELADO" />)
    expect(screen.getByText('status.cancelled')).toBeInTheDocument()
  })
})
