import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { TextArea } from '../../../components/TextArea'
import { useAuth } from '../../../context/AuthContext'
import {
 getRoutesAdmin,
 getRoutesByStationAdmin,
 createRoute,
 updateRoute,
 deleteRoute,
} from '../../../lib/api/routesApi'
import { getVehicles, getVehiclesByStation } from '../../../lib/api/vehiclesApi'
import { getCities } from '../../../lib/api/citiesApi'
import { getStations } from '../../../lib/api/stationsApi'
import { useToast } from '../../../hooks/useToast'
import { formatDate, formatTime, formatTime12Hour, formatWeekdayDateTimeFromTimestampEn } from '../../../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute, faPlus, faEdit, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'

export default function RoutesPage() {
 const { profile } = useAuth()
 const [routes, setRoutes] = useState([])
 const [vehicles, setVehicles] = useState([])
 const [cities, setCities] = useState([])
 const [stations, setStations] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [selectedRoute, setSelectedRoute] = useState(null)
 const [formData, setFormData] = useState({
 vehicle_id: '',
 from_city_id: '',
 to_city_id: '',
	departure_at: '',
	departure_date: '',
 departure_time: '',
 departure_place: '',
 departure_station_id: '',
 passenger_price: '',
 cargo_price_per_kg: '',
 contact_phone: '',
 whatsapp: '',
 notes: '',
 is_active: true,
 })
 const { showToast } = useToast()

 useEffect(() => {
 if (profile?.role === 'SUPER_ADMIN' || profile?.station_id) {
 loadData()
 }
 }, [profile])

 const loadData = async () => {
 if (profile?.role === 'SUPER_ADMIN') {
 try {
 setIsLoading(true)
 const [routesData, vehiclesData, citiesData, stationsData] = await Promise.all([
			getRoutesAdmin(),
 getVehicles(),
 getCities(),
 getStations(),
 ])
 setRoutes(routesData || [])
 setVehicles(vehiclesData || [])
 setCities(citiesData || [])
 setStations(stationsData || [])
 } catch (error) {
 console.error('Error loading data:', error)
 showToast('Failed to load routes', 'error')
 } finally {
 setIsLoading(false)
 }
 } else if (profile?.station_id) {
 try {
 setIsLoading(true)
 const [routesData, vehiclesData, citiesData, stationsData] = await Promise.all([
			getRoutesByStationAdmin(profile.station_id),
 getVehiclesByStation(profile.station_id),
 getCities(),
 getStations(),
 ])
 setRoutes(routesData || [])
 setVehicles(vehiclesData || [])
 setCities(citiesData || [])
 setStations(stationsData || [])
 } catch (error) {
 console.error('Error loading data:', error)
 showToast('Failed to load routes', 'error')
 } finally {
 setIsLoading(false)
 }
 }
 }

 const handleCreate = () => {
 setSelectedRoute(null)
 setFormData({
 vehicle_id: '',
 from_city_id: '',
 to_city_id: '',
 departure_time: '',
 departure_place: '',
 departure_station_id: '',
 passenger_price: '',
 cargo_price_per_kg: '',
 contact_phone: '',
 whatsapp: '',
 notes: '',
 is_active: true,
 })
 setIsModalOpen(true)
 }

 const handleEdit = (route) => {
 setSelectedRoute(route)
 const matchingStation = stations.find(
 (station) => station.name === route.departure_place
 )
let departureTimeInput = ''
if (route.departure_time) {
  const d = new Date(route.departure_time)
  if (!isNaN(d.getTime())) {
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    departureTimeInput = `${yyyy}-${mm}-${dd}T${hh}:${min}`
  }
}
 
 setFormData({
 vehicle_id: route.vehicle_id,
 from_city_id: route.from_city_id || '',
 to_city_id: route.to_city_id || '',
 departure_time: departureTimeInput,
 departure_place: route.departure_place || '',
 departure_station_id: matchingStation?.id || '',
 passenger_price: route.passenger_price || '',
 cargo_price_per_kg: route.cargo_price_per_kg || '',
 contact_phone: route.contact_phone || '',
 whatsapp: route.whatsapp || '',
 notes: route.notes || '',
 is_active: route.is_active ?? true,
 })
 setIsModalOpen(true)
 }

 const handleSave = async () => {
	 if (!formData.vehicle_id || !formData.from_city_id || !formData.to_city_id || !formData.departure_time || !formData.contact_phone) {
 showToast('Please fill in all required fields', 'error')
 return
 }

 if (formData.from_city_id === formData.to_city_id) {
 showToast('From City and To City must be different', 'error')
 return
 }

 try {
	let departureTimeTs = formData.departure_time
	if (departureTimeTs && departureTimeTs.includes('T')) {
		departureTimeTs = `${departureTimeTs}:00`
	}
 const fromCity = cities.find((c) => c.id === formData.from_city_id)
 const toCity = cities.find((c) => c.id === formData.to_city_id)

 let departureTime = formData.departure_time
 if (departureTime && departureTime.includes('T')) {
 const dateObj = new Date(departureTime)
 const hours = String(dateObj.getHours()).padStart(2, '0')
 const minutes = String(dateObj.getMinutes()).padStart(2, '0')
 const seconds = String(dateObj.getSeconds()).padStart(2, '0')
 departureTime = `${hours}:${minutes}:${seconds}`
 } else if (departureTime && departureTime.includes(' ')) {
 const timePart = departureTime.split(' ')[1] || departureTime.split('T')[1]?.split('.')[0]
 if (timePart) {
 departureTime = timePart.substring(0, 8)
 }
 }


 const { departure_station_id, ...routeDataWithoutStationId } = formData
 const routeData = {
 ...routeDataWithoutStationId,
	departure_time: departureTimeTs,
 from_city_name: fromCity?.name || '',
 to_city_name: toCity?.name || '',
 passenger_price: formData.passenger_price
 ? parseFloat(formData.passenger_price)
 : null,
 cargo_price_per_kg: formData.cargo_price_per_kg
 ? parseFloat(formData.cargo_price_per_kg)
 : null,
 }

 if (selectedRoute) {
 await updateRoute(selectedRoute.id, routeData)
 showToast('Route updated successfully', 'success')
 } else {
 await createRoute(routeData)
 showToast('Route created successfully', 'success')
 }
 setIsModalOpen(false)
 setSelectedRoute(null)
 loadData()
 } catch (error) {
 console.error('Error saving route:', error)
 showToast('Failed to save route', 'error')
 }
 }

 const handleToggleActive = async (route) => {
 try {
 await updateRoute(route.id, { is_active: !route.is_active })
 showToast(
 `Route ${!route.is_active ? 'activated' : 'deactivated'}`,
 'success'
 )
 loadData()
 } catch (error) {
 console.error('Error toggling route:', error)
 showToast('Failed to update route', 'error')
 }
 }

 const handleDelete = async () => {
 if (!selectedRoute) return

 try {
 await deleteRoute(selectedRoute.id)
 showToast('Route deleted successfully', 'success')
 setIsDeleteModalOpen(false)
 setSelectedRoute(null)
 loadData()
 } catch (error) {
 console.error('Error deleting route:', error)
 showToast('Failed to delete route', 'error')
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
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Routes Management
 </h1>
 <p className="text-gray-600 mt-2">
 {profile?.role === 'SUPER_ADMIN' 
 ? 'View all routes across all stations'
 : 'Manage routes for your vehicles'}
 </p>
 </div>
 <Button variant="primary" onClick={handleCreate}>
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Add Route
 </Button>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Vehicle
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Route
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Departure
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Price
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
 {routes.length === 0 ? (
 <tr>
 <td colSpan="6" className="py-8 text-center text-gray-500">
 No routes found
 </td>
 </tr>
 ) : (
 routes.map((route) => (
 <tr
 key={route.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <span className="text-gray-900">
 {route.vehicles?.name || 'N/A'}
 </span>
 </td>
 <td className="py-3 px-4">
 <span className="text-gray-900">
 {route.cities_from?.name || route.from_city_name} →{' '}
 {route.cities_to?.name || route.to_city_name}
 </span>
 </td>
 <td className="py-3 px-4">
 <div className="text-sm text-gray-600">
 <div className="font-medium text-gray-900">
 {route.departure_place || 'N/A'}
 </div>
 <div className="text-xs whitespace-pre-line">
 {formatWeekdayDateTimeFromTimestampEn(route.departure_time)}
 </div>
 </div>
 </td>
 <td className="py-3 px-4">
 <div className="text-sm">
 {route.passenger_price && (
 <div className="text-gray-900">
 Passenger: ${route.passenger_price}
 </div>
 )}
 {route.cargo_price_per_kg && (
 <div className="text-gray-600">
 Cargo: ${route.cargo_price_per_kg}/kg
 </div>
 )}
 </div>
 </td>
 <td className="py-3 px-4">
 <Badge
 className={
 route.is_active
 ? 'bg-green-100 text-green-800'
 : 'bg-gray-100 text-gray-800'
 }
 >
 {route.is_active ? 'Active' : 'Inactive'}
 </Badge>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleToggleActive(route)}
 title={route.is_active ? 'Deactivate' : 'Activate'}
 >
 <FontAwesomeIcon
 icon={route.is_active ? faToggleOn : faToggleOff}
 className={
 route.is_active ? 'text-green-600' : 'text-gray-400'
 }
 />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(route)}
 >
 <FontAwesomeIcon icon={faEdit} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSelectedRoute(route)
 setIsDeleteModalOpen(true)
 }}
 >
 <FontAwesomeIcon
 icon={faTrash}
 className="text-red-600"
 />
 </Button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </Card>

 <Modal
 isOpen={isModalOpen}
 onClose={() => {
 setIsModalOpen(false)
 setSelectedRoute(null)
 }}
 title={selectedRoute ? 'Edit Route' : 'Add New Route'}
 size="lg"
 >
 <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Vehicle <span className="text-red-500">*</span>
 </label>
 <Select
 value={formData.vehicle_id}
 onChange={(e) =>
 setFormData({ ...formData, vehicle_id: e.target.value })
 }
 placeholder="Select Vehicle"
 options={vehicles.map((vehicle) => ({
 value: vehicle.id,
 label: `${vehicle.name} (${vehicle.vehicle_type})`,
 }))}
 required
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="min-w-0">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 From City <span className="text-red-500">*</span>
 </label>
 <Select
 value={formData.from_city_id}
 onChange={(e) =>
 setFormData({ ...formData, from_city_id: e.target.value })
 }
 placeholder="Select City"
 options={cities.map((city) => ({
 value: city.id,
 label: city.name,
 }))}
 required
 />
 </div>

 <div className="min-w-0 pr-0.5">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 To City <span className="text-red-500">*</span>
 </label>
 <Select
 value={formData.to_city_id}
 onChange={(e) =>
 setFormData({ ...formData, to_city_id: e.target.value })
 }
 placeholder="Select City"
 options={cities.map((city) => ({
 value: city.id,
 label: city.name,
 }))}
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="min-w-0">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Departure Date & Time <span className="text-red-500">*</span>
 </label>
 <Input
 type="datetime-local"
 value={formData.departure_time}
 onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
 />
 </div>

 <div className="min-w-0 pr-0.5">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Departure Place
 </label>
 <Select
 value={formData.departure_station_id}
 onChange={(e) => {
 const selectedStation = stations.find((s) => s.id === e.target.value)
 setFormData({
 ...formData,
 departure_station_id: e.target.value,
 departure_place: selectedStation?.name || '',
 })
 }}
 placeholder="Select Station"
 options={stations.map((station) => ({
 value: station.id,
 label: `${station.name} - ${station.cities?.name || 'N/A'}`,
 }))}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="min-w-0">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Passenger Price ($)
 </label>
 <Input
 type="number"
 step="0.01"
 value={formData.passenger_price}
 onChange={(e) =>
 setFormData({ ...formData, passenger_price: e.target.value })
 }
 placeholder="0.00"
 />
 </div>

 <div className="min-w-0 pr-0.5">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Cargo Price per KG ($)
 </label>
 <Input
 type="number"
 step="0.01"
 value={formData.cargo_price_per_kg}
 onChange={(e) =>
 setFormData({
 ...formData,
 cargo_price_per_kg: e.target.value,
 })
 }
 placeholder="0.00"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="min-w-0">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Contact Phone <span className="text-red-500">*</span>
 </label>
 <Input
 type="tel"
 value={formData.contact_phone}
 onChange={(e) =>
 setFormData({ ...formData, contact_phone: e.target.value })
 }
 placeholder="+252..."
 />
 </div>

 <div className="min-w-0 pr-0.5">
 <label className="block text-sm font-medium text-gray-700 mb-2">
 WhatsApp
 </label>
 <Input
 type="tel"
 value={formData.whatsapp}
 onChange={(e) =>
 setFormData({ ...formData, whatsapp: e.target.value })
 }
 placeholder="+252..."
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Notes
 </label>
 <TextArea
 value={formData.notes}
 onChange={(e) =>
 setFormData({ ...formData, notes: e.target.value })
 }
 placeholder="Additional notes..."
 rows={3}
 />
 </div>

 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id="is_active"
 checked={formData.is_active}
 onChange={(e) =>
 setFormData({ ...formData, is_active: e.target.checked })
 }
 className="rounded"
 />
 <label
 htmlFor="is_active"
 className="text-sm font-medium text-gray-700"
 >
 Active Route
 </label>
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsModalOpen(false)
 setSelectedRoute(null)
 }}
 >
 Cancel
 </Button>
 <Button variant="primary" onClick={handleSave}>
 {selectedRoute ? 'Update' : 'Create'}
 </Button>
 </div>
 </div>
 </Modal>

 <Modal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setSelectedRoute(null)
 }}
 title="Delete Route"
 >
 <div className="space-y-4">
 <p className="text-gray-700">
 Are you sure you want to delete this route? This action cannot be
 undone.
 </p>
 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsDeleteModalOpen(false)
 setSelectedRoute(null)
 }}
 >
 Cancel
 </Button>
 <Button variant="danger" onClick={handleDelete}>
 Delete
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 </DashboardLayout>
 )
}