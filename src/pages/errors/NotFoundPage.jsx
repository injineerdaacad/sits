import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../../components/Button'

export default function NotFoundPage() {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
 <div className="max-w-md w-full text-center">
 <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
 
 <div className="mb-6">
 <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
 <FontAwesomeIcon
 icon={faExclamationTriangle}
 className="text-5xl text-red-600"
 />
 </div>
 </div>

 
 <h1 className="text-6xl font-bold text-gray-900 mb-4">
 404
 </h1>

 
 <h2 className="text-2xl font-semibold text-gray-800 mb-4">
 Page Not Found
 </h2>

 <p className="text-gray-600 mb-8">
 The page you are looking for does not exist or has been moved.
 </p>

 
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link to="/">
 <Button variant="primary" className="w-full sm:w-auto">
 <FontAwesomeIcon icon={faHome} className="mr-2" />
 Go Home
 </Button>
 </Link>
 <Button
 variant="secondary"
 onClick={() => window.history.back()}
 className="w-full sm:w-auto"
 >
 Go Back
 </Button>
 </div>
 </div>
 </div>
 </div>
 )
}

