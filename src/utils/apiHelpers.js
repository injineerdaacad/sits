import { getErrorMessage } from './errorHelpers'

export function withTimeout(promise, timeoutMs = 10000) {
 return Promise.race([
 promise,
 new Promise((_, reject) =>
 setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
 ),
 ])
}

export async function safeApiCall(
 apiCall,
 defaultValue = null,
 timeoutMs = 10000,
 onError = null
) {
 try {
 const result = await withTimeout(apiCall(), timeoutMs)
 return result || defaultValue
 } catch (error) {
 const errorMessage = getErrorMessage(error)
 


 if (!error.message?.includes('Request timeout') && 
 !error.message?.includes('timeout')) {
 console.warn('API call failed:', errorMessage)
 }
 

 if (onError && typeof onError === 'function') {
 onError(errorMessage, error)
 }
 
 return defaultValue
 }
}

export async function safePromiseAll(
 apiCalls,
 defaultValue = null,
 timeoutMs = 10000,
 onError = null
) {
 const promises = apiCalls.map((apiCall) =>
 safeApiCall(apiCall, defaultValue, timeoutMs, onError)
 )
 return Promise.all(promises)
}

