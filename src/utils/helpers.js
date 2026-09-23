
export function formatCurrency(amount) {
 if (amount == null) return 'N/A'

 const formatted = new Intl.NumberFormat('en-US', {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 }).format(amount)
 return `$ ${formatted}`
}

export function formatDate(date, format = 'YYYY-MM-DD') {
 if (!date) return 'N/A'
 const d = new Date(date)
 if (isNaN(d.getTime())) return 'N/A'
 
 const year = d.getFullYear()
 const month = String(d.getMonth() + 1).padStart(2, '0')
 const day = String(d.getDate()).padStart(2, '0')
 const hours = String(d.getHours()).padStart(2, '0')
 const minutes = String(d.getMinutes()).padStart(2, '0')
 
 return format
 .replace('YYYY', year)
 .replace('MM', month)
 .replace('DD', day)
 .replace('HH', hours)
 .replace('mm', minutes)
}

export function formatTime(time) {
 if (!time) return 'N/A'
 if (typeof time === 'string') {

 if (time.includes('T')) {

 const d = new Date(time)
 if (!isNaN(d.getTime())) {
 const hours = String(d.getHours()).padStart(2, '0')
 const minutes = String(d.getMinutes()).padStart(2, '0')
 return `${hours}:${minutes}`
 }
 }

 return time.substring(0, 5)
 }

 const d = new Date(time)
 if (isNaN(d.getTime())) return 'N/A'
 const hours = String(d.getHours()).padStart(2, '0')
 const minutes = String(d.getMinutes()).padStart(2, '0')
 return `${hours}:${minutes}`
}

export function formatTime12Hour(time) {
 if (!time) return 'N/A'
 
 let hours = 0
 let minutes = 0
 
 if (typeof time === 'string') {

 if (time.includes('T')) {

 const d = new Date(time)
 if (!isNaN(d.getTime())) {
 hours = d.getHours()
 minutes = d.getMinutes()
 } else {
 return 'N/A'
 }
 } else {

 const timeMatch = time.match(/(\d{1,2}):(\d{2})/)
 if (timeMatch) {
 hours = parseInt(timeMatch[1], 10)
 minutes = parseInt(timeMatch[2], 10)
 } else {
 return 'N/A'
 }
 }
 } else {

 const d = new Date(time)
 if (isNaN(d.getTime())) return 'N/A'
 hours = d.getHours()
 minutes = d.getMinutes()
 }
 

 const period = hours >= 12 ? 'PM' : 'AM'
 const hours12 = hours % 12 || 12
 const minutesStr = String(minutes).padStart(2, '0')
 
 return `${hours12}:${minutesStr} ${period}`
}

export function getRelativeTime(date) {
 if (!date) return 'N/A'
 const d = new Date(date)
 if (isNaN(d.getTime())) return 'N/A'
 
 const now = new Date()
 const diffMs = now - d
 const diffMins = Math.floor(diffMs / 60000)
 const diffHours = Math.floor(diffMs / 3600000)
 const diffDays = Math.floor(diffMs / 86400000)
 
 if (diffMins < 1) return 'Just now'
 if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
 if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
 if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
 return formatDate(d)
}

export function truncate(text, maxLength = 50) {
 if (!text) return ''
 if (text.length <= maxLength) return text
 return text.substring(0, maxLength) + '...'
}

export function isValidEmail(email) {
 const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 return re.test(email)
}

export function isValidPhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/[\s\-+]/g, '')
  return /^\d{7,15}$/.test(cleaned)
}

export function formatWeekdayDateTime(departureTimeStr, departureDateStr) {
	if (!departureTimeStr || !departureDateStr) return ''
	try {
		const [year, month, day] = departureDateStr.split('-').map((v) => parseInt(v, 10))
		const [h, m, s] = departureTimeStr.split(':').map((v) => parseInt(v || '0', 10))
		const dt = new Date(year, (month - 1), day, h, m, s || 0)

		const weekdays = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jumco', 'Sabti']
		const weekday = weekdays[dt.getDay()] || ''

		const dd = String(dt.getDate()).padStart(2, '0')
		const mm = String(dt.getMonth() + 1).padStart(2, '0')
		const yyyy = dt.getFullYear()
		const dateStr = `${dd}-${mm}-${yyyy}`

		const time12 = formatTime12Hour(`${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`)

		return `${weekday}\n${dateStr}\n${time12}`
	} catch {
		return `${departureDateStr}\n${departureTimeStr}`
	}
}

