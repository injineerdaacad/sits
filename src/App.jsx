import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { UIProvider } from './context/UIContext'
import { ToastContainer } from './components/ToastContainer'
import AppRoutes from './routes/index'

function App() {
 return (
 <BrowserRouter>
 <UIProvider>
 <ToastProvider>
 <AuthProvider>
 <AppRoutes />
 <ToastContainer />
 </AuthProvider>
 </ToastProvider>
 </UIProvider>
 </BrowserRouter>
 )
}

export default App