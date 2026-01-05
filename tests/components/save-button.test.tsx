/**
 * Save Button Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SaveButton, SaveProviderButton, SaveTrialButton } from '@/components/ui/save-button'

describe('SaveButton', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders with correct initial state (unsaved)', () => {
    render(
      <SaveButton
        type="provider"
        itemId="test-123"
        item={{ npi: 'test-123', name: 'Dr. Test', specialty: 'Test' }}
        variant="button"
      />
    )

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('toggles saved state on click', () => {
    render(
      <SaveButton
        type="provider"
        itemId="test-123"
        item={{ npi: 'test-123', name: 'Dr. Test', specialty: 'Test' }}
        variant="button"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('calls onSaveChange callback when toggled', () => {
    const onSaveChange = vi.fn()

    render(
      <SaveButton
        type="provider"
        itemId="test-123"
        item={{ npi: 'test-123', name: 'Dr. Test', specialty: 'Test' }}
        variant="button"
        onSaveChange={onSaveChange}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(onSaveChange).toHaveBeenCalledWith(true)
  })

  it('renders icon variant correctly', () => {
    render(
      <SaveButton
        type="provider"
        itemId="test-123"
        item={{ npi: 'test-123', name: 'Dr. Test', specialty: 'Test' }}
        variant="icon"
      />
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-label')
  })
})

describe('SaveProviderButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders correctly for providers', () => {
    render(
      <SaveProviderButton
        provider={{
          npi: '1234567890',
          name: 'Dr. Jane Doe',
          specialty: 'Cardiology',
        }}
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

describe('SaveTrialButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders correctly for trials', () => {
    render(
      <SaveTrialButton
        trial={{
          nctId: 'NCT12345678',
          title: 'Test Clinical Trial',
          phase: 'Phase 3',
        }}
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

