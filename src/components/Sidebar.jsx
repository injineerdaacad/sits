import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../context/AuthContext'
import { getNavigationByRole } from '../utils/navigation'
import { cn } from '../utils/helpers'

export default function Sidebar({ isOpen, onClose }) {
 const { profile } = useAuth()
 const role = profile?.role || 'USER'
 const navItems = getNavigationByRole(role)

 return (
 <>
 
 {isOpen && (
 <div
 className="fixed inset-0 bg-black/50 z-40 lg:hidden"
 onClick={onClose}
 />
 )}

 
 <aside
 className={cn(
 'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
 isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
 )}
 >
 <nav className="h-full overflow-y-auto p-4">
 <ul className="space-y-1">
 {navItems.map((item) => (
 <li key={item.path}>
 <NavLink
 to={item.path}
 onClick={onClose}
 className={({ isActive }) =>
 cn(
 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
 isActive
 ? 'bg-sky-100 text-sky-700'
 : 'text-gray-700 hover:bg-gray-100'
 )
 }
 >
 <FontAwesomeIcon icon={item.icon} className="w-5" />
 <span>{item.label}</span>
 </NavLink>
 </li>
 ))}
 </ul>
 </nav>
 </aside>
 </>
 )
}

