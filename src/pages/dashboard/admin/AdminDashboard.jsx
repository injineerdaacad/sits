import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faTruck,
 faRoute,
 faUser,
 faBox,
 faCreditCard,
 faClock,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../../context/AuthContext'
import { getVehiclesByStation } from '../../../lib/api/vehiclesApi'
import { getRoutesByStation } from '../../../lib/api/routesApi'
import { getPassengerBookingsByStation } from '../../../lib/api/passengerBookingsApi'
import { getCargoBookingsByStation } from '../../../lib/api/cargoBookingsApi'
import { getPaymentsByStation } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { PASSENGER_STATUS, CARGO_STATUS } from '../../../utils/enums'
import { safePromiseAll } from '../../../utils/apiHelpers'
import { getErrorMessage } from '../../../utils/errorHelpers'
import { formatDate, formatTime12Hour, getRelativeTime } from '../../../utils/helpers'

export default function AdminDashboard() {
 const { profile } = useAuth()
 const [stats, setStats] = useState({
 vehicles: 0,
 routes: 0,
 todayDepartures: 0,
 pendingPassengerBookings: 0,
 pendingCargoBookings: 0,
 totalPayments: 0,
 })
 const [recentBookings, setRecentBookings] = useState([])
 const [todaySchedule, setTodaySchedule] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 if (profile?.station_id) {
 loadDashboardData()
 } else {
 setIsLoading(false)
 showToast('No station assigned. Please contact Super Admin.', 'warning')
 }
 }, [profile])

 const loadDashboardData = async () => {
 if (!profile?.station_id) return

 try {
 setIsLoading(true)
 const stationId = profile.station_id


 const handleError = (errorMessage, error) => {
 if (!error?.message?.includes('Request timeout')) {
 showToast(errorMessage, 'error')
 }
 }


 const [
 vehicles,
 routes,
 passengerBookings,
 cargoBookings,
 payments,
 ] = await safePromiseAll(
 [
 () => getVehiclesByStation(stationId),
 () => getRoutesByStation(stationId),
 () => getPassengerBookingsByStation(stationId),
 () => getCargoBookingsByStation(stationId),
 () => getPaymentsByStation(stationId),
 ],
 [],
 10000,
 handleError
 )


 const today = new Date().toISOString().split('T')[0]
 const todayDepartures = Array.isArray(routes)
 ? routes.filter((route) => {
 if (!route?.departure_time) return false



 return route.is_active !== false
 })
 : []


 const pendingPassenger = Array.isArray(passengerBookings)
 ? passengerBookings.filter(
 (booking) => booking?.status === PASSENGER_STATUS.PENDING
 )
 : []
 const pendingCargo = Array.isArray(cargoBookings)
 ? cargoBookings.filter(
 (booking) => booking?.status === CARGO_STATUS.PENDING
 )
 : []


 const totalPaymentAmount = Array.isArray(payments)
 ? payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0)
 : 0


 const allBookings = [
 ...(Array.isArray(passengerBookings) ? passengerBookings.map(b => ({ ...b, type: 'passenger' })) : []),
 ...(Array.isArray(cargoBookings) ? cargoBookings.map(b => ({ ...b, type: 'cargo' })) : []),
 ]
 const recent = allBookings
 .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
 .slice(0, 5)


 const schedule = Array.isArray(routes)
 ? routes
 .filter((route) => route.is_active !== false)
 .sort((a, b) => {
 const timeA = a.departure_time || ''
 const timeB = b.departure_time || ''
 return timeA.localeCompare(timeB)
 })
 .slice(0, 5)
 : []

 setStats({
 vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
 routes: Array.isArray(routes) ? routes.length : 0,
 todayDepartures: todayDepartures.length,
 pendingPassengerBookings: pendingPassenger.length,
 pendingCargoBookings: pendingCargo.length,
 totalPayments: totalPaymentAmount,
 })
 setRecentBookings(recent)
 setTodaySchedule(schedule)
 } catch (error) {
 console.error('Error loading dashboard data:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage || 'Failed to load dashboard data. Some information may be incomplete.', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const statCards = [
 {
 label: 'My Vehicles',
 value: stats.vehicles,
 icon: faTruck,
 color: 'bg-blue-500',
 },
 {
 label: 'My Routes',
 value: stats.routes,
 icon: faRoute,
 color: 'bg-green-500',
 },
 {
 label: "Today's Departures",
 value: stats.todayDepartures,
 icon: faClock,
 color: 'bg-orange-500',
 },
 {
 label: 'Pending Passenger Bookings',
 value: stats.pendingPassengerBookings,
 icon: faUser,
 color: 'bg-yellow-500',
 },
 {
 label: 'Pending Cargo Bookings',
 value: stats.pendingCargoBookings,
 icon: faBox,
 color: 'bg-purple-500',
 },
 {
 label: 'Total Payments',
 value: `$${stats.totalPayments.toLocaleString()}`,
 icon: faCreditCard,
 color: 'bg-emerald-500',
 },
 ]

 if (isLoading) {
 return (
 <DashboardLayout>
 <div className="flex items-center justify-center min-h-[400px]">
 <LoadingSpinner />
 </div>
 </DashboardLayout>
 )
 }

 if (!profile?.station_id) {
 return (
 <DashboardLayout>
 <Card className="p-6">
 <p className="text-gray-600">
 No station assigned. Please contact Super Admin to assign you to a station.
 </p>
 </Card>
 </DashboardLayout>
 )
 }

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Admin Dashboard
 </h1>
 <p className="text-gray-600 mt-2">
 Manage your station's transport services
 </p>
 </div>

 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {statCards.map((stat) => (
 <Card key={stat.label} className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 {stat.label}
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {stat.value}
 </p>
 </div>
 <div
 className={`${stat.color} p-4 rounded-lg text-white`}
 >
 <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
 </div>
 </div>
 </Card>
 ))}
 </div>

 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Recent Bookings
 </h2>
 {recentBookings.length === 0 ? (
 <p className="text-gray-500">
 No recent bookings
 </p>
 ) : (
 <div className="space-y-3">
 {recentBookings.map((booking) => (
 <div
 key={booking.id}
 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
 >
 <div className="flex items-center gap-3 flex-1">
 <div
 className={`p-2 rounded-lg ${
 booking.type === 'passenger'
 ? 'bg-blue-100'
 : 'bg-purple-100'
 }`}
 >
 <FontAwesomeIcon
 icon={booking.type === 'passenger' ? faUser : faBox}
 className={
 booking.type === 'passenger'
 ? 'text-blue-600'
 : 'text-purple-600'
 }
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {booking.type === 'passenger'
 ? booking.full_name
 : booking.sender_name}
 </p>
 <p className="text-xs text-gray-500">
 {booking.routes?.cities_from?.name ||
 booking.routes?.from_city_name}{' '}
 →{' '}
 {booking.routes?.cities_to?.name ||
 booking.routes?.to_city_name}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xs text-gray-500">
 {getRelativeTime(booking.created_at)}
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>

 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Today's Schedule
 </h2>
 {todaySchedule.length === 0 ? (
 <p className="text-gray-500">
 No departures scheduled for today
 </p>
 ) : (
 <div className="space-y-3">
 {todaySchedule.map((route) => (
 <div
 key={route.id}
 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
 >
 <div className="flex items-center gap-3 flex-1">
 <div className="p-2 rounded-lg bg-green-100">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-green-600"
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {route.cities_from?.name || route.from_city_name} →{' '}
 {route.cities_to?.name || route.to_city_name}
 </p>
 <p className="text-xs text-gray-500">
 {route.vehicles?.name || 'N/A'} • {route.departure_place || 'N/A'}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-medium text-gray-900">
 {formatTime12Hour(route.departure_time)}
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 </div>
 </DashboardLayout>
 )
}

