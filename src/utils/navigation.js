
import { 
 faHome, 
 faUsers, 
 faCity, 
 faBuilding, 
 faTruck, 
 faRoute, 
 faUser, 
 faBox, 
 faCreditCard,
 faChartBar,
 faCog
} from '@fortawesome/free-solid-svg-icons'

export const SUPER_ADMIN_NAV = [
 {
 label: 'Dashboard',
 path: '/dashboard/super-admin',
 icon: faHome,
 },
 {
 label: 'Users',
 path: '/dashboard/super-admin/users',
 icon: faUsers,
 },
 {
 label: 'Cities',
 path: '/dashboard/super-admin/cities',
 icon: faCity,
 },
 {
 label: 'Stations',
 path: '/dashboard/super-admin/stations',
 icon: faBuilding,
 },
 {
 label: 'Vehicles',
 path: '/dashboard/super-admin/vehicles',
 icon: faTruck,
 },
 {
 label: 'Routes',
 path: '/dashboard/super-admin/routes',
 icon: faRoute,
 },
 {
 label: 'Passenger Bookings',
 path: '/dashboard/super-admin/passenger-bookings',
 icon: faUser,
 },
 {
 label: 'Cargo Bookings',
 path: '/dashboard/super-admin/cargo-bookings',
 icon: faBox,
 },
 {
 label: 'Payments',
 path: '/dashboard/super-admin/payments',
 icon: faCreditCard,
 },
 {
 label: 'Reports',
 path: '/dashboard/super-admin/reports',
 icon: faChartBar,
 },
]

export const ADMIN_NAV = [
 {
 label: 'Dashboard',
 path: '/dashboard/admin',
 icon: faHome,
 },
 {
 label: 'Vehicles',
 path: '/dashboard/admin/vehicles',
 icon: faTruck,
 },
 {
 label: 'Routes',
 path: '/dashboard/admin/routes',
 icon: faRoute,
 },
 {
 label: 'Passenger Bookings',
 path: '/dashboard/admin/passenger-bookings',
 icon: faUser,
 },
 {
 label: 'Cargo Bookings',
 path: '/dashboard/admin/cargo-bookings',
 icon: faBox,
 },
 {
 label: 'Payments',
 path: '/dashboard/admin/payments',
 icon: faCreditCard,
 },
]

export const USER_NAV = [
 {
 label: 'Dashboard',
 path: '/dashboard/user',
 icon: faHome,
 },
 {
 label: 'My Passenger Bookings',
 path: '/dashboard/user/passenger-bookings',
 icon: faUser,
 },
 {
 label: 'My Cargo Bookings',
 path: '/dashboard/user/cargo-bookings',
 icon: faBox,
 },
 {
 label: 'My Payments',
 path: '/dashboard/user/payments',
 icon: faCreditCard,
 },
]

export function getNavigationByRole(role) {
 switch (role) {
 case 'SUPER_ADMIN':
 return SUPER_ADMIN_NAV
 case 'ADMIN':
 return ADMIN_NAV
 case 'USER':
 return USER_NAV
 default:
 return []
 }
}

export function getDashboardPath(role) {
 switch (role) {
 case 'SUPER_ADMIN':
 return '/dashboard/super-admin'
 case 'ADMIN':
 return '/dashboard/admin'
 case 'USER':
 return '/dashboard/user'
 default:
 return '/'
 }
}

