import { supabase } from '../supabaseClient'

export async function getCities() {
 const { data, error } = await supabase
 .from('cities')
 .select('*')
 .order('name', { ascending: true })

 if (error) throw error
 return data
}

export async function getCityById(id) {
 const { data, error } = await supabase
 .from('cities')
 .select('*')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createCity(cityData) {
 const { data, error } = await supabase
 .from('cities')
 .insert(cityData)
 .select()
 .single()

 if (error) throw error
 return data
}

export async function updateCity(id, updates) {
 const { data, error } = await supabase
 .from('cities')
 .update(updates)
 .eq('id', id)
 .select()
 .single()

 if (error) throw error
 return data
}

export async function deleteCity(id) {
 const { error } = await supabase.from('cities').delete().eq('id', id)

 if (error) throw error
}


