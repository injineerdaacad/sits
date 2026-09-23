import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
 faRoute,
 faClock,
 faPhone,
 faUser,
 faBox,
} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { Card } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { formatDate, formatTime, formatCurrency, formatWeekdayDateTimeFromTimestampEn } from '../utils/helpers'
import { ServiceTypeLabels } from '../utils/enums'
import { useAuth } from '../context/AuthContext'

export default function RouteCard({ route }) {
 const { isLoggedIn } = useAuth()
 const navigate = useNavigate()
 const fromCity = route.cities_from?.name || route.from_city_name
 const toCity = route.cities_to?.name || route.to_city_name
 const vehicle = route.vehicles
 const station = vehicle?.stations

 const handleBookNow = () => {
   if (!isLoggedIn) {
     navigate('/auth/login')
   } else {
     navigate(`/dashboard/user/passenger-bookings?routeId=${route.id}`)
   }
 }

 return (
 <Card className="p-6 hover:shadow-lg transition-shadow">
 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
 
 <div className="flex-1">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h3 className="text-xl font-semibold text-gray-900 mb-1">
 {fromCity} → {toCity}
 </h3>
 <p className="text-sm text-gray-600">
 {vehicle?.name || 'N/A'} • {station?.name || 'N/A'}
 </p>
 </div>
 {vehicle?.service_type && (
 <Badge className="bg-blue-100 text-blue-800">
 {ServiceTypeLabels[vehicle.service_type]}
 </Badge>
 )}
 </div>

 <div className="space-y-2 text-sm">
 <div className="flex items-start gap-2 text-gray-700">
 <FontAwesomeIcon
 icon={faClock}
 className="text-sky-600 w-4 mt-0.5"
 />
 <div className="leading-tight">
 {(() => {
   const parts = (formatWeekdayDateTimeFromTimestampEn(route.departure_time) || '').split('\n')
   const [weekday, dateStr, timeStr] = parts
   return (
     <>
       <div className="font-medium">{weekday || formatDate(route.departure_time, 'DD-MM-YYYY')}</div>
       <div>{dateStr || formatDate(route.departure_time, 'DD-MM-YYYY')}</div>
       <div>{timeStr || formatTime(route.departure_time)}</div>
     </>
   )
 })()}
 </div>
 </div>

 {route.departure_place && (
 <div className="flex items-center gap-2 text-gray-700">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-sky-600 w-4"
 />
 <span>{route.departure_place}</span>
 </div>
 )}

 <div className="flex items-center gap-4 pt-2">
 {route.passenger_price && (
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faUser}
 className="text-green-600"
 />
 <span className="font-semibold text-gray-900">
 {formatCurrency(route.passenger_price)}
 </span>
 </div>
 )}

 {route.cargo_price_per_kg && (
 <div className="flex items-center gap-2">
 <FontAwesomeIcon
 icon={faBox}
 className="text-purple-600"
 />
 <span className="font-semibold text-gray-900">
 {formatCurrency(route.cargo_price_per_kg)}/kg
 </span>
 </div>
 )}
 </div>
 </div>
 </div>

 
 <div className="flex flex-col gap-3 md:items-end">
 <div className="flex flex-col gap-2 text-sm">
 {route.contact_phone && (
 <a
 href={`tel:${route.contact_phone}`}
 className="flex items-center gap-2 text-gray-700 hover:text-sky-600"
 >
 <FontAwesomeIcon icon={faPhone} />
 <span>{route.contact_phone}</span>
 </a>
 )}

 {route.whatsapp && (
 <a
 href={`https://wa.me/${route.whatsapp.replace(/\D/g, '')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-green-600 hover:text-green-700"
 >
 <FontAwesomeIcon icon={faWhatsapp} />
 <span>WhatsApp</span>
 </a>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
   <Button 
     variant="primary" 
     size="sm"
     onClick={handleBookNow}
   >
     Book Passenger
   </Button>
   <Button 
     variant="secondary" 
     size="sm"
     onClick={() => {
       if (!isLoggedIn) {
         navigate('/auth/login')
       } else {
         navigate(`/dashboard/user/cargo-bookings?routeId=${route.id}`)
       }
     }}
   >
     Book Cargo
   </Button>
 </div>
 </div>
 </div>

 {route.notes && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <p className="text-sm text-gray-600 italic">
 {route.notes}
 </p>
 </div>
 )}
 </Card>
 )
}