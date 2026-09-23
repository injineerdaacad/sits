import { useEffect } from 'react'
import { IconButton } from './IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../utils/helpers'

export function Modal({
 isOpen,
 onClose,
 title,
 children,
 size = 'md',
 className = '',
}) {
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden'
 } else {
 document.body.style.overflow = 'unset'
 }
 return () => {
 document.body.style.overflow = 'unset'
 }
 }, [isOpen])

 if (!isOpen) return null

 const sizes = {
 sm: 'max-w-md',
 md: 'max-w-lg',
 lg: 'max-w-2xl',
 xl: 'max-w-4xl',
 }

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
 onClick={onClose}
 >
 <div
 className={cn(
 'bg-white rounded-lg shadow-xl w-full',
 sizes[size],
 className
 )}
 onClick={(e) => e.stopPropagation()}
 >
 {title && (
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h2 className="text-xl font-semibold text-slate-900">
 {title}
 </h2>
 <IconButton variant="ghost" size="sm" onClick={onClose}>
 <FontAwesomeIcon icon={faTimes} />
 </IconButton>
 </div>
 )}
 <div className="px-6 py-4">{children}</div>
 </div>
 </div>
 )
}

