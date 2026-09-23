import { createContext, useContext, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(false)

 const toggleSidebar = () => {
 setSidebarOpen((prev) => !prev)
 }

 const closeSidebar = () => {
 setSidebarOpen(false)
 }

 const value = {
 sidebarOpen,
 setSidebarOpen,
 toggleSidebar,
 closeSidebar,
 }

 return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
 const context = useContext(UIContext)
 if (context === null) {
 throw new Error('useUI must be used within a UIProvider')
 }
 return context
}

