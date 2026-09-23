import { cn } from '../utils/helpers'

export function Badge({
 children,
 variant = 'default',
 size = 'md',
 className = '',
 ...props
}) {
 const baseStyles = 'inline-flex items-center font-medium rounded-full'

 const variants = {
 default:
 'bg-slate-100 text-slate-800',
 primary:
 'bg-sky-100 text-sky-800',
 success:
 'bg-green-100 text-green-800',
 warning:
 'bg-yellow-100 text-yellow-800',
 danger:
 'bg-red-100 text-red-800',
 info:
 'bg-blue-100 text-blue-800',
 }

 const sizes = {
 sm: 'px-2 py-0.5 text-xs',
 md: 'px-2.5 py-1 text-sm',
 lg: 'px-3 py-1.5 text-base',
 }

 return (
 <span
 className={cn(baseStyles, variants[variant], sizes[size], className)}
 {...props}
 >
 {children}
 </span>
 )
}

