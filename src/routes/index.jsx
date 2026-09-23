
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import RoleProtectedRoute from '../components/RoleProtectedRoute'
import UnAuthenticatedRoute from '../components/UnAuthenticatedRoute'
import { ROLE_TYPE } from '../utils/enums'

import HomePage from '../pages/public/HomePage'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

import SuperAdminDashboard from '../pages/dashboard/superAdmin/SuperAdminDashboard'
import UsersManagementPage from '../pages/dashboard/superAdmin/UsersManagementPage'
import CitiesPage from '../pages/dashboard/superAdmin/CitiesPage'
import StationsPage from '../pages/dashboard/superAdmin/StationsPage'
import GlobalReportsPage from '../pages/dashboard/superAdmin/GlobalReportsPage'

import AdminDashboard from '../pages/dashboard/admin/AdminDashboard'
import VehiclesPage from '../pages/dashboard/admin/VehiclesPage'
import RoutesPage from '../pages/dashboard/admin/RoutesPage'
import PassengerBookingsPage from '../pages/dashboard/admin/PassengerBookingsPage'
import CargoBookingsPage from '../pages/dashboard/admin/CargoBookingsPage'
import PaymentsPage from '../pages/dashboard/admin/PaymentsPage'

import UserDashboard from '../pages/dashboard/user/UserDashboard'
import MyPassengerBookingsPage from '../pages/dashboard/user/MyPassengerBookingsPage'
import MyCargoBookingsPage from '../pages/dashboard/user/MyCargoBookingsPage'
import MyPaymentsPage from '../pages/dashboard/user/MyPaymentsPage'

import ProfilePage from '../pages/settings/ProfilePage'

import NotFoundPage from '../pages/errors/NotFoundPage'
import ServerErrorPage from '../pages/errors/ServerErrorPage'

function AppRoutes() {
 return (
 <Routes>
 
 <Route path="/" element={<HomePage />} />

 
 <Route
 path="/auth/login"
 element={
 <UnAuthenticatedRoute>
 <LoginPage />
 </UnAuthenticatedRoute>
 }
 />
 <Route
 path="/auth/register"
 element={
 <UnAuthenticatedRoute>
 <RegisterPage />
 </UnAuthenticatedRoute>
 }
 />

 
 <Route
 path="/dashboard/super-admin"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <SuperAdminDashboard />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/users"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <UsersManagementPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/cities"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <CitiesPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/stations"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <StationsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/reports"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <GlobalReportsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/vehicles"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <VehiclesPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/routes"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <RoutesPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/passenger-bookings"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <PassengerBookingsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/cargo-bookings"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <CargoBookingsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/super-admin/payments"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.SUPER_ADMIN]}>
 <PaymentsPage />
 </RoleProtectedRoute>
 }
 />

 
 <Route
 path="/dashboard/admin"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <AdminDashboard />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/admin/vehicles"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <VehiclesPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/admin/routes"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <RoutesPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/admin/passenger-bookings"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <PassengerBookingsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/admin/cargo-bookings"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <CargoBookingsPage />
 </RoleProtectedRoute>
 }
 />
 <Route
 path="/dashboard/admin/payments"
 element={
 <RoleProtectedRoute allowedRoles={[ROLE_TYPE.ADMIN]}>
 <PaymentsPage />
 </RoleProtectedRoute>
 }
 />

 
 <Route
 path="/dashboard/user"
 element={
 <ProtectedRoute>
 <UserDashboard />
 </ProtectedRoute>
 }
 />
 <Route
 path="/dashboard/user/passenger-bookings"
 element={
 <ProtectedRoute>
 <MyPassengerBookingsPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/dashboard/user/cargo-bookings"
 element={
 <ProtectedRoute>
 <MyCargoBookingsPage />
 </ProtectedRoute>
 }
 />
 <Route
 path="/dashboard/user/payments"
 element={
 <ProtectedRoute>
 <MyPaymentsPage />
 </ProtectedRoute>
 }
 />

 
 <Route
 path="/settings/profile"
 element={
 <ProtectedRoute>
 <ProfilePage />
 </ProtectedRoute>
 }
 />

 
 <Route path="/error/500" element={<ServerErrorPage />} />
 <Route path="/error/404" element={<NotFoundPage />} />

 
 <Route path="*" element={<NotFoundPage />} />
 </Routes>
 )
}

export default AppRoutes

