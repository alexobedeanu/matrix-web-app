import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/Toast'

// Test component that uses the toast hook
function TestComponent() {
  const { addToast } = useToast()

  return (
    <div>
      <button onClick={() => addToast('Success message', 'success')}>
        Add Success Toast
      </button>
      <button onClick={() => addToast('Error message', 'error')}>
        Add Error Toast
      </button>
      <button onClick={() => addToast('Warning message', 'warning')}>
        Add Warning Toast
      </button>
      <button onClick={() => addToast('Info message', 'info')}>
        Add Info Toast
      </button>
    </div>
  )
}

describe('Toast Component', () => {
  it('should render toast provider without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should show success toast when addToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Success Toast'))

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Check for success styling - find the container div with the styling
    const toast = screen.getByText('Success message').closest('div[class*="border-green-400/50"]')
    expect(toast).toHaveClass('border-green-400/50', 'bg-green-900/80', 'text-green-300')
  })

  it('should show error toast with correct styling', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Error Toast'))

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    const toast = screen.getByText('Error message').closest('div[class*="border-red-400/50"]')
    expect(toast).toHaveClass('border-red-400/50', 'bg-red-900/80', 'text-red-300')
  })

  it('should show warning toast with correct styling', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Warning Toast'))

    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    const toast = screen.getByText('Warning message').closest('div[class*="border-yellow-400/50"]')
    expect(toast).toHaveClass('border-yellow-400/50', 'bg-yellow-900/80', 'text-yellow-300')
  })

  it('should show info toast with correct styling', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Info Toast'))

    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })

    const toast = screen.getByText('Info message').closest('div[class*="border-cyan-400/50"]')
    expect(toast).toHaveClass('border-cyan-400/50', 'bg-cyan-900/80', 'text-cyan-300')
  })

  it('should allow manual toast dismissal', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Success Toast'))

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Click the close button (×)
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })
  })

  it('should auto-dismiss toast after duration', async () => {
    jest.useFakeTimers()

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Success Toast'))

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should handle multiple toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Success Toast'))
    fireEvent.click(screen.getByText('Add Error Toast'))

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  it('should throw error if useToast is used outside provider', () => {
    // Mock console.error to avoid cluttering test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within a ToastProvider')

    consoleSpy.mockRestore()
  })
})