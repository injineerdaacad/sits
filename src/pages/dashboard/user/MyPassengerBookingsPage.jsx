import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useAuth } from '../../../context/AuthContext'
import {
 getPassengerBookingsByUser,
 createPassengerBooking,
 updatePassengerBooking,
 deletePassengerBooking,
} from '../../../lib/api/passengerBookingsApi'
import { getRouteById } from '../../../lib/api/routesApi'
import { getPaymentsByPassengerBooking, createPayment } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import { PASSENGER_STATUS, PAYMENT_METHOD, PAYMENT_METHOD_LABELS, STATUS_COLORS } from '../../../utils/enums'
import { formatDate, formatTime, formatCurrency } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faTimes, faPlus, faCreditCard } from '@fortawesome/free-solid-svg-icons'

export default function MyPassengerBookingsPage() {
 const { user, profile } = useAuth()
 const [searchParams, setSearchParams] = useSearchParams()
 const [bookings, setBookings] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
 const [selectedRoute, setSelectedRoute] = useState(null)
 const [selectedBooking, setSelectedBooking] = useState(null)
 const [existingPayments, setExistingPayments] = useState({})
 const [isLoadingRoute, setIsLoadingRoute] = useState(false)
 const [isSaving, setIsSaving] = useState(false)
 const [isProcessingPayment, setIsProcessingPayment] = useState(false)
 const [formData, setFormData] = useState({
 full_name: '',
 phone: '',
 seat_count: 1,
 })
 const [paymentData, setPaymentData] = useState({
 method: '',
 reference: '',
 })
 const { showToast } = useToast()

 useEffect(() => {
 if (user?.id) {
 loadBookings()
 }
 }, [user])

 useEffect(() => {
 const routeId = searchParams.get('routeId')
 if (routeId) {
 handleCreateBooking(routeId)
 }
 }, [searchParams])

 const loadBookings = async () => {
 if (!user?.id) return

 try {
 setIsLoading(true)
 const data = await getPassengerBookingsByUser(user.id)
 setBookings(data || [])
 
 const confirmedBookings = (data || []).filter(
 (b) => b.status === PASSENGER_STATUS.CONFIRMED
 )
 const paymentsMap = {}
 
 for (const booking of confirmedBookings) {
 try {
 const payments = await getPaymentsByPassengerBooking(booking.id)
 paymentsMap[booking.id] = payments || []
 } catch (error) {
 console.error(`Error loading payments for booking ${booking.id}:`, error)
 paymentsMap[booking.id] = []
 }
 }
 
 setExistingPayments(paymentsMap)
 } catch (error) {
 console.error('Error loading bookings:', error)
 showToast('Failed to load bookings', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const handleCreateBooking = async (routeId) => {
 try {
 setIsLoadingRoute(true)
 const route = await getRouteById(routeId)
 setSelectedRoute(route)
 
 setFormData({
 full_name: profile?.first_name && profile?.last_name 
 ? `${profile.first_name} ${profile.last_name}`.trim()
 : '',
 phone: profile?.phone || '',
 seat_count: 1,
 })
 setIsModalOpen(true)
 setSearchParams({})
 } catch (error) {
 console.error('Error loading route:', error)
 showToast('Failed to load route information', 'error')
 setSearchParams({})
 } finally {
 setIsLoadingRoute(false)
 }
 }

 const handleSave = async () => {
 if (!formData.full_name || !formData.phone || !formData.seat_count) {
 showToast('Please fill in all required fields', 'error')
 return
 }

 if (!selectedRoute) {
 showToast('Route information is missing', 'error')
 return
 }

 try {
 setIsSaving(true)
 const bookingData = {
 route_id: selectedRoute.id,
 user_id: user.id,
 full_name: formData.full_name,
 phone: formData.phone,
 seat_count: parseInt(formData.seat_count),
 status: PASSENGER_STATUS.PENDING,
 }

 await createPassengerBooking(bookingData)
 showToast('Booking created successfully!', 'success')
 setIsModalOpen(false)
 setSelectedRoute(null)
 setFormData({
 full_name: '',
 phone: '',
 seat_count: 1,
 })
 loadBookings()
 } catch (error) {
 console.error('Error creating booking:', error)
 showToast('Failed to create booking', 'error')
 } finally {
 setIsSaving(false)
 }
 }

 const handleCancel = async (bookingId) => {
 if (!confirm('Are you sure you want to cancel this booking?')) return

 try {
 await updatePassengerBooking(bookingId, {
 status: PASSENGER_STATUS.CANCELLED,
 })
 showToast('Booking cancelled', 'success')
 loadBookings()
 } catch (error) {
 console.error('Error cancelling booking:', error)
 showToast('Failed to cancel booking', 'error')
 }
 }

 const handlePayNow = (booking) => {
 setSelectedBooking(booking)
 setPaymentData({
 method: '',
 reference: '',
 })
 setIsPaymentModalOpen(true)
 }

 const handleProcessPayment = async () => {
 if (!selectedBooking) return

 if (!paymentData.method) {
 showToast('Please select a payment method', 'error')
 return
 }

 const totalAmount = selectedBooking.routes?.passenger_price 
 ? selectedBooking.routes.passenger_price * selectedBooking.seat_count 
 : 0

 if (totalAmount <= 0) {
 showToast('Invalid booking amount', 'error')
 return
 }

 try {
 setIsProcessingPayment(true)
 const paymentPayload = {
 user_id: user.id,
 passenger_booking_id: selectedBooking.id,
 amount: totalAmount,
 method: paymentData.method,
 reference: paymentData.reference || null,
 status: 'PENDING',
 }

 await createPayment(paymentPayload)
 showToast('Payment submitted successfully!', 'success')
 setIsPaymentModalOpen(false)
 setSelectedBooking(null)
 setPaymentData({
 method: '',
 reference: '',
 })
 loadBookings()
 } catch (error) {
 console.error('Error processing payment:', error)
 showToast('Failed to process payment', 'error')
 } finally {
 setIsProcessingPayment(false)
 }
 }

 const hasPayment = (bookingId) => {
 const payments = existingPayments[bookingId] || []
 return payments.length > 0
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
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 My Passenger Bookings
 </h1>
 <p className="text-gray-600 mt-2">
 View and manage your passenger bookings
 </p>
 </div>
 </div>

 <Card className="p-6">
 {bookings.length === 0 ? (
 <div className="text-center py-12">
 <FontAwesomeIcon
 icon={faUser}
 className="text-4xl text-gray-400 mb-4"
 />
 <p className="text-gray-500 mb-4">
 You have no passenger bookings yet.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {bookings.map((booking) => (
 <div
 key={booking.id}
 className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <FontAwesomeIcon
 icon={faUser}
 className="text-sky-600"
 />
 <h3 className="text-lg font-semibold text-gray-900">
 {booking.full_name}
 </h3>
 <Badge className={STATUS_COLORS[booking.status]}>
 {booking.status}
 </Badge>
 </div>
 <div className="ml-8 space-y-1 text-sm text-gray-600">
 <div>
 <strong>Route:</strong>{' '}
 {booking.routes?.cities_from?.name || booking.routes?.from_city_name} →{' '}
 {booking.routes?.cities_to?.name || booking.routes?.to_city_name}
 </div>
 <div>
 <strong>Departure:</strong>{' '}
 {formatDate(booking.routes?.departure_time)} at{' '}
 {formatTime(booking.routes?.departure_time)}
 </div>
 <div>
 <strong>Seats:</strong> {booking.seat_count}
 </div>
 <div>
 <strong>Phone:</strong> {booking.phone}
 </div>
 {booking.routes?.passenger_price && (
 <div>
 <strong>Price:</strong> {formatCurrency(booking.routes.passenger_price * booking.seat_count)}
 </div>
 )}
 </div>
 </div>
 <div className="flex gap-2">
 {booking.status === PASSENGER_STATUS.PENDING && (
 <Button
 variant="danger"
 size="sm"
 onClick={() => handleCancel(booking.id)}
 >
 <FontAwesomeIcon icon={faTimes} className="mr-2" />
 Cancel
 </Button>
 )}
 {booking.status === PASSENGER_STATUS.CONFIRMED && !hasPayment(booking.id) && (
 <Button
 variant="primary"
 size="sm"
 onClick={() => handlePayNow(booking)}
 >
 <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
 Pay Now
 </Button>
 )}
 {booking.status === PASSENGER_STATUS.CONFIRMED && hasPayment(booking.id) && (
 <Badge className="bg-blue-100 text-blue-800">
 Payment Submitted
 </Badge>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>

 
 <Modal
 isOpen={isModalOpen}
 onClose={() => {
 setIsModalOpen(false)
 setSelectedRoute(null)
 setFormData({
 full_name: '',
 phone: '',
 seat_count: 1,
 })
 }}
 title="Book Passenger Seat"
 size="lg"
 >
 {isLoadingRoute ? (
 <div className="flex items-center justify-center py-12">
 <LoadingSpinner />
 </div>
 ) : selectedRoute ? (
 <div className="space-y-4">
 
 <div className="bg-gray-50 p-4 rounded-lg">
 <h4 className="font-semibold text-gray-900 mb-2">
 Route Information
 </h4>
 <div className="space-y-1 text-sm text-gray-600">
 <div>
 <strong>Route:</strong>{' '}
 {selectedRoute.cities_from?.name || selectedRoute.from_city_name} →{' '}
 {selectedRoute.cities_to?.name || selectedRoute.to_city_name}
 </div>
 <div>
 <strong>Departure:</strong>{' '}
 {formatTime(selectedRoute.departure_time)} at {selectedRoute.departure_place}
 </div>
 {selectedRoute.passenger_price && (
 <div>
 <strong>Price per person:</strong> {formatCurrency(selectedRoute.passenger_price)}
 </div>
 )}
 </div>
 </div>

 
 <div className="space-y-4">
 <Input
 label="Full Name"
 value={formData.full_name}
 onChange={(e) =>
 setFormData({ ...formData, full_name: e.target.value })
 }
 placeholder="Enter your full name"
 required
 />

 <Input
 label="Phone Number"
 value={formData.phone}
 onChange={(e) =>
 setFormData({ ...formData, phone: e.target.value })
 }
 placeholder="Enter your phone number"
 required
 />

 <Input
 type="number"
 label="Number of Seats"
 value={formData.seat_count}
 onChange={(e) =>
 setFormData({
 ...formData,
 seat_count: parseInt(e.target.value) || 1,
 })
 }
 min="1"
 required
 />

 {selectedRoute.passenger_price && formData.seat_count > 0 && (
 <div className="bg-blue-50 p-4 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-gray-900">
 Total Price:
 </span>
 <span className="text-xl font-bold text-blue-600">
 {formatCurrency(
 selectedRoute.passenger_price * formData.seat_count
 )}
 </span>
 </div>
 </div>
 )}
 </div>

 
 <div className="flex gap-3 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsModalOpen(false)
 setSelectedRoute(null)
 }}
 className="flex-1"
 >
 Cancel
 </Button>
 <Button
 onClick={handleSave}
 loading={isSaving}
 className="flex-1"
 >
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Create Booking
 </Button>
 </div>
 </div>
 ) : null}
 </Modal>

 
 <Modal
 isOpen={isPaymentModalOpen}
 onClose={() => {
 setIsPaymentModalOpen(false)
 setSelectedBooking(null)
 setPaymentData({
 method: '',
 reference: '',
 })
 }}
 title="Make Payment"
 size="md"
 >
 {selectedBooking ? (
 <div className="space-y-4">
 
 <div className="bg-gray-50 p-4 rounded-lg">
 <h4 className="font-semibold text-gray-900 mb-2">
 Booking Details
 </h4>
 <div className="space-y-1 text-sm text-gray-600">
 <div>
 <strong>Route:</strong>{' '}
 {selectedBooking.routes?.cities_from?.name || selectedBooking.routes?.from_city_name} →{' '}
 {selectedBooking.routes?.cities_to?.name || selectedBooking.routes?.to_city_name}
 </div>
 <div>
 <strong>Passenger:</strong> {selectedBooking.full_name}
 </div>
 <div>
 <strong>Seats:</strong> {selectedBooking.seat_count}
 </div>
 {selectedBooking.routes?.passenger_price && (
 <div>
 <strong>Price per seat:</strong> {formatCurrency(selectedBooking.routes.passenger_price)}
 </div>
 )}
 </div>
 </div>

 
 {selectedBooking.routes?.passenger_price && (
 <div className="bg-blue-50 p-4 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-gray-900">
 Total Amount:
 </span>
 <span className="text-xl font-bold text-blue-600">
 {formatCurrency(
 selectedBooking.routes.passenger_price * selectedBooking.seat_count
 )}
 </span>
 </div>
 </div>
 )}

 
 <div className="space-y-4">
 <Select
 label="Payment Method"
 value={paymentData.method}
 onChange={(e) =>
 setPaymentData({ ...paymentData, method: e.target.value })
 }
 placeholder="Select payment method"
 options={Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
 value,
 label,
 }))}
 required
 />

 <Input
 label="Reference Number (Optional)"
 value={paymentData.reference}
 onChange={(e) =>
 setPaymentData({ ...paymentData, reference: e.target.value })
 }
 placeholder="Enter transaction reference if applicable"
 />

 <div className="bg-yellow-50 p-3 rounded-lg">
 <p className="text-sm text-yellow-800">
 <strong>Note:</strong> Your payment will be reviewed by the admin. You will be notified once it's confirmed.
 </p>
 </div>
 </div>

 
 <div className="flex gap-3 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsPaymentModalOpen(false)
 setSelectedBooking(null)
 setPaymentData({
 method: '',
 reference: '',
 })
 }}
 className="flex-1"
 >
 Cancel
 </Button>
 <Button
 onClick={handleProcessPayment}
 loading={isProcessingPayment}
 className="flex-1"
 >
 <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
 Submit Payment
 </Button>
 </div>
 </div>
 ) : null}
 </Modal>
 </DashboardLayout>
 )
}
