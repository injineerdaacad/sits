import { supabase } from '../supabaseClient'

export async function getCargoBookings() {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getCargoBookingsByUser(userId) {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getCargoBookingsByRoute(routeId) {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('route_id', routeId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getCargoBookingsByStation(stationId) {
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
 .from('cargo_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .in('route_id', routeIds)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data || []
}

export async function getCargoBookingById(id) {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createCargoBooking(bookingData) {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .insert(bookingData)
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function updateCargoBooking(id, updates) {
 const { data, error } = await supabase
 .from('cargo_bookings')
 .update(updates)
 .eq('id', id)
 .select('*, routes(*, vehicles(*, stations(*, cities(*)))), profiles!user_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function deleteCargoBooking(id) {
 const { error } = await supabase.from('cargo_bookings').delete().eq('id', id)

 if (error) throw error
}

