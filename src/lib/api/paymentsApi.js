import { supabase } from '../supabaseClient'

export async function getPayments() {
 const { data, error } = await supabase
 .from('payments')
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPaymentsByUser(userId) {
 const { data, error } = await supabase
 .from('payments')
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPaymentsByPassengerBooking(bookingId) {
 const { data, error } = await supabase
 .from('payments')
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .eq('passenger_booking_id', bookingId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPaymentsByCargoBooking(bookingId) {
 const { data, error } = await supabase
 .from('payments')
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .eq('cargo_booking_id', bookingId)
 .order('created_at', { ascending: false })

 if (error) throw error
 return data
}

export async function getPaymentsByStation(stationId) {
 const { data, error } = await supabase
 .from('payments')
 .select(`
 *,
 profiles!user_id(*),
 passenger_bookings(*, routes(*, vehicles(*, stations(*)))),
 cargo_bookings(*, routes(*, vehicles(*, stations(*))))
 `)
 .order('created_at', { ascending: false })

 if (error) throw error
 
 return data.filter((payment) => {
 const passengerStation = payment.passenger_bookings?.routes?.vehicles?.station_id
 const cargoStation = payment.cargo_bookings?.routes?.vehicles?.station_id
 return passengerStation === stationId || cargoStation === stationId
 })
}

export async function getPaymentById(id) {
 const { data, error } = await supabase
 .from('payments')
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .eq('id', id)
 .single()

 if (error) throw error
 return data
}

export async function createPayment(paymentData) {
 const { data, error } = await supabase
 .from('payments')
 .insert(paymentData)
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .single()

 if (error) throw error
 return data
}

export async function updatePayment(id, updates) {
 const { data, error } = await supabase
 .from('payments')
 .update(updates)
 .eq('id', id)
 .select('*, profiles!user_id(*), passenger_bookings(*), cargo_bookings(*)')
 .single()

 if (error) throw error
 return data
}

export async function deletePayment(id) {
 const { error } = await supabase.from('payments').delete().eq('id', id)

 if (error) throw error
}

