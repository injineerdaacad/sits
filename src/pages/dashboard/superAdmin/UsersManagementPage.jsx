import { useEffect, useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { Card } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Modal } from '../../../components/Modal'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { getAllProfiles, updateProfile, createUserWithProfile, deleteUserProfile } from '../../../lib/api/authApi'
import { getStations } from '../../../lib/api/stationsApi'
import { useToast } from '../../../hooks/useToast'
import { ROLE_TYPE, ROLE_LABELS } from '../../../utils/enums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faEdit, faUserShield, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { formatDayDateTimeEn } from '../../../utils/helpers'

export default function UsersManagementPage() {
 const [users, setUsers] = useState([])
 const [stations, setStations] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [isEditModalOpen, setIsEditModalOpen] = useState(false)
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [selectedUser, setSelectedUser] = useState(null)
 const [formData, setFormData] = useState({
 role: '',
 station_id: '',
 })
 const [createFormData, setCreateFormData] = useState({
 email: '',
 password: '',
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 role: ROLE_TYPE.USER,
 station_id: '',
 })
 const { showToast } = useToast()

 useEffect(() => {
 loadData()
 }, [])

 const loadData = async () => {
 try {
 setIsLoading(true)
 const [usersData, stationsData] = await Promise.all([
 getAllProfiles(),
 getStations(),
 ])
 setUsers(usersData || [])
 setStations(stationsData || [])
 } catch (error) {
 console.error('Error loading data:', error)
 showToast('Failed to load users', 'error')
 } finally {
 setIsLoading(false)
 }
 }

 const handleEdit = (user) => {
 setSelectedUser(user)
 setFormData({
 role: user.role || ROLE_TYPE.USER,
 station_id: user.station_id || '',
 })
 setIsEditModalOpen(true)
 }

 const handleCreate = () => {
 setCreateFormData({
 email: '',
 password: '',
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 role: ROLE_TYPE.USER,
 station_id: '',
 })
 setIsCreateModalOpen(true)
 }

 const handleCreateSave = async () => {
 if (!createFormData.email || !createFormData.password || !createFormData.first_name || !createFormData.last_name) {
 showToast('Please fill in all required fields', 'error')
 return
 }

 if (createFormData.password.length < 6) {
 showToast('Password must be at least 6 characters', 'error')
 return
 }

 try {
 await createUserWithProfile(createFormData)
 showToast('User created successfully', 'success')
 setIsCreateModalOpen(false)
 setCreateFormData({
 email: '',
 password: '',
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 role: ROLE_TYPE.USER,
 station_id: '',
 })
 loadData()
 } catch (error) {
 console.error('Error creating user:', error)
 showToast(error.message || 'Failed to create user', 'error')
 }
 }

 const handleSave = async () => {
 if (!selectedUser) return

 try {
 await updateProfile(selectedUser.id, formData)
 showToast('User updated successfully', 'success')
 setIsEditModalOpen(false)
 setSelectedUser(null)
 loadData()
 } catch (error) {
 console.error('Error updating user:', error)
 showToast('Failed to update user', 'error')
 }
 }

 const handleDelete = async () => {
 if (!selectedUser) return

 try {
 await deleteUserProfile(selectedUser.id)
 showToast('User deleted successfully', 'success')
 setIsDeleteModalOpen(false)
 setSelectedUser(null)
 loadData()
 } catch (error) {
 console.error('Error deleting user:', error)
 showToast('Failed to delete user', 'error')
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
 Users Management
 </h1>
 <p className="text-gray-600 mt-2">
 Manage user roles and station assignments
 </p>
 </div>
 <Button variant="primary" onClick={handleCreate}>
 <FontAwesomeIcon icon={faPlus} className="mr-2" />
 Add User
 </Button>
 </div>

 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Name
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Email
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Role
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Station
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
 Phone
 </th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Updated</th>
 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
 </tr>
 </thead>
 <tbody>
 {users.length === 0 ? (
 <tr>
 <td colSpan="6" className="py-8 text-center text-gray-500">
 No users found
 </td>
 </tr>
 ) : (
 users.map((user) => (
 <tr
 key={user.id}
 className="border-b border-gray-200 hover:bg-gray-50"
 >
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faUserShield}
 className="text-gray-400"
 />
 <span className="text-gray-900">
 {user.first_name} {user.last_name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {user.email || 'N/A'}
 </td>
 <td className="py-3 px-4">
 <Badge
 className={
 user.role === ROLE_TYPE.SUPER_ADMIN
 ? 'bg-purple-100 text-purple-800'
 : user.role === ROLE_TYPE.ADMIN
 ? 'bg-blue-100 text-blue-800'
 : 'bg-gray-100 text-gray-800'
 }
 >
 {ROLE_LABELS[user.role] || user.role}
 </Badge>
 </td>
 <td className="py-3 px-4 text-gray-600">
 {user.station_id ? 'Assigned' : 'Not assigned'}
 </td>
 <td className="py-3 px-4 text-gray-600">{user.phone || 'N/A'}</td>
 <td className="py-3 px-4 text-gray-600 text-xs">{formatDayDateTimeEn(user.created_at)}</td>
 <td className="py-3 px-4 text-gray-600 text-xs">{formatDayDateTimeEn(user.updated_at)}</td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEdit(user)}
 >
 <FontAwesomeIcon icon={faEdit} className="mr-2" />
 Edit
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSelectedUser(user)
 setIsDeleteModalOpen(true)
 }}
 >
 <FontAwesomeIcon icon={faTrash} className="text-red-600" />
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
 isOpen={isCreateModalOpen}
 onClose={() => {
 setIsCreateModalOpen(false)
 setCreateFormData({
 email: '',
 password: '',
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 role: ROLE_TYPE.USER,
 station_id: '',
 })
 }}
 title="Create New User"
 size="lg"
 >
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 First Name *
 </label>
 <Input
 type="text"
 value={createFormData.first_name}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, first_name: e.target.value })
 }
 placeholder="Enter first name"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Last Name *
 </label>
 <Input
 type="text"
 value={createFormData.last_name}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, last_name: e.target.value })
 }
 placeholder="Enter last name"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Middle Name
 </label>
 <Input
 type="text"
 value={createFormData.middle_name}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, middle_name: e.target.value })
 }
 placeholder="Enter middle name (optional)"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Email *
 </label>
 <Input
 type="email"
 value={createFormData.email}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, email: e.target.value })
 }
 placeholder="Enter email address"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Password *
 </label>
 <Input
 type="password"
 value={createFormData.password}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, password: e.target.value })
 }
 placeholder="Enter password (min 6 characters)"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Phone
 </label>
 <Input
 type="text"
 value={createFormData.phone}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, phone: e.target.value })
 }
 placeholder="Enter phone number (optional)"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Role *
 </label>
 <Select
 value={createFormData.role}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, role: e.target.value })
 }
 placeholder="Select Role"
 options={[
 { value: ROLE_TYPE.SUPER_ADMIN, label: 'Super Admin' },
 { value: ROLE_TYPE.ADMIN, label: 'Admin' },
 { value: ROLE_TYPE.USER, label: 'User' },
 ]}
 />
 </div>

 {createFormData.role === ROLE_TYPE.ADMIN && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Station
 </label>
 <Select
 value={createFormData.station_id}
 onChange={(e) =>
 setCreateFormData({ ...createFormData, station_id: e.target.value })
 }
 placeholder="Select Station (optional)"
 options={[
 { value: '', label: 'Select Station (optional)' },
 ...stations.map((station) => ({
 value: station.id,
 label: `${station.name} - ${station.cities?.name || 'N/A'}`,
 })),
 ]}
 />
 </div>
 )}

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsCreateModalOpen(false)
 setCreateFormData({
 email: '',
 password: '',
 first_name: '',
 middle_name: '',
 last_name: '',
 phone: '',
 role: ROLE_TYPE.USER,
 station_id: '',
 })
 }}
 >
 Cancel
 </Button>
 <Button variant="primary" onClick={handleCreateSave}>
 Create User
 </Button>
 </div>
 </div>
 </Modal>

 
 <Modal
 isOpen={isEditModalOpen}
 onClose={() => {
 setIsEditModalOpen(false)
 setSelectedUser(null)
 }}
 title="Edit User"
 >
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Role
 </label>
 <Select
 value={formData.role}
 onChange={(e) =>
 setFormData({ ...formData, role: e.target.value })
 }
 placeholder="Select Role"
 options={[
 { value: ROLE_TYPE.SUPER_ADMIN, label: 'Super Admin' },
 { value: ROLE_TYPE.ADMIN, label: 'Admin' },
 { value: ROLE_TYPE.USER, label: 'User' },
 ]}
 />
 </div>

 {formData.role === ROLE_TYPE.ADMIN && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Station
 </label>
 <Select
 value={formData.station_id}
 onChange={(e) =>
 setFormData({ ...formData, station_id: e.target.value })
 }
 placeholder="Select Station"
 options={[
 { value: '', label: 'Select Station' },
 ...stations.map((station) => ({
 value: station.id,
 label: `${station.name} - ${station.cities?.name || 'N/A'}`,
 })),
 ]}
 />
 </div>
 )}

 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsEditModalOpen(false)
 setSelectedUser(null)
 }}
 >
 Cancel
 </Button>
 <Button variant="primary" onClick={handleSave}>
 Save Changes
 </Button>
 </div>
 </div>
 </Modal>

 
 <Modal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setSelectedUser(null)
 }}
 title="Delete User"
 >
 <div className="space-y-4">
 <p className="text-gray-700">
 Are you sure you want to delete user{' '}
 <strong>
 {selectedUser?.first_name} {selectedUser?.last_name}
 </strong>
 ? This action cannot be undone. The user will lose access to the system.
 </p>
 <div className="flex justify-end gap-2 pt-4">
 <Button
 variant="secondary"
 onClick={() => {
 setIsDeleteModalOpen(false)
 setSelectedUser(null)
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