import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faUser,
 faBox,
 faRoute,
 faClock,
 faMapMarkerAlt,
 faPhone,
 faSearch,
 faTruck,
} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { useAuth } from '../../../context/AuthContext'
import { getActiveRoutes } from '../../../lib/api/routesApi'
import { getCities } from '../../../lib/api/citiesApi'
import { useToast } from '../../../hooks/useToast'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { formatTime12Hour, formatCurrency, formatWeekdayDateTimeFromTimestampEn } from '../../../utils/helpers'
import { ServiceTypeLabels } from '../../../utils/enums'
import RouteCard from '../../../components/RouteCard'

export default function UserDashboard() {
 const { user } = useAuth()
 const navigate = useNavigate()
 const [activeRoutes, setActiveRoutes] = useState([])
 const [filteredRoutes, setFilteredRoutes] = useState([])
 const [cities, setCities] = useState([])
 const [fromCity, setFromCity] = useState('')
 const [toCity, setToCity] = useState('')
 const [isLoading, setIsLoading] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 loadData()
 }, [])

 useEffect(() => {
 filterRoutes()
 }, [fromCity, toCity, activeRoutes])

 const loadData = async () => {
 try {
 setIsLoading(true)
 const [routesData, citiesData] = await Promise.all([
 getActiveRoutes(),
 getCities(),
 ])
 setActiveRoutes(routesData || [])
 setCities(citiesData || [])
 } catch (error) {
 console.error('Error loading data:', error)
 showToast('Failed to load routes', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const filterRoutes = () => {
 let filtered = activeRoutes

 const now = new Date()
 filtered = filtered.filter((route) => {
   if (!route?.departure_time) return false
   const d = new Date(route.departure_time)
   return !isNaN(d.getTime()) && d > now
 })

 if (fromCity.trim()) {
 filtered = filtered.filter(
 (route) =>
 route.cities_from?.name?.toLowerCase().includes(fromCity.toLowerCase()) ||
 route.from_city_name?.toLowerCase().includes(fromCity.toLowerCase())
 )
 }

 if (toCity.trim()) {
 filtered = filtered.filter(
 (route) =>
 route.cities_to?.name?.toLowerCase().includes(toCity.toLowerCase()) ||
 route.to_city_name?.toLowerCase().includes(toCity.toLowerCase())
 )
 }

 setFilteredRoutes(filtered)
 }

 const handleBookPassenger = (route) => {
 navigate(`/dashboard/user/passenger-bookings?routeId=${route.id}`)
 }

 const handleBookCargo = (route) => {
 navigate(`/dashboard/user/cargo-bookings?routeId=${route.id}`)
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
 Book Your Journey
 </h1>
 <p className="text-gray-600 mt-2">
 Find and book available routes for passengers or cargo
 </p>
 </div>

 
 <Card className="p-6">
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-4">
 <FontAwesomeIcon
 icon={faSearch}
 className="text-sky-600"
 />
 <h2 className="text-xl font-semibold text-gray-900">
 Search Routes
 </h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 From City
 </label>
 <input
 type="text"
 value={fromCity}
 onChange={(e) => setFromCity(e.target.value)}
 placeholder="Enter departure city"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 To City
 </label>
 <input
 type="text"
 value={toCity}
 onChange={(e) => setToCity(e.target.value)}
 placeholder="Enter destination city"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
 />
 </div>
 </div>
 {(fromCity || toCity) && (
 <p className="text-sm text-gray-500">
 Showing {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''}
 </p>
 )}
 </div>
 </Card>

 
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-2xl font-semibold text-gray-900">
 Available Routes
 </h2>
 {!fromCity && !toCity && (
 <p className="text-sm text-gray-500">
 {activeRoutes.length} route{activeRoutes.length !== 1 ? 's' : ''} available
 </p>
 )}
 </div>

 {filteredRoutes.length === 0 ? (
 <Card className="p-8 text-center">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-4xl text-gray-400 mb-4"
 />
 <p className="text-gray-600">
 {fromCity || toCity
 ? 'No routes found for your search'
 : 'No active routes available at the moment'}
 </p>
 </Card>
 ) : (
 <div className="space-y-4">
 {filteredRoutes.map((route) => {
 const fromCityName =
 route.cities_from?.name || route.from_city_name
 const toCityName = route.cities_to?.name || route.to_city_name
 const vehicle = route.vehicles
 const station = vehicle?.stations

 const fromCityData = route.cities_from
 const toCityData = route.cities_to

 return (
 <Card key={route.id} className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300">
 
 <div className="relative h-32 bg-gradient-to-r from-sky-400 to-emerald-400">
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="flex items-center gap-6 text-white">
 
 <div className="text-center">
 <p className="text-xs font-medium opacity-90 mb-1">FROM</p>
 <p className="text-xl font-bold drop-shadow-lg">{fromCityName}</p>
 </div>
 
 
 <div className="bg-white rounded-full p-3 shadow-xl border-4 border-sky-200">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-sky-600 text-xl"
 />
 </div>
 
 
 <div className="text-center">
 <p className="text-xs font-medium opacity-90 mb-1">TO</p>
 <p className="text-xl font-bold drop-shadow-lg">{toCityName}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-5">
 
 <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
 
 <div className="w-24 h-24 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-sky-200 shadow-md">
 <FontAwesomeIcon
 icon={faTruck}
 className="text-sky-600 text-4xl"
 />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex-1 min-w-0">
 <h3 className="text-2xl font-bold text-gray-900 mb-1">
 {vehicle?.name || 'Vehicle'}
 </h3>
 <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
 {vehicle?.vehicle_type && (
 <span className="px-2 py-1 bg-gray-100 rounded-md">
 {vehicle.vehicle_type}
 </span>
 )}
 {vehicle?.service_type && (
 <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-md font-medium">
 {ServiceTypeLabels[vehicle.service_type] || vehicle.service_type}
 </span>
 )}
 </div>
 </div>
 <Badge className="bg-green-100 text-green-800 flex-shrink-0">
 Active
 </Badge>
 </div>
 {station && (
 <p className="text-sm text-gray-500 mt-1">
 <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-sky-600" />
 Station: {station.name}
 {station.cities?.name && ` - ${station.cities.name}`}
 </p>
 )}
 </div>
 </div>

 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
 <div className="space-y-3">
 <h4 className="font-semibold text-gray-900 text-sm mb-2">
 Departure Information
 </h4>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-gray-700">
 <FontAwesomeIcon
 icon={faClock}
 className="text-sky-600 w-4"
 />
 <span className="font-medium whitespace-pre-line">
 {formatWeekdayDateTimeFromTimestampEn(route.departure_time)}
 </span>
 </div>
 {route.departure_place && (
 <div className="flex items-center gap-2 text-gray-700">
 <FontAwesomeIcon
 icon={faMapMarkerAlt}
 className="text-sky-600 w-4"
 />
 <span>{route.departure_place}</span>
 </div>
 )}
 {station && (
 <div className="flex items-center gap-2 text-gray-700">
 <FontAwesomeIcon
 icon={faMapMarkerAlt}
 className="text-sky-600 w-4"
 />
 <span>
 {station.name}
 {station.cities?.name && ` - ${station.cities.name}`}
 </span>
 </div>
 )}
 {station?.location_details && (
 <div className="flex items-start gap-2 text-gray-600 text-sm">
 <FontAwesomeIcon
 icon={faMapMarkerAlt}
 className="text-sky-600 w-4 mt-0.5"
 />
 <span>{station.location_details}</span>
 </div>
 )}
 </div>
 </div>

 <div className="space-y-2">
 {route.passenger_price && (
 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faUser}
 className="text-blue-600"
 />
 <span className="text-sm text-gray-700">
 Per Person
 </span>
 </div>
 <span className="font-bold text-blue-600">
 {formatCurrency(route.passenger_price)}
 </span>
 </div>
 )}
 {route.cargo_price_per_kg && (
 <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faBox}
 className="text-purple-600"
 />
 <span className="text-sm text-gray-700">
 Per 1 kg
 </span>
 </div>
 <span className="font-bold text-purple-600">
 {formatCurrency(route.cargo_price_per_kg)}
 </span>
 </div>
 )}
 </div>
 </div>

 
 {route.notes && (
 <div className="pt-4 border-t border-gray-200">
 <h4 className="font-semibold text-gray-900 text-sm mb-2">
 Additional Information
 </h4>
 <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
 {route.notes}
 </p>
 </div>
 )}

 
 {(route.contact_phone || route.whatsapp) && (
 <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
 <h4 className="font-semibold text-gray-900 text-sm w-full">
 Contact Information
 </h4>
 {route.contact_phone && (
 <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-4 py-2 rounded-lg">
 <FontAwesomeIcon
 icon={faPhone}
 className="text-blue-600"
 />
 <a
 href={`tel:${route.contact_phone}`}
 className="hover:text-blue-600 font-medium"
 >
 {route.contact_phone}
 </a>
 </div>
 )}
 {route.whatsapp && (
 <div className="flex items-center gap-2 text-gray-700 bg-green-50 px-4 py-2 rounded-lg">
 <FontAwesomeIcon
 icon={faWhatsapp}
 className="text-green-600 text-lg"
 />
 <a
 href={`https://wa.me/${route.whatsapp.replace(/[^0-9]/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="hover:text-green-600 font-medium"
 >
 WhatsApp: {route.whatsapp}
 </a>
 </div>
 )}
 </div>
 )}

 
 <div className="pt-4 border-t border-gray-200">
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     {route.passenger_price && (
       <Button
         onClick={() => handleBookPassenger(route)}
         className="w-full"
       >
         <FontAwesomeIcon icon={faUser} className="mr-2" />
         Book Passenger
       </Button>
     )}
     {route.cargo_price_per_kg && (
       <Button
         onClick={() => handleBookCargo(route)}
         variant="secondary"
         className="w-full"
       >
         <FontAwesomeIcon icon={faBox} className="mr-2" />
         Book Cargo
       </Button>
     )}
   </div>
 </div>
 </div>
 </Card>
 )
 })}
 </div>
 )}
 </div>

 
 <Card className="p-6 bg-gradient-to-r from-sky-50 to-emerald-50">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h3 className="font-semibold text-gray-900 mb-1">
 Manage Your Bookings
 </h3>
 <p className="text-sm text-gray-600">
 View and manage your passenger and cargo bookings
 </p>
 </div>
 <div className="flex gap-3">
 <Link to="/dashboard/user/passenger-bookings">
 <Button variant="secondary" size="sm">
 <FontAwesomeIcon icon={faUser} className="mr-2" />
 My Bookings
 </Button>
 </Link>
 <Link to="/dashboard/user/cargo-bookings">
 <Button variant="secondary" size="sm">
 <FontAwesomeIcon icon={faBox} className="mr-2" />
 My Cargo
 </Button>
 </Link>
 </div>
 </div>
 </Card>
 </div>
 </DashboardLayout>
 )
}