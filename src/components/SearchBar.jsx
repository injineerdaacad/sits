import { useState } from 'react'
import { Input } from './Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export function SearchBar({
 placeholder = 'Search...',
 value,
 onChange,
 onSearch,
 className = '',
}) {
 const [searchValue, setSearchValue] = useState(value || '')

 const handleChange = (e) => {
 const newValue = e.target.value
 setSearchValue(newValue)
 if (onChange) {
 onChange(newValue)
 }
 }

 const handleSubmit = (e) => {
 e.preventDefault()
 if (onSearch) {
 onSearch(searchValue)
 }
 }

 return (
 <form onSubmit={handleSubmit} className={`relative ${className}`}>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
 <FontAwesomeIcon
 icon={faSearch}
 className="text-slate-400"
 />
 </div>
 <Input
 type="text"
 value={searchValue}
 onChange={handleChange}
 placeholder={placeholder}
 className="pl-10"
 />
 </div>
 </form>
 )
}

