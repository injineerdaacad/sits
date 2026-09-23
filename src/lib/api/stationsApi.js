import { supabase } from '../supabaseClient'

export async function getStations() {
 const { data, error } = await supabase
 .from('stations')
 .select('*, cities(*)')
 .order('name', { ascending: true })

 if (error) throw error
 return data
}

export async function getStationsByCity(cityId) {
 const { data, error } = await supabase
 .from('stations')
 .select('*, cities(*)')
 .eq('city_id', cityId)
 .order('name', { ascending: true })

 if (error) throw error
 return data
}

export async function getStationById(id) {
 const { data, error } = await supabase
 .from('stations')
 .select('*, cities(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function getStationsByAdmin(stationId) {
 const { data, error } = await supabase
 .from('stations')
 .select('*, cities(*)')
 .eq('id', stationId)
 .single()

 if (error) throw error
 return data
}

export async function createStation(stationData) {
 const { data, error } = await supabase
 .from('stations')
 .insert(stationData)
 .select('*, cities(*)')
 .single()

 if (error) throw error
 return data
}

export async function updateStation(id, updates) {
 const { data, error } = await supabase
 .from('stations')
 .update(updates)
 .eq('id', id)
 .select('*, cities(*)')
 .single()

 if (error) throw error
 return data
}

export async function deleteStation(id) {
 const { error } = await supabase.from('stations').delete().eq('id', id)

 if (error) throw error
}

