
export const APP_NAME = 'Somali Intercity Transport System'
export const APP_SHORT_NAME = 'SITS'


export const ROUTES = {
 HOME: '/',
 LOGIN: '/login',
 REGISTER: '/register',
 PROFILE_SETUP: '/profile-setup',
 PROFILE: '/profile',
 

 SUPER_ADMIN_DASHBOARD: '/dashboard/super-admin',
 USERS_MANAGEMENT: '/dashboard/super-admin/users',
 CITIES: '/dashboard/super-admin/cities',
 STATIONS: '/dashboard/super-admin/stations',
 GLOBAL_REPORTS: '/dashboard/super-admin/reports',
 

 ADMIN_DASHBOARD: '/dashboard/admin',
 VEHICLES: '/dashboard/admin/vehicles',
 ADMIN_ROUTES: '/dashboard/admin/routes',
 PASSENGER_BOOKINGS: '/dashboard/admin/passenger-bookings',
 CARGO_BOOKINGS: '/dashboard/admin/cargo-bookings',
 ADMIN_PAYMENTS: '/dashboard/admin/payments',
 

 USER_DASHBOARD: '/dashboard/user',
 MY_PASSENGER_BOOKINGS: '/dashboard/user/passenger-bookings',
 MY_CARGO_BOOKINGS: '/dashboard/user/cargo-bookings',
 MY_PAYMENTS: '/dashboard/user/payments',
 

 ROUTE_DETAILS: '/routes/:id',
}


export const TOAST_DURATION = {
 SUCCESS: 3000,
 ERROR: 5000,
 INFO: 4000,
}


export const ITEMS_PER_PAGE = 10


export const DATE_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm'


export const STORAGE_KEYS = {
 LAST_ROUTE_SEARCH: 'sits-last-route-search',
}

