import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox } from '@fortawesome/free-solid-svg-icons'

export function EmptyState({
 icon = faInbox,
 title = 'No data found',
 message = 'There is no data to display at this time.',
 action,
}) {
 return (
 <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
 <div className="mb-4 text-slate-400">
 <FontAwesomeIcon icon={icon} size="3x" />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 mb-2">
 {title}
 </h3>
 <p className="text-sm text-slate-500 mb-4 max-w-sm">
 {message}
 </p>
 {action && <div>{action}</div>}
 </div>
 )
}

