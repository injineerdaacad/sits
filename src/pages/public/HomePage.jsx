import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
 import { faRoute } from '@fortawesome/free-solid-svg-icons'
import { Card } from '../../components/Card'
import { useAuth } from '../../context/AuthContext'
import { getDashboardPath } from '../../utils/navigation'
import { getCities } from '../../lib/api/citiesApi'
import { searchRoutes, searchRoutesByCityNames, getActiveRoutes } from '../../lib/api/routesApi'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../utils/helpers'
import RouteCard from '../../components/RouteCard'

export default function HomePage() {
 const { isLoggedIn, profile } = useAuth()
 const [fromCity, setFromCity] = useState('')
 const [toCity, setToCity] = useState('')
 const [cities, setCities] = useState([])
 const [activeRoutes, setActiveRoutes] = useState([])
 const [searchResults, setSearchResults] = useState([])
 const [isSearching, setIsSearching] = useState(false)
 const [isLoadingRoutes, setIsLoadingRoutes] = useState(true)
 const { showToast } = useToast()

 useEffect(() => {
 loadCities()
 loadActiveRoutes()
 }, [])

 const loadCities = async () => {
 try {
 const citiesData = await getCities()
 setCities(citiesData || [])
 } catch (error) {
 console.error('Error loading cities:', error)
 }
 }

 const loadActiveRoutes = async () => {
 try {
 setIsLoadingRoutes(true)
 const routes = await getActiveRoutes()
 setActiveRoutes(routes || [])
 } catch (error) {
 console.error('Error loading active routes:', error)
 setActiveRoutes([])
 } finally {
 setIsLoadingRoutes(false)
 }
 }

 const performSearch = async (fromInput, toInput) => {
 const from = fromInput.trim()
 const to = toInput.trim()
 if (!from || !to) {
 setSearchResults([])
 return
 }

 setIsSearching(true)
 try {
 const fromLower = from.toLowerCase()
 const toLower = to.toLowerCase()

 const fromCityData =
 cities.find((c) => c.name.toLowerCase() === fromLower) ||
 cities.find((c) => c.name.toLowerCase().startsWith(fromLower))
 const toCityData =
 cities.find((c) => c.name.toLowerCase() === toLower) ||
 cities.find((c) => c.name.toLowerCase().startsWith(toLower))

 let results = []
 if (fromCityData && toCityData) {
 results = await searchRoutes(fromCityData.id, toCityData.id)
 } else {
 results = await searchRoutesByCityNames(from, to)
 }

 if (!results || results.length === 0) {
 const clientResults = (activeRoutes || []).filter((route) => {
 const fromName = route.cities_from?.name || route.from_city_name || ''
 const toName = route.cities_to?.name || route.to_city_name || ''
 return (
 fromName.toLowerCase().includes(fromLower) &&
 toName.toLowerCase().includes(toLower)
 )
 })
 results = clientResults
 }

 setSearchResults(results || [])
 if (!results || results.length === 0) {
 showToast('No routes found for the selected cities', 'info')
 }
 } catch (error) {
 console.error('Error searching routes:', error)
 showToast('Failed to search routes. Please try again.', 'error')
 setSearchResults([])
 } finally {
 setIsSearching(false)
 }
 }

 const debounceRef = useRef(null)
 useEffect(() => {
 if (debounceRef.current) clearTimeout(debounceRef.current)
 debounceRef.current = setTimeout(() => {
 if (fromCity.trim() && toCity.trim()) {
 performSearch(fromCity, toCity)
 }
 }, 300)
 return () => {
 if (debounceRef.current) clearTimeout(debounceRef.current)
 }
 }, [fromCity, toCity, cities, activeRoutes])

 return (
 <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
 <header className="bg-white shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
 SITS
 </h1>
 <div className="flex items-center gap-4">
 {isLoggedIn ? (
 <Link
 to={getDashboardPath(profile?.role)}
 className="text-sm font-medium text-gray-700 hover:text-sky-600"
 >
 Dashboard
 </Link>
 ) : (
 <>
 <Link
 to="/auth/login"
 className="text-sm font-medium text-gray-700 hover:text-sky-600"
 >
 Sign In
 </Link>
 <Link
 to="/auth/register"
 className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded"
 >
 Sign Up
 </Link>
 </>
 )}
 </div>
 </div>
 </div>
 </header>

 
 <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 
 <div className="text-center mb-12">
 <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
 Find Your Next Journey
 </h2>
 <p className="text-lg text-gray-600">
 Search for intercity transport routes across Somalia
 </p>
 </div>

 
 <Card className="p-6 mb-8">
 <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 From City
 </label>
 <input
 type="text"
 value={fromCity}
 onChange={(e) => setFromCity(e.target.value)}
 placeholder="Enter departure city"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 To City
 </label>
 <input
 type="text"
 value={toCity}
 onChange={(e) => setToCity(e.target.value)}
 placeholder="Enter destination city"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
 required
 />
 </div>
 </div>
 </form>
 </Card>
 
 
 {searchResults.length > 0 ? (
 <div className="space-y-4 mb-8">
 <h3 className="text-xl font-semibold text-gray-900">
 Search Results ({searchResults.length})
 </h3>
 <div className="space-y-4">
 {searchResults.map((route) => (
 <RouteCard key={route.id} route={route} />
 ))}
 </div>
 </div>
 ) : fromCity && toCity && !isSearching ? (
 <Card className="p-8 text-center mb-8">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-4xl text-gray-400 mb-4"
 />
 <p className="text-gray-600">
 No routes found for the selected cities.
 </p>
 </Card>
 ) : null}

 
 {(!fromCity || !toCity || searchResults.length === 0) && (
 <div className="space-y-4">
 <h3 className="text-xl font-semibold text-gray-900">
 Active Routes {isLoadingRoutes ? '' : `(${activeRoutes.length})`}
 </h3>
 {isLoadingRoutes ? (
 <Card className="p-8 text-center">
 <p className="text-gray-600">Loading routes...</p>
 </Card>
 ) : activeRoutes.length > 0 ? (
 <div className="space-y-4">
 {activeRoutes.map((route) => (
 <RouteCard key={route.id} route={route} />
 ))}
 </div>
 ) : (
 <Card className="p-8 text-center">
 <FontAwesomeIcon
 icon={faRoute}
 className="text-4xl text-gray-400 mb-4"
 />
 <p className="text-gray-600">
 No active routes available at the moment.
 </p>
 </Card>
 )}
 </div>
 )}
 </main>
 </div>
 )
}