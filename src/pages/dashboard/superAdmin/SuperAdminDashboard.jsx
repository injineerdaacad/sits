import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faCity,
 faBuilding,
 faTruck,
 faRoute,
 faUsers,
 faCreditCard,
} from '@fortawesome/free-solid-svg-icons'
import { getCities } from '../../../lib/api/citiesApi'
import { getStations } from '../../../lib/api/stationsApi'
import { getVehicles } from '../../../lib/api/vehiclesApi'
import { getActiveRoutes } from '../../../lib/api/routesApi'
import { getAllProfiles } from '../../../lib/api/authApi'
import { getPayments } from '../../../lib/api/paymentsApi'
import { useToast } from '../../../hooks/useToast'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { safePromiseAll } from '../../../utils/apiHelpers'
import { getErrorMessage } from '../../../utils/errorHelpers'

export default function SuperAdminDashboard() {
 const [stats, setStats] = useState({
 cities: 0,
 stations: 0,
 vehicles: 0,
 activeRoutes: 0,
 totalUsers: 0,
 totalPayments: 0,
 })
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 loadDashboardData()
 }, [])

 const loadDashboardData = async () => {
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
 activeRoutes,
 users,
 payments,
 ] = await safePromiseAll(
 [
 () => getCities(),
 () => getStations(),
 () => getVehicles(),
 () => getActiveRoutes(),
 () => getAllProfiles(),
 () => getPayments(),
 ],
 [],
 10000,
 handleError
 )

 const totalPaymentAmount = Array.isArray(payments)
 ? payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0)
 : 0

 setStats({
 cities: Array.isArray(cities) ? cities.length : 0,
 stations: Array.isArray(stations) ? stations.length : 0,
 vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
 activeRoutes: Array.isArray(activeRoutes) ? activeRoutes.length : 0,
 totalUsers: Array.isArray(users) ? users.length : 0,
 totalPayments: totalPaymentAmount,
 })
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
 label: 'Cities',
 value: stats.cities,
 icon: faCity,
 color: 'bg-blue-500',
 },
 {
 label: 'Stations',
 value: stats.stations,
 icon: faBuilding,
 color: 'bg-green-500',
 },
 {
 label: 'Vehicles',
 value: stats.vehicles,
 icon: faTruck,
 color: 'bg-purple-500',
 },
 {
 label: 'Active Routes',
 value: stats.activeRoutes,
 icon: faRoute,
 color: 'bg-orange-500',
 },
 {
 label: 'Total Users',
 value: stats.totalUsers,
 icon: faUsers,
 color: 'bg-indigo-500',
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

 return (
 <DashboardLayout>
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Super Admin Dashboard
 </h1>
 <p className="text-gray-600 mt-2">
 Overview of the entire system
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

 
 <Card className="p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">
 Quick Actions
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 
 </div>
 </Card>
 </div>
 </DashboardLayout>
 )
}

