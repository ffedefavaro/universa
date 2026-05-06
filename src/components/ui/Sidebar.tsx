import { Link, useLocation } from 'react-router-dom'
import { User } from '@/types'
import { LayoutDashboard, Building2, Users, ClipboardList, FileText, Settings, LogOut } from 'lucide-react'

interface SidebarProps {
  user: User
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/aziende', label: 'Aziende', icon: Building2 },
  { path: '/lavoratori', label: 'Lavoratori', icon: Users },
  { path: '/visite', label: 'Visite', icon: ClipboardList },
  { path: '/protocolli', label: 'Protocolli', icon: FileText },
]

export default function Sidebar({ user }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">MediLavoro</h1>
        <p className="text-xs text-gray-400 mt-1">Gestionale Medicina del Lavoro</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
            {user.nome[0]}{user.cognome[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.nome} {user.cognome}</p>
            <p className="text-xs text-gray-400 capitalize">{user.ruolo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
