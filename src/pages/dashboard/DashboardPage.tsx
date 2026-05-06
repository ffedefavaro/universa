import { useState, useEffect } from 'react'
import { User } from '@/types'
import { runQuery } from '@/services/database'
import { Building2, Users, ClipboardList, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface DashboardStats {
  totaleAziende: number
  totaleLavoratori: number
  visiteOggi: number
  visiteSettimana: number
  scadenzeProssime7Giorni: number
  scadenzeProssime30Giorni: number
  inidoneiTemporanei: number
  inidoneiPermanenti: number
}

interface DashboardPageProps {
  user: User
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const days7Future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const days30Future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const [aziende, lavoratori, visiteOggi, visiteSettimana, scadenze7, scadenze30, inidoneiT, inidoneiP] = await Promise.all([
          runQuery<{ count: number }>('SELECT COUNT(*) as count FROM aziende WHERE stato_attivita = ?', ['attiva']),
          runQuery<{ count: number }>('SELECT COUNT(*) as count FROM lavoratori WHERE data_cessazione IS NULL'),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE data_visita = ?", [today]),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE data_visita >= ?", [weekAgo]),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE prossima_visita BETWEEN ? AND ? AND esito IN ('idoneo', 'idoneo_con_limitazioni')", [today, days7Future]),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE prossima_visita BETWEEN ? AND ? AND esito IN ('idoneo', 'idoneo_con_limitazioni')", [today, days30Future]),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE esito = 'inidoneo_temporaneo'"),
          runQuery<{ count: number }>("SELECT COUNT(*) as count FROM visite WHERE esito = 'inidoneo_permanente'")
        ])

        setStats({
          totaleAziende: aziende[0]?.count || 0,
          totaleLavoratori: lavoratori[0]?.count || 0,
          visiteOggi: visiteOggi[0]?.count || 0,
          visiteSettimana: visiteSettimana[0]?.count || 0,
          scadenzeProssime7Giorni: scadenze7[0]?.count || 0,
          scadenzeProssime30Giorni: scadenze30[0]?.count || 0,
          inidoneiTemporanei: inidoneiT[0]?.count || 0,
          inidoneiPermanenti: inidoneiP[0]?.count || 0
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Aziende Attive', value: stats?.totaleAziende || 0, icon: Building2, color: 'bg-blue-500' },
    { title: 'Lavoratori', value: stats?.totaleLavoratori || 0, icon: Users, color: 'bg-green-500' },
    { title: 'Visite Oggi', value: stats?.visiteOggi || 0, icon: ClipboardList, color: 'bg-purple-500' },
    { title: 'Visite Questa Settimana', value: stats?.visiteSettimana || 0, icon: ClipboardList, color: 'bg-indigo-500' },
    { title: 'Scadenze 7 Giorni', value: stats?.scadenzeProssime7Giorni || 0, icon: AlertTriangle, color: 'bg-yellow-500' },
    { title: 'Scadenze 30 Giorni', value: stats?.scadenzeProssime30Giorni || 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Inidonei Temporanei', value: stats?.inidoneiTemporanei || 0, icon: XCircle, color: 'bg-red-500' },
    { title: 'Inidonei Permanenti', value: stats?.inidoneiPermanenti || 0, icon: XCircle, color: 'bg-gray-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Benvenuto su MediLavoro</h2>
        <p className="text-gray-600">
          Questo è il gestionale per la Medicina del Lavoro. Utilizza il menu laterale per navigare tra le diverse sezioni:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-500" />
            <span><strong>Aziende:</strong> Gestisci le aziende assistite</span>
          </li>
          <li className="flex items-center gap-2">
            <Users size={16} className="text-green-500" />
            <span><strong>Lavoratori:</strong> Anagrafica dei lavoratori</span>
          </li>
          <li className="flex items-center gap-2">
            <ClipboardList size={16} className="text-purple-500" />
            <span><strong>Visite:</strong> Programma e registra le visite mediche</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-indigo-500" />
            <span><strong>Protocolli:</strong> Definisci i protocolli sanitari</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
