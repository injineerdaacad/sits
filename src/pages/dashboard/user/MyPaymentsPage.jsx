import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useAuth } from '../../../context/AuthContext'
import { getPaymentsByUser } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import { PAYMENT_STATUS, PAYMENT_METHOD, STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../../utils/enums'
import { formatDate } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'

export default function MyPaymentsPage() {
 const { user } = useAuth()
 const [payments, setPayments] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 if (user?.id) {
 loadPayments()
 }
 }, [user])

 const loadPayments = async () => {
 if (!user?.id) return

 try {
 setIsLoading(true)
 const data = await getPaymentsByUser(user.id)
 setPayments(data || [])
 } catch (error) {
 console.error('Error loading payments:', error)
 showToast('Failed to load payments', 'error')
 } finally {
 setIsLoading(false)
 }
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
 const paidAmount = payments
 .filter((p) => p.status === PAYMENT_STATUS.PAID)
 .reduce((sum, p) => sum + (p.amount || 0), 0)

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 My Payments
 </h1>
 <p className="text-gray-600 mt-2">
 View your payment history
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-600">Total Paid</p>
 <p className="text-2xl font-bold text-green-600">
 ${paidAmount.toLocaleString()}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Total Transactions
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {payments.length}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faCreditCard}
 className="text-3xl text-blue-500"
 />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Total Amount
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 ${totalAmount.toLocaleString()}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faCreditCard}
 className="text-3xl text-green-500"
 />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Paid Amount
 </p>
 <p className="text-3xl font-bold text-green-600 mt-2">
 ${paidAmount.toLocaleString()}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faCreditCard}
 className="text-3xl text-emerald-500"
 />
 </div>
 </Card>
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
 </tr>
 </thead>
 <tbody>
 {payments.length === 0 ? (
 <tr>
 <td colSpan="6" className="py-8 text-center text-gray-500">
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
 {formatDate(payment.created_at)}
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

