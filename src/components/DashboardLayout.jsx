import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(false)

 const toggleSidebar = () => {
 setSidebarOpen((prev) => !prev)
 }

 const closeSidebar = () => {
 setSidebarOpen(false)
 }

 return (
 <div className="min-h-screen bg-gray-50">
 <Header onMenuToggle={toggleSidebar} />
 <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
 
 
 <main className="lg:ml-64 pt-16">
 <div className="p-4 lg:p-6">
 {children}
 </div>
 </main>
 </div>
 )
}

