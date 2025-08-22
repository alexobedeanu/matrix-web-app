'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'], duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastMessage({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const typeStyles = {
    success: 'border-green-400/50 bg-green-900/80 text-green-300',
    error: 'border-red-400/50 bg-red-900/80 text-red-300',
    warning: 'border-yellow-400/50 bg-yellow-900/80 text-yellow-300',
    info: 'border-cyan-400/50 bg-cyan-900/80 text-cyan-300'
  }

  const typeIcons = {
    success: '✓',
    error: '✗', 
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`
      border rounded-none px-6 py-4 backdrop-blur-sm shadow-lg 
      font-mono text-sm max-w-sm transition-all duration-300
      animate-slide-in-right ${typeStyles[toast.type]}
    `}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[toast.type]}</span>
        <div className="flex-1">
          <p className="leading-relaxed">{toast.message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-lg hover:opacity-70 transition-opacity flex-shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}