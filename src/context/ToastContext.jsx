import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
 const [toasts, setToasts] = useState([])

 const addToast = useCallback((toast) => {
 const id = Date.now() + Math.random()
 const newToast = {
 id,
 type: toast.type || 'info',
 message: toast.message,
 duration: toast.duration || (toast.type === 'error' ? 5000 : 3000),
 }
 setToasts((prev) => [...prev, newToast])


 setTimeout(() => {
 removeToast(id)
 }, newToast.duration)
 }, [])

 const removeToast = useCallback((id) => {
 setToasts((prev) => prev.filter((toast) => toast.id !== id))
 }, [])

 const success = useCallback(
 (message, duration) => {
 addToast({ type: 'success', message, duration })
 },
 [addToast]
 )

 const error = useCallback(
 (message, duration) => {
 addToast({ type: 'error', message, duration })
 },
 [addToast]
 )

 const info = useCallback(
 (message, duration) => {
 addToast({ type: 'info', message, duration })
 },
 [addToast]
 )

 const warning = useCallback(
 (message, duration) => {
 addToast({ type: 'warning', message, duration })
 },
 [addToast]
 )

 const showToast = useCallback(
 (message, type = 'info', duration) => {
 addToast({ type, message, duration })
 },
 [addToast]
 )

 const value = {
 toasts,
 addToast,
 removeToast,
 success,
 error,
 info,
 warning,
 showToast,
 }

 return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
 const context = useContext(ToastContext)
 if (context === null) {
 throw new Error('useToast must be used within a ToastProvider')
 }
 return context
}

