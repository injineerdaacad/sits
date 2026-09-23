import { supabase } from '../supabaseClient'

export async function getRoutes() {
 const { data, error } = await supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .order('departure_time', { ascending: true })

 if (error) throw error
 return data
}

export async function getRoutesAdmin() {
	const { data, error } = await supabase
	.from('routes')
	.select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
	.order('departure_time', { ascending: true })

	if (error) throw error
	return data
}

export async function getActiveRoutes() {
 const { data, error } = await supabase
 .from('routes')
 .select(`
 *,
 vehicles(
 *,
 stations(*, cities(*))
 ),
 cities_from:cities!from_city_id(*),
 cities_to:cities!to_city_id(*)
 `)
 .eq('is_active', true)
 .order('departure_time', { ascending: true })

 if (error) throw error
 return data
}

export async function searchRoutes(fromCityId, toCityId, serviceType = null) {
 let query = supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .eq('is_active', true)
 .eq('from_city_id', fromCityId)
 .eq('to_city_id', toCityId)

 if (serviceType) {
 query = query.eq('vehicles.service_type', serviceType)
 }

 const { data, error } = await query.order('departure_time', { ascending: true })

 if (error) throw error
 return data
}

export async function searchRoutesByCityNames(fromCityName, toCityName, serviceType = null) {
 let query = supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .eq('is_active', true)
 .ilike('from_city_name', `%${fromCityName}%`)
 .ilike('to_city_name', `%${toCityName}%`)

 if (serviceType) {
 query = query.eq('vehicles.service_type', serviceType)
 }

 const { data, error } = await query.order('departure_time', { ascending: true })

 if (error) throw error
 return data
}

export async function getRoutesByVehicle(vehicleId) {
 const { data, error } = await supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .eq('vehicle_id', vehicleId)
 .order('departure_time', { ascending: true })

 if (error) throw error
 return data
}

export async function getRoutesByStation(stationId) {
 const { data: vehicles, error: vehiclesError } = await supabase
 .from('vehicles')
 .select('id')
 .eq('station_id', stationId)

 if (vehiclesError) throw vehiclesError

 if (!vehicles || vehicles.length === 0) {
 return []
 }

 const vehicleIds = vehicles.map(v => v.id)

 const { data, error } = await supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .in('vehicle_id', vehicleIds)
 .order('departure_time', { ascending: true })

 if (error) throw error
 return data || []
}

export async function getRoutesByStationAdmin(stationId) {
	const { data: vehicles, error: vehiclesError } = await supabase
	.from('vehicles')
	.select('id')
	.eq('station_id', stationId)

	if (vehiclesError) throw vehiclesError

	if (!vehicles || vehicles.length === 0) {
	return []
	}

	const vehicleIds = vehicles.map(v => v.id)

	const { data, error } = await supabase
	.from('routes')
	.select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
	.in('vehicle_id', vehicleIds)
	.order('departure_time', { ascending: true })

	if (error) throw error
	return data || []
}

export async function getRouteById(id) {
 const { data, error } = await supabase
 .from('routes')
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createRoute(routeData) {
 const { data, error } = await supabase
 .from('routes')
 .insert(routeData)
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function updateRoute(id, updates) {
 const { data, error } = await supabase
 .from('routes')
 .update(updates)
 .eq('id', id)
 .select('*, vehicles(*, stations(*, cities(*))), cities_from:cities!from_city_id(*), cities_to:cities!to_city_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function deleteRoute(id) {
 const { error } = await supabase.from('routes').delete().eq('id', id)

 if (error) throw error
}