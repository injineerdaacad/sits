import { cn } from '../utils/helpers'

export function IconButton({
 children,
 variant = 'ghost',
 size = 'md',
 className = '',
 ...props
}) {
 const baseStyles =
 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

 const variants = {
 primary:
 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
 secondary:
 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
 danger:
 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
 ghost:
 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
 }

 const sizes = {
 sm: 'p-1.5',
 md: 'p-2',
 lg: 'p-3',
 }

 return (
 <button
 className={cn(baseStyles, variants[variant], sizes[size], className)}
 {...props}
 >
 {children}
 </button>
 )
}

