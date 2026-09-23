import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useAuth } from '../../../context/AuthContext'
import {
 getPassengerBookings,
 getPassengerBookingsByStation,
 updatePassengerBooking,
} from '../../../lib/api/passengerBookingsApi'
import { useToast } from '../../../hooks/useToast'
import { PASSENGER_STATUS, STATUS_COLORS } from '../../../utils/enums'
import { formatDate, formatTime, formatDayDateTimeEn } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export default function PassengerBookingsPage() {
 const { profile } = useAuth()
 const [bookings, setBookings] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 if (profile?.role === 'SUPER_ADMIN' || profile?.station_id) {
 loadBookings()
 }
 }, [profile])

 const loadBookings = async () => {

 if (profile?.role === 'SUPER_ADMIN') {
 try {
 setIsLoading(true)
 const data = await getPassengerBookings()
 setBookings(data || [])
 } catch (error) {
 console.error('Error loading bookings:', error)
 showToast('Failed to load bookings', 'error')
 } finally {
 setIsLoading(false)
 }
 } else if (profile?.station_id) {
 try {
 setIsLoading(true)
 const data = await getPassengerBookingsByStation(profile.station_id)
 setBookings(data || [])
 } catch (error) {
 console.error('Error loading bookings:', error)
 showToast('Failed to load bookings', 'error')
 } finally {
 setIsLoading(false)
 }
 }
 }

 const handleStatusUpdate = async (bookingId, newStatus) => {
 try {
 await updatePassengerBooking(bookingId, { status: newStatus })
 showToast('Booking status updated', 'success')
 loadBookings()
 } catch (error) {
 console.error('Error updating booking:', error)
 showToast('Failed to update booking', 'error')
 }
 }

 if (profile?.role !== 'SUPER_ADMIN' && !profile?.station_id) {
 return (
 <DashboardLayout>
 <Card className="p-6">
 <p className="text-gray-600">
 No station assigned. Please contact Super Admin.
 </p>
 </Card>
 </DashboardLayout>
 )
 }

 if (isLoading) {
 return (
 <DashboardLayout>
 <div className="flex items-center justify-center min-h-[400px]">
 <LoadingSpinner />
 </div>
 </DashboardLayout>
 )
 }

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Passenger Bookings
 </h1>
 <p className="text-gray-600 mt-2">
 {profile?.role === 'SUPER_ADMIN' 
 ? 'View all passenger bookings across all stations'
 : 'Manage passenger bookings for your station'}
 </p>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Passenger
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Route
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Updated</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Seats
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Phone
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Status
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {bookings.length === 0 ? (
 <tr>
 <td colSpan="6" className="py-8 text-center text-gray-500">
 No bookings found
 </td>
 </tr>
 ) : (
 bookings.map((booking) => (
 <tr
 key={booking.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faUser}
 className="text-gray-400"
 />
 <span className="text-gray-900">
 {booking.full_name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4">
 <div className="text-sm">
 <div className="text-gray-900">
 {booking.routes?.cities_from?.name || booking.routes?.from_city_name} →{' '}
 {booking.routes?.cities_to?.name || booking.routes?.to_city_name}
 </div>
		<div className="text-xs text-gray-500">
			{formatDayDateTimeEn(booking.routes?.departure_time)}
		</div>
 </div>
 </td>
<td className="py-3 px-4 text-xs text-gray-600">
	{booking.created_at ? formatDayDateTimeEn(booking.created_at) : '—'}
</td>
<td className="py-3 px-4 text-xs text-gray-600">
	{booking.updated_at ? formatDayDateTimeEn(booking.updated_at) : '—'}
</td>
 <td className="py-3 px-4 text-gray-900">
 {booking.seat_count}
 </td>
 <td className="py-3 px-4 text-gray-600">
 {booking.phone}
 </td>
 <td className="py-3 px-4">
 <Badge className={STATUS_COLORS[booking.status]}>
 {booking.status}
 </Badge>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 {booking.status === PASSENGER_STATUS.PENDING && (
 <>
 <Button
 variant="ghost"
 size="sm"
 onClick={() =>
 handleStatusUpdate(
 booking.id,
 PASSENGER_STATUS.CONFIRMED
 )
 }
 className="text-green-600"
 >
 <FontAwesomeIcon icon={faCheck} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() =>
 handleStatusUpdate(
 booking.id,
 PASSENGER_STATUS.CANCELLED
 )
 }
 className="text-red-600"
 >
 <FontAwesomeIcon icon={faTimes} />
 </Button>
 </>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 </DashboardLayout>
 )
}