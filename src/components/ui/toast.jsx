import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertCircle, CheckCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all ${
            t.variant === 'destructive' 
              ? 'bg-destructive/10 border-destructive/50 text-destructive' 
              : 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
          }`}>
            {t.variant === 'destructive' ? <AlertCircle className="size-5 shrink-0" /> : <CheckCircle className="size-5 shrink-0" />}
            <div className="flex-1">
              {t.title && <h5 className="font-semibold text-sm">{t.title}</h5>}
              {t.description && <p className="text-sm opacity-90">{t.description}</p>}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="opacity-50 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
