import { createContext, useCallback, useContext, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
