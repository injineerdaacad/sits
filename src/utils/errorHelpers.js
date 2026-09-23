
export function getErrorMessage(error) {
 if (!error) return 'An unknown error occurred'


 if (error.message) {
 const message = error.message.toLowerCase()


 if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
 return 'Please verify your email before signing in. Check your inbox for the confirmation link.'
 }

 if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
 return 'Invalid email or password. Please check your credentials and try again.'
 }

 if (message.includes('user not found')) {
 return 'No account found with this email. Please sign up first.'
 }


 if (message.includes('rate limit') || message.includes('security purposes')) {
 const waitMatch = error.message.match(/(\d+)\s*seconds?/i)
 const waitTime = waitMatch ? waitMatch[1] : '30'
 return `Too many attempts. Please wait ${waitTime} seconds before trying again.`
 }


 if (message.includes('network') || message.includes('fetch')) {
 return 'Network error. Please check your internet connection and try again.'
 }


 if (message.includes('timeout') || message.includes('request timeout')) {
 return 'Request timed out. The server is taking too long to respond. Please try again.'
 }


 if (message.includes('row-level security') || message.includes('permission denied')) {
 return 'You do not have permission to perform this action.'
 }


 return error.message
 }


 if (error.status || error.statusCode) {
 const status = error.status || error.statusCode

 switch (status) {
 case 400:
 return 'Bad request. Please check your input and try again.'
 case 401:
 return 'Unauthorized. Please sign in to continue.'
 case 403:
 return 'Access denied. You do not have permission to perform this action.'
 case 404:
 return 'Resource not found. The requested item does not exist.'
 case 409:
 return 'Conflict. This resource already exists.'
 case 422:
 return 'Validation error. Please check your input.'
 case 429:
 return 'Too many requests. Please wait a moment and try again.'
 case 500:
 return 'Server error. Something went wrong on our end. Please try again later.'
 case 502:
 return 'Bad gateway. The server is temporarily unavailable.'
 case 503:
 return 'Service unavailable. The server is temporarily down for maintenance.'
 case 504:
 return 'Gateway timeout. The server took too long to respond.'
 default:
 return `Error ${status}. Something went wrong.`
 }
 }


 if (error.code) {
 switch (error.code) {
 case 'PGRST116':
 return 'Resource not found.'
 case '23505':
 return 'This record already exists.'
 case '23503':
 return 'Cannot delete this item because it is being used elsewhere.'
 default:
 return error.message || 'An error occurred.'
 }
 }


 return error.toString() || 'An unknown error occurred. Please try again.'
}

export function getErrorType(error) {
 if (!error) return 'unknown'


 if (error.status || error.statusCode) {
 const status = error.status || error.statusCode
 if (status >= 400 && status < 500) return 'client'
 if (status >= 500) return 'server'
 }


 if (error.message?.toLowerCase().includes('network') || 
 error.message?.toLowerCase().includes('fetch')) {
 return 'network'
 }


 if (error.message?.toLowerCase().includes('timeout')) {
 return 'timeout'
 }

 return 'unknown'
}

export function isNetworkError(error) {
 return getErrorType(error) === 'network' || 
 error?.message?.toLowerCase().includes('network') ||
 error?.message?.toLowerCase().includes('fetch failed')
}

export function isTimeoutError(error) {
 return getErrorType(error) === 'timeout' ||
 error?.message?.toLowerCase().includes('timeout')
}

export function isNotFoundError(error) {
 return error?.status === 404 || 
 error?.statusCode === 404 ||
 error?.code === 'PGRST116'
}

export function isServerError(error) {
 const status = error?.status || error?.statusCode
 return status >= 500 && status < 600
}

