import { useToast } from '../hooks/useToast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faCheckCircle,
 faExclamationCircle,
 faInfoCircle,
 faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { IconButton } from './IconButton'
import { cn } from '../utils/helpers'

export function ToastContainer() {
 const { toasts, removeToast } = useToast()

 if (toasts.length === 0) return null

 return (
 <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
 {toasts.map((toast) => {
 const icons = {
 success: faCheckCircle,
 error: faExclamationCircle,
 info: faInfoCircle,
 warning: faExclamationCircle,
 }

 const colors = {
 success:
 'bg-green-50 border-green-200 text-green-800',
 error:
 'bg-red-50 border-red-200 text-red-800',
 info: 'bg-blue-50 border-blue-200 text-blue-800',
 warning:
 'bg-yellow-50 border-yellow-200 text-yellow-800',
 }

 return (
 <div
 key={toast.id}
 className={cn(
 'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right',
 colors[toast.type]
 )}
 >
 <FontAwesomeIcon
 icon={icons[toast.type]}
 className="mt-0.5 flex-shrink-0"
 />
 <p className="flex-1 text-sm font-medium">{toast.message}</p>
 <IconButton
 variant="ghost"
 size="sm"
 onClick={() => removeToast(toast.id)}
 className="flex-shrink-0"
 >
 <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
 </IconButton>
 </div>
 )
 })}
 </div>
 )
}

