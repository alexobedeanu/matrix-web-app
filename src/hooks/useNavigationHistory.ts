'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationEntry {
  path: string
  label: string
  timestamp: number
}

export function useNavigationHistory() {
  const pathname = usePathname()
  const router = useRouter()
  const [history, setHistory] = useState<NavigationEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Page labels mapping
  const getPageLabel = (path: string): string => {
    const pageMap: Record<string, string> = {
      '/': 'Home',
      '/puzzles': 'Puzzles',
      '/missions': 'Missions', 
      '/leaderboard': 'Leaderboard',
      '/achievements': 'Achievements',
      '/clans': 'Clans',
      '/chat': 'Chat',
      '/inventory': 'Inventory',
      '/duels': 'Duels',
      '/profile': 'Profile',
      '/login': 'Login',
      '/register': 'Register'
    }

    // Check for exact match first
    if (pageMap[path]) return pageMap[path]

    // Handle dynamic routes like /puzzles/123
    const segments = path.split('/').filter(Boolean)
    if (segments.length > 1) {
      const baseRoute = '/' + segments[0]
      if (pageMap[baseRoute]) {
        return `${pageMap[baseRoute]} - ${segments[1]}`
      }
    }

    // Fallback to formatted path
    return segments.length > 0 
      ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
      : 'Page'
  }

  // Track navigation changes
  useEffect(() => {
    if (!pathname) return

    const label = getPageLabel(pathname)
    const newEntry: NavigationEntry = {
      path: pathname,
      label,
      timestamp: Date.now()
    }

    setHistory(prev => {
      // If we're navigating after going back, remove future entries
      const truncatedHistory = prev.slice(0, currentIndex + 1)
      
      // Don't add duplicate consecutive entries
      if (truncatedHistory.length > 0 && truncatedHistory[truncatedHistory.length - 1].path === pathname) {
        return prev
      }

      // Add new entry and limit to 20 entries
      const newHistory = [...truncatedHistory, newEntry].slice(-20)
      
      // Update current index
      setTimeout(() => {
        setCurrentIndex(newHistory.length - 1)
      }, 0)
      
      return newHistory
    })
  }, [pathname, currentIndex])

  // Navigation functions
  const canGoBack = currentIndex > 0 || history.length > 1
  const canGoForward = currentIndex < history.length - 1

  const goBack = () => {
    if (currentIndex > 0) {
      const previousEntry = history[currentIndex - 1]
      setCurrentIndex(currentIndex - 1)
      router.push(previousEntry.path)
    } else if (history.length > 1) {
      router.back()
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const nextEntry = history[currentIndex + 1]
      setCurrentIndex(currentIndex + 1)
      router.push(nextEntry.path)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const getCurrentPageLabel = () => {
    return getPageLabel(pathname)
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', path: '/' }]
    
    let currentPath = ''
    segments.forEach(segment => {
      currentPath += '/' + segment
      breadcrumbs.push({
        label: getPageLabel(currentPath),
        path: currentPath
      })
    })
    
    return breadcrumbs
  }

  return {
    history,
    currentIndex,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    navigateTo,
    getCurrentPageLabel,
    getBreadcrumbs,
    currentPath: pathname
  }
}