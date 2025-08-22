'use client'

import { useEffect } from 'react'
import { useNavigationHistory } from './useNavigationHistory'

export function useKeyboardNavigation() {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if user is not typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true')
      ) {
        return
      }

      // Alt + Left Arrow = Go Back
      if (event.altKey && event.key === 'ArrowLeft' && canGoBack) {
        event.preventDefault()
        goBack()
      }

      // Alt + Right Arrow = Go Forward
      if (event.altKey && event.key === 'ArrowRight' && canGoForward) {
        event.preventDefault()
        goForward()
      }

      // Backspace = Go Back (like browsers)
      if (event.key === 'Backspace' && canGoBack) {
        event.preventDefault()
        goBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoBack, canGoForward, goBack, goForward])

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward
  }
}