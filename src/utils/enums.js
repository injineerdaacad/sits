




export const RoleEnum = {
 SUPER_ADMIN: 'SUPER_ADMIN',
 ADMIN: 'ADMIN',
 USER: 'USER',
}

export const VehicleTypeEnum = {
 BUS: 'BUS',
 VAN: 'VAN',
 TRUCK: 'TRUCK',
 COASTER: 'COASTER',
 MINIBUS: 'MINIBUS',
 OTHER: 'OTHER',
}

export const ServiceTypeEnum = {
 PASSENGER: 'PASSENGER',
 CARGO: 'CARGO',
 BOTH: 'BOTH',
}

export const PassengerStatusEnum = {
 PENDING: 'PENDING',
 CONFIRMED: 'CONFIRMED',
 CANCELLED: 'CANCELLED',
}

export const CargoStatusEnum = {
 PENDING: 'PENDING',
 CONFIRMED: 'CONFIRMED',
 CANCELLED: 'CANCELLED',
 DELIVERED: 'DELIVERED',
}

export const PaymentMethodEnum = {
 CASH: 'CASH',
 MOBILE_MONEY: 'MOBILE_MONEY',
 BANK: 'BANK',
}

export const PaymentStatusEnum = {
 PENDING: 'PENDING',
 PAID: 'PAID',
 FAILED: 'FAILED',
 REFUNDED: 'REFUNDED',
}





export const RoleLabels = {
 SUPER_ADMIN: 'Super Admin',
 ADMIN: 'Admin',
 USER: 'User',
}

export const VehicleTypeLabels = {
 BUS: 'Bus',
 VAN: 'Van',
 TRUCK: 'Truck',
 COASTER: 'Coaster',
 MINIBUS: 'Minibus',
 OTHER: 'Other',
}

export const ServiceTypeLabels = {
 PASSENGER: 'Passenger',
 CARGO: 'Cargo',
 BOTH: 'Both',
}

export const PassengerStatusLabels = {
 PENDING: 'Pending',
 CONFIRMED: 'Confirmed',
 CANCELLED: 'Cancelled',
}

export const CargoStatusLabels = {
 PENDING: 'Pending',
 CONFIRMED: 'Confirmed',
 CANCELLED: 'Cancelled',
 DELIVERED: 'Delivered',
}

export const PaymentMethodLabels = {
 CASH: 'Cash',
 MOBILE_MONEY: 'Mobile Money',
 BANK: 'Bank Transfer',
}

export const PaymentStatusLabels = {
 PENDING: 'Pending',
 PAID: 'Paid',
 FAILED: 'Failed',
 REFUNDED: 'Refunded',
}





export const STATUS_COLORS = {

 PENDING: 'bg-yellow-100 text-yellow-800',
 CONFIRMED: 'bg-green-100 text-green-800',
 CANCELLED: 'bg-red-100 text-red-800',
 

 DELIVERED: 'bg-blue-100 text-blue-800',
 

 PAID: 'bg-green-100 text-green-800',
 FAILED: 'bg-red-100 text-red-800',
 REFUNDED: 'bg-gray-100 text-gray-800',
}





export const ROLE_TYPE = RoleEnum
export const VEHICLE_TYPE = VehicleTypeEnum
export const SERVICE_TYPE = ServiceTypeEnum
export const PASSENGER_STATUS = PassengerStatusEnum
export const CARGO_STATUS = CargoStatusEnum
export const PAYMENT_METHOD = PaymentMethodEnum
export const PAYMENT_STATUS = PaymentStatusEnum

export const ROLE_LABELS = RoleLabels
export const VEHICLE_TYPE_LABELS = VehicleTypeLabels
export const SERVICE_TYPE_LABELS = ServiceTypeLabels
export const PASSENGER_STATUS_LABELS = PassengerStatusLabels
export const CARGO_STATUS_LABELS = CargoStatusLabels
export const PAYMENT_METHOD_LABELS = PaymentMethodLabels
export const PAYMENT_STATUS_LABELS = PaymentStatusLabels