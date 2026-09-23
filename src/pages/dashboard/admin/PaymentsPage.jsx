import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { Button } from '../../../components/Button'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useAuth } from '../../../context/AuthContext'
import { getPayments, getPaymentsByStation, updatePayment } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import { PAYMENT_STATUS, PAYMENT_METHOD, STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../../utils/enums'
import { formatDayDateEn } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export default function PaymentsPage() {
 const { profile } = useAuth()
 const [payments, setPayments] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 if (profile?.role === 'SUPER_ADMIN' || profile?.station_id) {
 loadPayments()
 }
 }, [profile])

 const loadPayments = async () => {
 if (profile?.role === 'SUPER_ADMIN') {
 try {
 setIsLoading(true)
 const data = await getPayments()
 setPayments(data || [])
 } catch (error) {
 console.error('Error loading payments:', error)
 showToast('Failed to load payments', 'error')
 } finally {
 setIsLoading(false)
 }
 } else if (profile?.station_id) {
 try {
 setIsLoading(true)
 const data = await getPaymentsByStation(profile.station_id)
 setPayments(data || [])
 } catch (error) {
 console.error('Error loading payments:', error)
 showToast('Failed to load payments', 'error')
 } finally {
 setIsLoading(false)
 }
 }
 }

 const handleConfirmPayment = async (paymentId) => {
 try {
 await updatePayment(paymentId, { status: PAYMENT_STATUS.PAID })
 showToast('Payment confirmed successfully', 'success')
 loadPayments()
 } catch (error) {
 console.error('Error confirming payment:', error)
 showToast('Failed to confirm payment', 'error')
 }
 }

 const handleRejectPayment = async (paymentId) => {
 try {
 await updatePayment(paymentId, { status: PAYMENT_STATUS.FAILED })
 showToast('Payment rejected', 'success')
 loadPayments()
 } catch (error) {
 console.error('Error rejecting payment:', error)
 showToast('Failed to reject payment', 'error')
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

 const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Payments
 </h1>
 <p className="text-gray-600 mt-2">
 {profile?.role === 'SUPER_ADMIN' 
 ? 'View all payment transactions across all stations'
 : 'View payment transactions for your station'}
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-600">Total Amount</p>
 <p className="text-2xl font-bold text-gray-900">
 ${totalAmount.toLocaleString()}
 </p>
 </div>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Date
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Customer
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Booking Type
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Amount
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Method
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Status
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Reference
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {payments.length === 0 ? (
 <tr>
 <td colSpan="8" className="py-8 text-center text-gray-500">
 No payments found
 </td>
 </tr>
 ) : (
 payments.map((payment) => (
 <tr
 key={payment.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4 text-gray-600">
 {formatDayDateEn(payment.created_at)}
 </td>
 <td className="py-3 px-4">
 <span className="text-gray-900">
 {payment.profiles?.first_name} {payment.profiles?.last_name}
 </span>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {payment.passenger_booking_id ? 'Passenger' : 'Cargo'}
 </td>
 <td className="py-3 px-4 text-gray-900 font-semibold">
 ${payment.amount}
 </td>
 <td className="py-3 px-4 text-gray-600">
 {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
 </td>
 <td className="py-3 px-4">
 <Badge className={STATUS_COLORS[payment.status]}>
 {payment.status}
 </Badge>
 </td>
 <td className="py-3 px-4 text-gray-600 text-sm">
 {payment.reference || 'N/A'}
 </td>
 <td className="py-3 px-4">
 {payment.status === PAYMENT_STATUS.PENDING && (
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleConfirmPayment(payment.id)}
 className="text-green-600 hover:text-green-700"
 title="Confirm Payment"
 >
 <FontAwesomeIcon icon={faCheck} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleRejectPayment(payment.id)}
 className="text-red-600 hover:text-red-700"
 title="Reject Payment"
 >
 <FontAwesomeIcon icon={faTimes} />
 </Button>
 </div>
 )}
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