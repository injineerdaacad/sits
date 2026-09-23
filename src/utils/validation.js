
export { isValidEmail, isValidPhone } from './helpers'

export function isRequired(value) {
 if (value === null || value === undefined) return false
 if (typeof value === 'string') return value.trim().length > 0
 return true
}

export function minLength(value, min) {
 if (!value) return false
 return String(value).length >= min
}

export function maxLength(value, max) {
 if (!value) return true
 return String(value).length <= max
}

export function isNumeric(value) {
 if (value === null || value === undefined) return false
 return !isNaN(parseFloat(value)) && isFinite(value)
}

export function isPositive(value) {
 if (!isNumeric(value)) return false
 return parseFloat(value) > 0
}

export function isNonNegative(value) {
 if (!isNumeric(value)) return false
 return parseFloat(value) >= 0
}

