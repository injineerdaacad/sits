import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faServer, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../../components/Button'

export default function ServerErrorPage() {
 const handleRefresh = () => {
 window.location.reload()
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
 <div className="max-w-md w-full text-center">
 <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
 
 <div className="mb-6">
 <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
 <FontAwesomeIcon
 icon={faServer}
 className="text-5xl text-orange-600"
 />
 </div>
 </div>

 
 <h1 className="text-6xl font-bold text-gray-900 mb-4">
 500
 </h1>

 
 <h2 className="text-2xl font-semibold text-gray-800 mb-4">
 Server Error
 </h2>

 <p className="text-gray-600 mb-8">
 Something went wrong on our end. We're working to fix it. Please try again later.
 </p>

 
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Button
 variant="primary"
 onClick={handleRefresh}
 className="w-full sm:w-auto"
 >
 <FontAwesomeIcon icon={faRefresh} className="mr-2" />
 Refresh Page
 </Button>
 <Link to="/">
 <Button variant="secondary" className="w-full sm:w-auto">
 <FontAwesomeIcon icon={faHome} className="mr-2" />
 Go Home
 </Button>
 </Link>
 </div>
 </div>
 </div>
 </div>
 )
}

