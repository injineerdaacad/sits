import { supabase } from '../supabaseClient'

export async function getPassengerBookings() {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPassengerBookingsByUser(userId) {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPassengerBookingsByRoute(routeId) {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('route_id', routeId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPassengerBookingsByStation(stationId) {
 const { data: vehicles, error: vehiclesError } = await supabase
 .from('vehicles')
 .select('id')
 .eq('station_id', stationId)

 if (vehiclesError) throw vehiclesError

 if (!vehicles || vehicles.length === 0) {
 return []
 }

 const vehicleIds = vehicles.map(v => v.id)

 const { data: routes, error: routesError } = await supabase
 .from('routes')
 .select('id')
 .in('vehicle_id', vehicleIds)

 if (routesError) throw routesError

 if (!routes || routes.length === 0) {
 return []
 }

 const routeIds = routes.map(r => r.id)

 const { data, error } = await supabase
 .from('passenger_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .in('route_id', routeIds)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data || []
}

export async function getPassengerBookingById(id) {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createPassengerBooking(bookingData) {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .insert(bookingData)
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function updatePassengerBooking(id, updates) {
 const { data, error } = await supabase
 .from('passenger_bookings')
 .update(updates)
 .eq('id', id)
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function deletePassengerBooking(id) {
 const { error } = await supabase
 .from('passenger_bookings')
 .delete()
 .eq('id', id)

 if (error) throw error
}

