import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { useAuth } from '../../../context/AuthContext'
import {
 getVehicles,
 getVehiclesByStation,
 createVehicle,
 updateVehicle,
 deleteVehicle,
} from '../../../lib/api/vehiclesApi'
import { getStations } from '../../../lib/api/stationsApi'
import { useToast } from '../../../hooks/useToast'
import { getErrorMessage } from '../../../utils/errorHelpers'
import { VEHICLE_TYPE, SERVICE_TYPE, VEHICLE_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../../../utils/enums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruck, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function VehiclesPage() {
 const { profile } = useAuth()
 const [vehicles, setVehicles] = useState([])
 const [stations, setStations] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [selectedVehicle, setSelectedVehicle] = useState(null)
 const [formData, setFormData] = useState({
 name: '',
 vehicle_type: '',
 service_type: '',
 station_id: '',
 })
 const { showToast } = useToast()

 useEffect(() => {
 if (profile?.role === 'SUPER_ADMIN' || profile?.station_id) {
 loadVehicles()
 }
 if (profile?.role === 'SUPER_ADMIN') {
 loadStations()
 }
 }, [profile])

 const loadStations = async () => {
 try {
 const data = await getStations()
 console.log('Loaded stations:', data)
 setStations(data || [])
 } catch (error) {
 console.error('Error loading stations:', error)
 showToast('Failed to load stations', 'error')
 setStations([])
 }
 }

 const loadVehicles = async () => {
 if (profile?.role === 'SUPER_ADMIN') {
 try {
 setIsLoading(true)
 const data = await getVehicles()
 console.log('Loaded vehicles:', data)
 setVehicles(data || [])
 } catch (error) {
 console.error('Error loading vehicles:', error)
 showToast('Failed to load vehicles', 'error')
 } finally {
 setIsLoading(false)
 }
 } else if (profile?.station_id) {
 try {
 setIsLoading(true)
 const data = await getVehiclesByStation(profile.station_id)
 console.log('Loaded vehicles:', data)
 setVehicles(data || [])
 } catch (error) {
 console.error('Error loading vehicles:', error)
 showToast('Failed to load vehicles', 'error')
 } finally {
 setIsLoading(false)
 }
 }
 }

 const handleCreate = () => {
 setSelectedVehicle(null)
 setFormData({
 name: '',
 vehicle_type: '',
 service_type: '',
 station_id: '',
 })
 setIsModalOpen(true)
 }

 const handleEdit = (vehicle) => {
 setSelectedVehicle(vehicle)
 setFormData({
 name: vehicle.name,
 vehicle_type: vehicle.vehicle_type,
 service_type: vehicle.service_type,
 station_id: vehicle.station_id || '',
 })
 setIsModalOpen(true)
 }

 const handleSave = async () => {
 if (profile?.role !== 'SUPER_ADMIN' && !profile?.station_id) return

 if (!formData.name || !formData.vehicle_type || !formData.service_type) {
 showToast('Please fill in all required fields', 'error')
 return
 }

 if (profile?.role === 'SUPER_ADMIN' && !formData.station_id) {
 showToast('Please select a station', 'error')
 return
 }

 try {
 let vehicleData = {
 ...formData,
 station_id: profile?.role === 'SUPER_ADMIN' ? formData.station_id : profile.station_id,
 admin_id: profile.id,
 }

 if (selectedVehicle) {
 const updatedVehicle = await updateVehicle(selectedVehicle.id, vehicleData)
 console.log('Vehicle updated:', updatedVehicle)
 showToast('Vehicle updated successfully', 'success')
 } else {
 await createVehicle(vehicleData)
 showToast('Vehicle created successfully', 'success')
 }

 setIsModalOpen(false)
 setSelectedVehicle(null)
 loadVehicles()
 } catch (error) {
 console.error('Error saving vehicle:', error)
 const errorMessage = getErrorMessage(error)
 showToast(errorMessage || 'Failed to save vehicle', 'error')
 }
 }

 const handleDelete = async () => {
 if (!selectedVehicle) return

 try {
 await deleteVehicle(selectedVehicle.id)
 showToast('Vehicle deleted successfully', 'success')
 setIsDeleteModalOpen(false)
 setSelectedVehicle(null)
 loadVehicles()
 } catch (error) {
 console.error('Error deleting vehicle:', error)
 showToast('Failed to delete vehicle', 'error')
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
 Vehicles Management
 </h1>
 <p className="text-gray-600 mt-2">
 {profile?.role === 'SUPER_ADMIN' 
 ? 'View all vehicles across all stations'
 : 'Manage vehicles for your station'}
 </p>
 </div>
 <Button variant="primary" onClick={handleCreate}>
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Add Vehicle
 </Button>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Vehicle Name
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Station
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Vehicle Type
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Service Type
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {vehicles.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-8 text-center text-gray-500">
 No vehicles found. Create your first vehicle.
 </td>
 </tr>
 ) : (
 vehicles.map((vehicle) => (
 <tr
 key={vehicle.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faTruck}
 className="text-sky-600"
 />
 <span className="text-gray-900 font-medium">
 {vehicle.name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {vehicle.stations?.name || 'N/A'}
 </td>
 <td className="py-3 px-4">
 <Badge className="bg-blue-100 text-blue-800">
 {VEHICLE_TYPE_LABELS[vehicle.vehicle_type]}
 </Badge>
 </td>
 <td className="py-3 px-4">
 <Badge className="bg-green-100 text-green-800">
 {SERVICE_TYPE_LABELS[vehicle.service_type]}
 </Badge>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(vehicle)}
 >
 <FontAwesomeIcon icon={faEdit} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSelectedVehicle(vehicle)
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
 setSelectedVehicle(null)
 }}
 title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
 >
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Vehicle Name
 </label>
 <Input
 type="text"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 placeholder="Enter vehicle name"
 />
 </div>

 {profile?.role === 'SUPER_ADMIN' && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Station <span className="text-red-500">*</span>
 </label>
 {stations.length === 0 ? (
 <div className="text-sm text-gray-500 py-2">
 No stations available. Please create stations first.
 </div>
 ) : (
 <Select
 value={formData.station_id}
 onChange={(e) =>
 setFormData({ ...formData, station_id: e.target.value })
 }
 placeholder="Select Station"
 options={stations.map((station) => ({
 value: station.id,
 label: `${station.name} - ${station.cities?.name || 'N/A'}`,
 }))}
 required
 />
 )}
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Vehicle Type <span className="text-red-500">*</span>
 </label>
 <Select
 value={formData.vehicle_type}
 onChange={(e) =>
 setFormData({ ...formData, vehicle_type: e.target.value })
 }
 placeholder="Select Vehicle Type"
 options={Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
 value,
 label,
 }))}
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Service Type <span className="text-red-500">*</span>
 </label>
 <Select
 value={formData.service_type}
 onChange={(e) =>
 setFormData({ ...formData, service_type: e.target.value })
 }
 placeholder="Select Service Type"
 options={Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
 value,
 label,
 }))}
 required
 />
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsModalOpen(false)
 setSelectedVehicle(null)
 }}
 >
 Cancel
 </Button>
 <Button
 variant="primary"
 onClick={handleSave}
 >
 {selectedVehicle ? 'Update' : 'Create'}
 </Button>
 </div>
 </div>
 </Modal>

 
 <Modal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setSelectedVehicle(null)
 }}
 title="Delete Vehicle"
 >
 <div className="space-y-4">
 <p className="text-gray-700">
 Are you sure you want to delete{' '}
 <strong>{selectedVehicle?.name}</strong>? This action cannot be
 undone.
 </p>
 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsDeleteModalOpen(false)
 setSelectedVehicle(null)
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

