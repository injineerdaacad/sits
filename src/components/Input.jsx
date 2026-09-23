import { forwardRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../utils/helpers'

export const Input = forwardRef(
 (
 {
 label,
 error,
 helperText,
 className = '',
 type = 'text',
 icon,
 showPasswordToggle = false,
 ...props
 },
 ref
 ) => {
 const [showPassword, setShowPassword] = useState(false)
 const isPasswordType = type === 'password'
 const inputType = isPasswordType && showPassword ? 'text' : type

 const baseStyles =
 'w-full border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors'

 const errorStyles =
 'border-red-500 focus:ring-red-500'


 const paddingLeft = icon ? 'pl-10' : 'px-3'
 const paddingRight = (isPasswordType && showPasswordToggle) ? 'pr-10' : 'px-3'
 const paddingY = 'py-2'

 return (
 <div className="w-full">
 {label && (
 <label className="block text-sm font-medium text-slate-700 mb-1">
 {label}
 {props.required && <span className="text-red-500 ml-1">*</span>}
 </label>
 )}
 <div className="relative">
 
 {icon && (
 <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
 <FontAwesomeIcon icon={icon} className="text-sm" />
 </div>
 )}

 
 <input
 ref={ref}
 type={inputType}
 className={cn(
 baseStyles,
 paddingLeft,
 paddingRight,
 paddingY,
 error && errorStyles,
 !error && 'border-slate-300',
 className
 )}
 {...props}
 />

 
 {isPasswordType && showPasswordToggle && (
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
 tabIndex={-1}
 >
 <FontAwesomeIcon
 icon={showPassword ? faEyeSlash : faEye}
 className="text-sm"
 />
 </button>
 )}
 </div>
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

Input.displayName = 'Input'

