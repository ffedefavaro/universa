import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { initDatabase } from './services/database'
import { checkAuth, logout } from './services/authService'
import { User } from './types'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AziendeListPage from './pages/aziende/AziendeListPage'
import LavoratoriListPage from './pages/lavoratori/LavoratoriListPage'
import VisiteListPage from './pages/visite/VisiteListPage'
import ProtocolliListPage from './pages/protocolli/ProtocolliListPage'

// Layout components
import Sidebar from './components/ui/Sidebar'
import Header from './components/ui/Header'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDbInitialized, setIsDbInitialized] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await initDatabase()
        setIsDbInitialized(true)
        
        const currentUser = await checkAuth()
        setUser(currentUser)
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    init()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  if (isLoading || !isDbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento MediLavoro...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage user={user} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/aziende" element={<AziendeListPage user={user} />} />
            <Route path="/lavoratori" element={<LavoratoriListPage user={user} />} />
            <Route path="/visite" element={<VisiteListPage user={user} />} />
            <Route path="/protocolli" element={<ProtocolliListPage user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
