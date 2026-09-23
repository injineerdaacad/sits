import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { TextArea } from '../../../components/TextArea'
import {
 getStations,
 createStation,
 updateStation,
 deleteStation,
} from '../../../lib/api/stationsApi'
import { getCities } from '../../../lib/api/citiesApi'
import { useToast } from '../../../hooks/useToast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faBuilding,
 faPlus,
 faEdit,
 faTrash,
} from '@fortawesome/free-solid-svg-icons'

export default function StationsPage() {
 const [stations, setStations] = useState([])
 const [cities, setCities] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [selectedStation, setSelectedStation] = useState(null)
 const [formData, setFormData] = useState({
 name: '',
 city_id: '',
 location_details: '',
 })
 const { showToast } = useToast()

 useEffect(() => {
 loadData()
 }, [])

 const loadData = async () => {
 try {
 setIsLoading(true)
 const [stationsData, citiesData] = await Promise.all([
 getStations(),
 getCities(),
 ])
 setStations(stationsData || [])
 setCities(citiesData || [])
 } catch (error) {
 console.error('Error loading data:', error)
 showToast('Failed to load stations', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const handleCreate = () => {
 setSelectedStation(null)
 setFormData({
 name: '',
 city_id: '',
 location_details: '',
 })
 setIsModalOpen(true)
 }

 const handleEdit = (station) => {
 setSelectedStation(station)
 setFormData({
 name: station.name,
 city_id: station.city_id,
 location_details: station.location_details || '',
 })
 setIsModalOpen(true)
 }

 const handleSave = async () => {
 try {
 if (selectedStation) {
 await updateStation(selectedStation.id, formData)
 showToast('Station updated successfully', 'success')
 } else {
 await createStation(formData)
 showToast('Station created successfully', 'success')
 }
 setIsModalOpen(false)
 setSelectedStation(null)
 loadData()
 } catch (error) {
 console.error('Error saving station:', error)
 showToast('Failed to save station', 'error')
 }
 }

 const handleDelete = async () => {
 if (!selectedStation) return

 try {
 await deleteStation(selectedStation.id)
 showToast('Station deleted successfully', 'success')
 setIsDeleteModalOpen(false)
 setSelectedStation(null)
 loadData()
 } catch (error) {
 console.error('Error deleting station:', error)
 showToast('Failed to delete station', 'error')
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
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">
 Stations Management
 </h1>
 <p className="text-gray-600 mt-2">
 Manage transport stations across cities
 </p>
 </div>
 <Button variant="primary" onClick={handleCreate}>
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Add Station
 </Button>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Station Name
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 City
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Location Details
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {stations.length === 0 ? (
 <tr>
 <td colSpan="4" className="py-8 text-center text-gray-500">
 No stations found
 </td>
 </tr>
 ) : (
 stations.map((station) => (
 <tr
 key={station.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faBuilding}
 className="text-sky-600"
 />
 <span className="text-gray-900 font-medium">
 {station.name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {station.cities?.name || 'N/A'}
 </td>
 <td className="py-3 px-4 text-gray-600">
 {station.location_details || 'N/A'}
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(station)}
 >
 <FontAwesomeIcon icon={faEdit} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSelectedStation(station)
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
 setSelectedStation(null)
 }}
 title={selectedStation ? 'Edit Station' : 'Add New Station'}
 size="lg"
 >
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Station Name
 </label>
 <Input
 type="text"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 placeholder="Enter station name"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 City
 </label>
 <Select
 value={formData.city_id}
 onChange={(e) =>
 setFormData({ ...formData, city_id: e.target.value })
 }
 placeholder="Select City"
 options={cities.map((city) => ({
 value: city.id,
 label: city.name,
 }))}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Location Details
 </label>
 <TextArea
 value={formData.location_details}
 onChange={(e) =>
 setFormData({ ...formData, location_details: e.target.value })
 }
 placeholder="Enter location details (optional)"
 rows={3}
 />
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsModalOpen(false)
 setSelectedStation(null)
 }}
 >
 Cancel
 </Button>
 <Button variant="primary" onClick={handleSave}>
 {selectedStation ? 'Update' : 'Create'}
 </Button>
 </div>
 </div>
 </Modal>

 
 <Modal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setSelectedStation(null)
 }}
 title="Delete Station"
 >
 <div className="space-y-4">
 <p className="text-gray-700">
 Are you sure you want to delete{' '}
 <strong>{selectedStation?.name}</strong>? This action cannot be
 undone.
 </p>
 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsDeleteModalOpen(false)
 setSelectedStation(null)
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

