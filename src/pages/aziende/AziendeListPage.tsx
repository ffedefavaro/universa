import { useState, useEffect } from 'react'
import { User, Azienda } from '@/types'
import { getAllAziende, createAzienda } from '@/services/aziendeService'
import { Plus, Search, Building2 } from 'lucide-react'

interface AziendeListPageProps {
  user: User
}

export default function AziendeListPage({ user }: AziendeListPageProps) {
  const [aziende, setAziende] = useState<Azienda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newAzienda, setNewAzienda] = useState<Partial<Azienda>>({
    ragione_sociale: '',
    partita_iva: '',
    codice_fiscale: '',
    indirizzo_sede: '',
    cap_sede: '',
    comune_sede: '',
    provincia_sede: '',
    telefono: '',
    email: '',
    datore_lavoro_nome: '',
    datore_lavoro_cognome: ''
  })

  useEffect(() => {
    loadAziende()
  }, [])

  async function loadAziende() {
    try {
      const data = await getAllAziende()
      setAziende(data)
    } catch (error) {
      console.error('Error loading aziende:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateAzienda(e: React.FormEvent) {
    e.preventDefault()
    try {
      const created = await createAzienda({ ...newAzienda, created_by: user.id })
      setAziende([...aziende, created])
      setShowModal(false)
      setNewAzienda({
        ragione_sociale: '', partita_iva: '', codice_fiscale: '',
        indirizzo_sede: '', cap_sede: '', comune_sede: '', provincia_sede: '',
        telefono: '', email: '', datore_lavoro_nome: '', datore_lavoro_cognome: ''
      })
    } catch (error) {
      console.error('Error creating azienda:', error)
      alert('Errore nella creazione dell\'azienda. Verifica che la P.IVA non esista già.')
    }
  }

  const filteredAziende = aziende.filter(a => 
    a.ragione_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.partita_iva.includes(searchTerm)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aziende</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Nuova Azienda</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca per ragione sociale o P.IVA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ragione Sociale</th>
                <th>P.IVA</th>
                <th>Sede</th>
                <th>Datore di Lavoro</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {filteredAziende.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                    Nessuna azienda trovata
                  </td>
                </tr>
              ) : (
                filteredAziende.map((azienda) => (
                  <tr key={azienda.id}>
                    <td className="font-medium">{azienda.ragione_sociale}</td>
                    <td>{azienda.partita_iva}</td>
                    <td>{azienda.comune_sede} ({azienda.provincia_sede})</td>
                    <td>{azienda.datore_lavoro_nome} {azienda.datore_lavoro_cognome}</td>
                    <td>{azienda.telefono || '-'}</td>
                    <td>{azienda.email || '-'}</td>
                    <td>
                      <span className={`badge ${
                        azienda.stato_attivita === 'attiva' ? 'badge-success' :
                        azienda.stato_attivita === 'sospesa' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {azienda.stato_attivita}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Nuova Azienda</h2>
            </div>
            <form onSubmit={handleCreateAzienda} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ragione Sociale *</label>
                  <input type="text" className="input" required value={newAzienda.ragione_sociale} onChange={e => setNewAzienda({...newAzienda, ragione_sociale: e.target.value})} />
                </div>
                <div>
                  <label className="label">Partita IVA *</label>
                  <input type="text" className="input" required value={newAzienda.partita_iva} onChange={e => setNewAzienda({...newAzienda, partita_iva: e.target.value})} />
                </div>
                <div>
                  <label className="label">Codice Fiscale</label>
                  <input type="text" className="input" value={newAzienda.codice_fiscale} onChange={e => setNewAzienda({...newAzienda, codice_fiscale: e.target.value})} />
                </div>
                <div>
                  <label className="label">Telefono</label>
                  <input type="tel" className="input" value={newAzienda.telefono} onChange={e => setNewAzienda({...newAzienda, telefono: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Email</label>
                  <input type="email" className="input" value={newAzienda.email} onChange={e => setNewAzienda({...newAzienda, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Indirizzo Sede</label>
                  <input type="text" className="input" value={newAzienda.indirizzo_sede} onChange={e => setNewAzienda({...newAzienda, indirizzo_sede: e.target.value})} />
                </div>
                <div>
                  <label className="label">CAP</label>
                  <input type="text" className="input" value={newAzienda.cap_sede} onChange={e => setNewAzienda({...newAzienda, cap_sede: e.target.value})} />
                </div>
                <div>
                  <label className="label">Comune</label>
                  <input type="text" className="input" value={newAzienda.comune_sede} onChange={e => setNewAzienda({...newAzienda, comune_sede: e.target.value})} />
                </div>
                <div>
                  <label className="label">Provincia</label>
                  <input type="text" className="input" value={newAzienda.provincia_sede} onChange={e => setNewAzienda({...newAzienda, provincia_sede: e.target.value})} />
                </div>
                <div>
                  <label className="label">Nome Datore di Lavoro</label>
                  <input type="text" className="input" value={newAzienda.datore_lavoro_nome} onChange={e => setNewAzienda({...newAzienda, datore_lavoro_nome: e.target.value})} />
                </div>
                <div>
                  <label className="label">Cognome Datore di Lavoro</label>
                  <input type="text" className="input" value={newAzienda.datore_lavoro_cognome} onChange={e => setNewAzienda({...newAzienda, datore_lavoro_cognome: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
