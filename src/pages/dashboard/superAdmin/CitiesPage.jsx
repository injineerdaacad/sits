import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import {
 getCities,
 createCity,
 updateCity,
 deleteCity,
} from '../../../lib/api/citiesApi'
import { useToast } from '../../../hooks/useToast'
import { getErrorMessage } from '../../../utils/errorHelpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faCity,
 faPlus,
 faEdit,
 faTrash,
} from '@fortawesome/free-solid-svg-icons'

export default function CitiesPage() {
 const [cities, setCities] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [selectedCity, setSelectedCity] = useState(null)
 const [formData, setFormData] = useState({ name: '' })
 const { showToast } = useToast()

 useEffect(() => {
 loadCities()
 }, [])

 const loadCities = async () => {
 try {
 setIsLoading(true)
 const data = await getCities()
 setCities(data || [])
 } catch (error) {
 console.error('Error loading cities:', error)
 showToast('Failed to load cities', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const handleCreate = () => {
 setSelectedCity(null)
 setFormData({ name: '' })
 setIsModalOpen(true)
 }

 const handleEdit = (city) => {
 setSelectedCity(city)
 setFormData({ name: city.name })
 setIsModalOpen(true)
 }

 const handleSave = async () => {
 try {
 if (selectedCity) {
 await updateCity(selectedCity.id, formData)
 showToast('City updated successfully', 'success')
 } else {
 await createCity(formData)
 showToast('City created successfully', 'success')
 }

 setIsModalOpen(false)
 setSelectedCity(null)
 loadCities()
 } catch (error) {
 console.error('Error saving city:', error)
 const errorMessage = getErrorMessage(error)
 
 if (errorMessage.includes('Permission denied') || errorMessage.includes('permission')) {
 showToast('Permission denied. Please disable RLS on cities table: ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;', 'error')
 } else {
 showToast(errorMessage || 'Failed to save city', 'error')
 }
 }
 }

 const handleDelete = async () => {
 if (!selectedCity) return

 try {
 await deleteCity(selectedCity.id)
 showToast('City deleted successfully', 'success')
 setIsDeleteModalOpen(false)
 setSelectedCity(null)
 loadCities()
 } catch (error) {
 console.error('Error deleting city:', error)
 showToast('Failed to delete city', 'error')
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
 Cities Management
 </h1>
 <p className="text-gray-600 mt-2">
 Manage cities in the transport system
 </p>
 </div>
 <Button variant="primary" onClick={handleCreate}>
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Add City
 </Button>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 City Name
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Created Date
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody>
 {cities.length === 0 ? (
 <tr>
 <td colSpan="3" className="py-8 text-center text-gray-500">
 No cities found. Create your first city.
 </td>
 </tr>
 ) : (
 cities.map((city) => (
 <tr
 key={city.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faCity}
 className="text-sky-600"
 />
 <span className="text-gray-900 font-medium">
 {city.name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {/* English weekday + DD-MM-YYYY */}
 {(() => {
	 const dt = city.created_at
	 try {
		 const d = new Date(dt)
		 const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
		 const day = weekdays[d.getDay()] || ''
		 const dd = String(d.getDate()).padStart(2, '0')
		 const mm = String(d.getMonth() + 1).padStart(2, '0')
		 const yyyy = d.getFullYear()
		 return `${day} ${dd}-${mm}-${yyyy}`
	 } catch { return String(dt) }
 })()}
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(city)}
 >
 <FontAwesomeIcon icon={faEdit} />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSelectedCity(city)
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
 setSelectedCity(null)
 }}
 title={selectedCity ? 'Edit City' : 'Add New City'}
 >
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 City Name
 </label>
 <Input
 type="text"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 placeholder="Enter city name"
 />
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsModalOpen(false)
 setSelectedCity(null)
 }}
 >
 Cancel
 </Button>
 <Button variant="primary" onClick={handleSave}>
 {selectedCity ? 'Update' : 'Create'}
 </Button>
 </div>
 </div>
 </Modal>

 <Modal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setSelectedCity(null)
 }}
 title="Delete City"
 >
 <div className="space-y-4">
 <p className="text-gray-700">
 Are you sure you want to delete{' '}
 <strong>{selectedCity?.name}</strong>? This action cannot be
 undone.
 </p>
 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsDeleteModalOpen(false)
 setSelectedCity(null)
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