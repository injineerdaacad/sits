import { cn } from '../utils/helpers'

export function Card({
 children,
 title,
 subtitle,
 actions,
 className = '',
 ...props
}) {
 return (
 <div
 className={cn(
 'bg-white rounded-lg border border-slate-200 shadow-sm',
 className
 )}
 {...props}
 >
 {(title || subtitle || actions) && (
 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <div>
 {title && (
 <h3 className="text-lg font-semibold text-slate-900">
 {title}
 </h3>
 )}
 {subtitle && (
 <p className="text-sm text-slate-500 mt-1">
 {subtitle}
 </p>
 )}
 </div>
 {actions && <div className="flex items-center gap-2">{actions}</div>}
 </div>
 )}
 <div className="px-6 py-4">{children}</div>
 </div>
 )
}

