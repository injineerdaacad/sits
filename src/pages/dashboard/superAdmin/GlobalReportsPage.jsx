import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { getCities } from '../../../lib/api/citiesApi'
import { getStations } from '../../../lib/api/stationsApi'
import { getVehicles } from '../../../lib/api/vehiclesApi'
import { getActiveRoutes } from '../../../lib/api/routesApi'
import { getPassengerBookings } from '../../../lib/api/passengerBookingsApi'
import { getCargoBookings } from '../../../lib/api/cargoBookingsApi'
import { getPayments } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import { PASSENGER_STATUS, CARGO_STATUS, PAYMENT_STATUS } from '../../../utils/enums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import { safePromiseAll } from '../../../utils/apiHelpers'
import { getErrorMessage } from '../../../utils/errorHelpers'

export default function GlobalReportsPage() {
 const [reports, setReports] = useState({
 totalCities: 0,
 totalStations: 0,
 totalVehicles: 0,
 activeRoutes: 0,
 passengerBookings: {
 total: 0,
 pending: 0,
 confirmed: 0,
 cancelled: 0,
 },
 cargoBookings: {
 total: 0,
 pending: 0,
 confirmed: 0,
 cancelled: 0,
 delivered: 0,
 },
 payments: {
 total: 0,
 totalAmount: 0,
 paid: 0,
 pending: 0,
 },
 })
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 loadReports()
 }, [])

 const loadReports = async () => {
 try {
 setIsLoading(true)
 
 const handleError = (errorMessage, error) => {
 if (!error?.message?.includes('Request timeout')) {
 showToast(errorMessage, 'error')
 }
 }
 
 const [
 cities,
 stations,
 vehicles,
 routes,
 passengerBookings,
 cargoBookings,
 payments,
 ] = await safePromiseAll(
 [
 () => getCities(),
 () => getStations(),
 () => getVehicles(),
 () => getActiveRoutes(),
 () => getPassengerBookings(),
 () => getCargoBookings(),
 () => getPayments(),
 ],
 [],
 10000,
 handleError
 )

 const passengerBookingsArray = Array.isArray(passengerBookings) ? passengerBookings : []
 const passengerStats = {
 total: passengerBookingsArray.length,
 pending: passengerBookingsArray.filter(
 (b) => b?.status === PASSENGER_STATUS.PENDING
 ).length,
 confirmed: passengerBookingsArray.filter(
 (b) => b?.status === PASSENGER_STATUS.CONFIRMED
 ).length,
 cancelled: passengerBookingsArray.filter(
 (b) => b?.status === PASSENGER_STATUS.CANCELLED
 ).length,
 }

 const cargoBookingsArray = Array.isArray(cargoBookings) ? cargoBookings : []
 const cargoStats = {
 total: cargoBookingsArray.length,
 pending: cargoBookingsArray.filter(
 (b) => b?.status === CARGO_STATUS.PENDING
 ).length,
 confirmed: cargoBookingsArray.filter(
 (b) => b?.status === CARGO_STATUS.CONFIRMED
 ).length,
 cancelled: cargoBookingsArray.filter(
 (b) => b?.status === CARGO_STATUS.CANCELLED
 ).length,
 delivered: cargoBookingsArray.filter(
 (b) => b?.status === CARGO_STATUS.DELIVERED
 ).length,
 }

 const paymentsArray = Array.isArray(payments) ? payments : []
 const totalPaymentAmount = paymentsArray.reduce(
   (sum, p) => sum + (p?.amount || 0),
   0
 )
 const paymentStats = {
   total: paymentsArray.length,
   totalAmount: totalPaymentAmount,
   paid: paymentsArray.filter((p) => p?.status === PAYMENT_STATUS.PAID).length,
   pending: paymentsArray.filter((p) => p?.status === PAYMENT_STATUS.PENDING).length,
 }

 setReports({
 totalCities: Array.isArray(cities) ? cities.length : 0,
 totalStations: Array.isArray(stations) ? stations.length : 0,
 totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
 activeRoutes: Array.isArray(routes) ? routes.length : 0,
 passengerBookings: passengerStats,
 cargoBookings: cargoStats,
 payments: paymentStats,
 })
 } catch (error) {
 console.error('Error loading reports:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage || 'Failed to load reports', 'error')
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

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Global Reports
 </h1>
 <p className="text-gray-600 mt-2">
 System-wide analytics and statistics
 </p>
 </div>

 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Total Cities
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {reports.totalCities}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faChartBar}
 className="text-3xl text-blue-500"
 />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Total Stations
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {reports.totalStations}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faChartBar}
 className="text-3xl text-green-500"
 />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Total Vehicles
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {reports.totalVehicles}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faChartBar}
 className="text-3xl text-purple-500"
 />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">
 Active Routes
 </p>
 <p className="text-3xl font-bold text-gray-900 mt-2">
 {reports.activeRoutes}
 </p>
 </div>
 <FontAwesomeIcon
 icon={faChartBar}
 className="text-3xl text-orange-500"
 />
 </div>
 </Card>
 </div>

 
 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Passenger Bookings
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <p className="text-sm text-gray-600">Total</p>
 <p className="text-2xl font-bold text-gray-900">
 {reports.passengerBookings.total}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Pending</p>
 <p className="text-2xl font-bold text-yellow-600">
 {reports.passengerBookings.pending}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Confirmed</p>
 <p className="text-2xl font-bold text-green-600">
 {reports.passengerBookings.confirmed}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Cancelled</p>
 <p className="text-2xl font-bold text-red-600">
 {reports.passengerBookings.cancelled}
 </p>
 </div>
 </div>
 </Card>

 
 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Cargo Bookings
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 <div>
 <p className="text-sm text-gray-600">Total</p>
 <p className="text-2xl font-bold text-gray-900">
 {reports.cargoBookings.total}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Pending</p>
 <p className="text-2xl font-bold text-yellow-600">
 {reports.cargoBookings.pending}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Confirmed</p>
 <p className="text-2xl font-bold text-green-600">
 {reports.cargoBookings.confirmed}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Delivered</p>
 <p className="text-2xl font-bold text-blue-600">
 {reports.cargoBookings.delivered}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Cancelled</p>
 <p className="text-2xl font-bold text-red-600">
 {reports.cargoBookings.cancelled}
 </p>
 </div>
 </div>
 </Card>

 
 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Payments
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <p className="text-sm text-gray-600">Total Transactions</p>
 <p className="text-2xl font-bold text-gray-900">
 {reports.payments.total}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Total Amount</p>
 <p className="text-2xl font-bold text-green-600">
 ${reports.payments.totalAmount.toLocaleString()}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Paid</p>
 <p className="text-2xl font-bold text-green-600">
 {reports.payments.paid}
 </p>
 </div>
 <div>
 <p className="text-sm text-gray-600">Pending</p>
 <p className="text-2xl font-bold text-yellow-600">
 {reports.payments.pending}
 </p>
 </div>
 </div>
 </Card>
 </div>
 </DashboardLayout>
 )
}

