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
import { getCargoBookingsByUser, createCargoBooking } from '../../../lib/api/cargoBookingsApi'
import { getRouteById } from '../../../lib/api/routesApi'
import { getPaymentsByCargoBooking, createPayment } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import { CARGO_STATUS, PAYMENT_METHOD, PAYMENT_METHOD_LABELS, STATUS_COLORS } from '../../../utils/enums'
import { formatDate, formatTime, formatCurrency } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox, faPlus, faCreditCard } from '@fortawesome/free-solid-svg-icons'

export default function MyCargoBookingsPage() {
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
 sender_name: '',
 sender_phone: '',
 receiver_name: '',
 receiver_phone: '',
 cargo_weight: '',
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
 const data = await getCargoBookingsByUser(user.id)
 setBookings(data || [])
 
 const confirmedBookings = (data || []).filter(
 (b) => b.status === CARGO_STATUS.CONFIRMED
 )
 const paymentsMap = {}
 
 for (const booking of confirmedBookings) {
 try {
 const payments = await getPaymentsByCargoBooking(booking.id)
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
 sender_name: profile?.first_name && profile?.last_name 
 ? `${profile.first_name} ${profile.last_name}`.trim()
 : '',
 sender_phone: profile?.phone || '',
 receiver_name: '',
 receiver_phone: '',
 cargo_weight: '',
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
 if (
 !formData.sender_name ||
 !formData.sender_phone ||
 !formData.receiver_name ||
 !formData.receiver_phone ||
 !formData.cargo_weight
 ) {
 showToast('Please fill in all required fields', 'error')
 return
 }

 if (!selectedRoute) {
 showToast('Route information is missing', 'error')
 return
 }

 const weight = parseFloat(formData.cargo_weight)
 if (isNaN(weight) || weight <= 0) {
 showToast('Please enter a valid cargo weight', 'error')
 return
 }

 try {
 setIsSaving(true)
 const price = selectedRoute.cargo_price_per_kg
 ? parseFloat(selectedRoute.cargo_price_per_kg) * weight
 : null

 const bookingData = {
 route_id: selectedRoute.id,
 user_id: user.id,
 sender_name: formData.sender_name,
 sender_phone: formData.sender_phone,
 receiver_name: formData.receiver_name,
 receiver_phone: formData.receiver_phone,
 cargo_weight: weight,
 price: price,
 status: CARGO_STATUS.PENDING,
 }

 await createCargoBooking(bookingData)
 showToast('Cargo booking created successfully!', 'success')
 setIsModalOpen(false)
 setSelectedRoute(null)
 setFormData({
 sender_name: '',
 sender_phone: '',
 receiver_name: '',
 receiver_phone: '',
 cargo_weight: '',
 })
 loadBookings()
 } catch (error) {
 console.error('Error creating booking:', error)
 showToast('Failed to create booking', 'error')
 } finally {
 setIsSaving(false)
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

 const totalAmount = selectedBooking.price || 0

 if (totalAmount <= 0) {
 showToast('Invalid booking amount', 'error')
 return
 }

 try {
 setIsProcessingPayment(true)
 const paymentPayload = {
 user_id: user.id,
 cargo_booking_id: selectedBooking.id,
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
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 My Cargo Bookings
 </h1>
 <p className="text-gray-600 mt-2">
 View and manage your cargo bookings
 </p>
 </div>

 <Card className="p-6">
 {bookings.length === 0 ? (
 <div className="text-center py-12">
 <FontAwesomeIcon
 icon={faBox}
 className="text-4xl text-gray-400 mb-4"
 />
 <p className="text-gray-500">
 You have no cargo bookings yet.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {bookings.map((booking) => (
 <div
 key={booking.id}
 className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 <FontAwesomeIcon
 icon={faBox}
 className="text-purple-600"
 />
 <h3 className="text-lg font-semibold text-gray-900">
 Cargo Booking #{booking.id.slice(0, 8)}
 </h3>
 <Badge className={STATUS_COLORS[booking.status]}>
 {booking.status}
 </Badge>
 </div>
 <div className="flex gap-2">
 {booking.status === CARGO_STATUS.CONFIRMED && !hasPayment(booking.id) && (
 <Button
 variant="primary"
 size="sm"
 onClick={() => handlePayNow(booking)}
 >
 <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
 Pay Now
 </Button>
 )}
 {booking.status === CARGO_STATUS.CONFIRMED && hasPayment(booking.id) && (
 <Badge className="bg-blue-100 text-blue-800">
 Payment Submitted
 </Badge>
 )}
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <h4 className="font-semibold text-gray-700 mb-2">
 Sender Information
 </h4>
 <div className="space-y-1 text-gray-600">
 <div>
 <strong>Name:</strong> {booking.sender_name}
 </div>
 <div>
 <strong>Phone:</strong> {booking.sender_phone}
 </div>
 </div>
 </div>
 <div>
 <h4 className="font-semibold text-gray-700 mb-2">
 Receiver Information
 </h4>
 <div className="space-y-1 text-gray-600">
 <div>
 <strong>Name:</strong> {booking.receiver_name}
 </div>
 <div>
 <strong>Phone:</strong> {booking.receiver_phone}
 </div>
 </div>
 </div>
 <div>
 <h4 className="font-semibold text-gray-700 mb-2">
 Route Information
 </h4>
 <div className="space-y-1 text-gray-600">
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
 </div>
 </div>
 <div>
 <h4 className="font-semibold text-gray-700 mb-2">
 Cargo Details
 </h4>
 <div className="space-y-1 text-gray-600">
 <div>
 <strong>Weight:</strong> {booking.cargo_weight} kg
 </div>
 {booking.price && (
 <div>
 <strong>Price:</strong> {formatCurrency(booking.price)}
 </div>
 )}
 </div>
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
 sender_name: '',
 sender_phone: '',
 receiver_name: '',
 receiver_phone: '',
 cargo_weight: '',
 })
 }}
 title="Book Cargo"
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
 {selectedRoute.cargo_price_per_kg && (
 <div>
 <strong>Price per kg:</strong> {formatCurrency(selectedRoute.cargo_price_per_kg)}
 </div>
 )}
 </div>
 </div>

 
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input
 label="Sender Name"
 value={formData.sender_name}
 onChange={(e) =>
 setFormData({ ...formData, sender_name: e.target.value })
 }
 placeholder="Enter sender name"
 required
 />

 <Input
 label="Sender Phone"
 value={formData.sender_phone}
 onChange={(e) =>
 setFormData({ ...formData, sender_phone: e.target.value })
 }
 placeholder="Enter sender phone"
 required
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input
 label="Receiver Name"
 value={formData.receiver_name}
 onChange={(e) =>
 setFormData({ ...formData, receiver_name: e.target.value })
 }
 placeholder="Enter receiver name"
 required
 />

 <Input
 label="Receiver Phone"
 value={formData.receiver_phone}
 onChange={(e) =>
 setFormData({ ...formData, receiver_phone: e.target.value })
 }
 placeholder="Enter receiver phone"
 required
 />
 </div>

 <Input
 type="number"
 label="Cargo Weight (kg)"
 value={formData.cargo_weight}
 onChange={(e) =>
 setFormData({ ...formData, cargo_weight: e.target.value })
 }
 placeholder="Enter cargo weight in kg"
 min="0.1"
 step="0.1"
 required
 />

 {selectedRoute.cargo_price_per_kg &&
 formData.cargo_weight &&
 parseFloat(formData.cargo_weight) > 0 && (
 <div className="bg-purple-50 p-4 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-gray-900">
 Total Price:
 </span>
 <span className="text-xl font-bold text-purple-600">
 {formatCurrency(
 parseFloat(selectedRoute.cargo_price_per_kg) *
 parseFloat(formData.cargo_weight)
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
 <strong>Sender:</strong> {selectedBooking.sender_name}
 </div>
 <div>
 <strong>Receiver:</strong> {selectedBooking.receiver_name}
 </div>
 <div>
 <strong>Weight:</strong> {selectedBooking.cargo_weight} kg
 </div>
 </div>
 </div>

 
 {selectedBooking.price && (
 <div className="bg-purple-50 p-4 rounded-lg">
 <div className="flex items-center justify-between">
 <span className="font-semibold text-gray-900">
 Total Amount:
 </span>
 <span className="text-xl font-bold text-purple-600">
 {formatCurrency(selectedBooking.price)}
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
