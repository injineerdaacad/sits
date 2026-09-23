import { supabase } from '../supabaseClient'

export async function getVehicles() {
 const { data, error } = await supabase
 .from('vehicles')
 .select('*, stations(*, cities(*)), profiles!admin_id(*)')
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getVehiclesByStation(stationId) {
 const { data, error } = await supabase
 .from('vehicles')
 .select('*, stations(*, cities(*)), profiles!admin_id(*)')
 .eq('station_id', stationId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getVehicleById(id) {
 const { data, error } = await supabase
 .from('vehicles')
 .select('*, stations(*, cities(*)), profiles!admin_id(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createVehicle(vehicleData) {
 const { data, error } = await supabase
 .from('vehicles')
 .insert(vehicleData)
 .select('*, stations(*, cities(*)), profiles!admin_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function updateVehicle(id, updates) {
 const { data, error } = await supabase
 .from('vehicles')
 .update(updates)
 .eq('id', id)
 .select('*, stations(*, cities(*)), profiles!admin_id(*)')
 .single()

 if (error) throw error
 return data
}

export async function deleteVehicle(id) {
 const { error } = await supabase.from('vehicles').delete().eq('id', id)

 if (error) throw error
}