export function formatWeekdayDateTimeFromTimestamp(ts) {
	if (!ts) return ''
	try {
		const dt = new Date(ts)
		const weekdays = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jumco', 'Sabti']
		const weekday = weekdays[dt.getDay()] || ''

		const dd = String(dt.getDate()).padStart(2, '0')
		const mm = String(dt.getMonth() + 1).padStart(2, '0')
		const yyyy = dt.getFullYear()
		const dateStr = `${dd}-${mm}-${yyyy}`

		const time12 = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

		return `${weekday}\n${dateStr}\n${time12}`
	} catch {
		return String(ts)
	}
}

export function formatWeekdayDateTimeFromTimestampEn(ts) {
  if (!ts) return ''
  try {
    const dt = new Date(ts)
    const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weekday = weekdaysEn[dt.getDay()] || ''

    const dd = String(dt.getDate()).padStart(2, '0')
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const yyyy = dt.getFullYear()
    const dateStr = `${dd}-${mm}-${yyyy}`

    const time12 = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return `${weekday}\n${dateStr}\n${time12}`
  } catch {
    return String(ts)
  }
}

export function formatPhone(phone) {
 if (!phone) return ''

 const cleaned = phone.replace(/\D/g, '')

 if (cleaned.length >= 9) {
 return `+252 ${cleaned.slice(-9, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`
 }
 return phone
}

export function formatDayDateEn(ts) {
	if (!ts) return 'N/A'
	try {
		const dt = new Date(ts)
		const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		const weekday = weekdaysEn[dt.getDay()] || ''
		const dd = String(dt.getDate()).padStart(2, '0')
		const mm = String(dt.getMonth() + 1).padStart(2, '0')
		const yyyy = dt.getFullYear()
		return `${weekday} ${dd}-${mm}-${yyyy}`
	} catch {
		return String(ts)
	}
}

export function formatDayDateTimeEn(ts) {
	if (!ts) return 'N/A'
	try {
		const dt = new Date(ts)
		const dateStr = formatDayDateEn(dt)
		const time12 = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		return `${dateStr} ${time12}`
	} catch {
		return String(ts)
	}
}

export function getInitials(firstName, lastName, middleName = '') {
 const first = firstName?.[0]?.toUpperCase() || ''
 const last = lastName?.[0]?.toUpperCase() || ''
 return `${first}${last}`
}

export function getFullName(profile) {
 if (!profile) return 'Unknown'
 const parts = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean)
 return parts.join(' ')
}

export function cn(...classes) {
 return classes.filter(Boolean).join(' ')
}

export function debounce(func, wait) {
 let timeout
 return function executedFunction(...args) {
 const later = () => {
 clearTimeout(timeout)
 func(...args)
 }
 clearTimeout(timeout)
 timeout = setTimeout(later, wait)
 }
}

export function hasPermission(userRole, requiredRole) {
 const roleHierarchy = {
 SUPER_ADMIN: 3,
 ADMIN: 2,
 USER: 1,
 }
 return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
}

export function getToday() {
 const today = new Date()
 return formatDate(today)
}

export function getTomorrow() {
 const tomorrow = new Date()
 tomorrow.setDate(tomorrow.getDate() + 1)
 return formatDate(tomorrow)
}

export function isToday(date) {
 if (!date) return false
 const d = new Date(date)
 const today = new Date()
 return (
 d.getDate() === today.getDate() &&
 d.getMonth() === today.getMonth() &&
 d.getFullYear() === today.getFullYear()
 )
}

export function isPast(date) {
 if (!date) return false
 return new Date(date) < new Date()
}

export function isFuture(date) {
 if (!date) return false
 return new Date(date) > new Date()
}

export function addDays(date, days) {
 const result = new Date(date)
 result.setDate(result.getDate() + days)
 return result
}