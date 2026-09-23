import { forwardRef } from 'react'
import { cn } from '../utils/helpers'

export const Select = forwardRef(
 (
 {
 label,
 error,
 helperText,
 options = [],
 placeholder = 'Select...',
 className = '',
 ...props
 },
 ref
 ) => {
 const baseStyles =
 'w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors'

 const errorStyles =
 'border-red-500 focus:ring-red-500'

 return (
 <div className="w-full">
 {label && (
 <label className="block text-sm font-medium text-slate-700 mb-1">
 {label}
 {props.required && <span className="text-red-500 ml-1">*</span>}
 </label>
 )}
 <select
 ref={ref}
 className={cn(
 baseStyles,
 error && errorStyles,
 !error && 'border-slate-300',
 className
 )}
 {...props}
 >
 {placeholder && (
 <option value="" disabled>
 {placeholder}
 </option>
 )}
 {options.map((option) => {
 if (typeof option === 'string') {
 return (
 <option key={option} value={option}>
 {option}
 </option>
 )
 }
 return (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 )
 })}
 </select>
 {error && (
 <p className="mt-1 text-sm text-red-600">{error}</p>
 )}
 {helperText && !error && (
 <p className="mt-1 text-sm text-slate-500">
 {helperText}
 </p>
 )}
 </div>
 )
 }
)

Select.displayName = 'Select'

