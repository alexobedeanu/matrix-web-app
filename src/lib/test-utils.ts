import React from 'react'
import { render } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/Toast'

// Mock session for testing
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  expires: '2024-01-01',
}

// Test wrapper with providers
export function renderWithProviders(ui: React.ReactElement, options: { session?: any } = {}) {
  const { session = mockSession } = options
  return render(
    React.createElement(SessionProvider, { session }, 
      React.createElement(ToastProvider, null, ui)
    )
  )
}

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

// Mock fetch globally
export const mockFetch = (response: any) => {
  global.fetch = jest.fn(() => mockApiResponse(response))
}

// Test data generators
export const createTestPuzzle = (overrides = {}) => ({
  id: 'test-puzzle-id',
  title: 'Test Puzzle',
  description: 'A test puzzle for unit testing',
  category: 'WEB_SECURITY',
  difficulty: 'EASY',
  xpReward: 100,
  coinReward: 25,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  isSolved: false,
  timeToSolve: null,
  ...overrides,
})

export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  hackerAlias: 'TestHacker',
  level: 1,
  xp: 100,
  coins: 50,
  streak: 5,
  lastActive: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createTestMission = (overrides = {}) => ({
  id: 'test-mission-id',
  title: 'Test Mission',
  description: 'A test mission',
  type: 'SOLVE_PUZZLES',
  target: 1,
  xpReward: 50,
  coinReward: 25,
  category: 'DAILY',
  icon: '🎯',
  progress: 0,
  isCompleted: false,
  expiresAt: '2024-01-02T00:00:00Z',
  timeRemaining: '24h',
  ...overrides,
})