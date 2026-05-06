import { useState, useEffect } from 'react'
import { User, Lavoratore, Azienda } from '@/types'
import { getAllLavoratori, createLavoratore } from '@/services/lavoratoriService'
import { getAllAziende } from '@/services/aziendeService'
import { Plus, Search, Users } from 'lucide-react'

interface LavoratoriListPageProps { user: User }

export default function LavoratoriListPage({ user }: LavoratoriListPageProps) {
  const [lavoratori, setLavoratori] = useState<Lavoratore[]>([])
  const [aziende, setAziende] = useState<Azienda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAzienda, setSelectedAzienda] = useState('')
  const [newLavoratore, setNewLavoratore] = useState<Partial<Lavoratore>>({
    codice_fiscale: '', cognome: '', nome: '', data_nascita: '', sesso: 'M',
    cittadinanza: 'Italiana', azienda_id: '', part_time: false,
    lavoratore_videoterminale: false, lavoratore_notturno: false, lavoratore_straniero: false
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [lavData, azData] = await Promise.all([getAllLavoratori(), getAllAziende()])
      setLavoratori(lavData); setAziende(azData)
    } catch (error) { console.error(error) }
    finally { setIsLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const created = await createLavoratore({ ...newLavoratore, created_by: user.id })
      setLavoratori([...lavoratori, created]); setShowModal(false)
      setNewLavoratore({ codice_fiscale: '', cognome: '', nome: '', data_nascita: '', sesso: 'M', cittadinanza: 'Italiana', azienda_id: '', part_time: false, lavoratore_videoterminale: false, lavoratore_notturno: false, lavoratore_straniero: false })
    } catch (err) { alert('Errore: CF potrebbe esistere già') }
  }

  const filtered = lavoratori.filter(l => {
    const matchesSearch = l.cognome.toLowerCase().includes(searchTerm.toLowerCase()) || l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || l.codice_fiscale.includes(searchTerm)
    const matchesAzienda = !selectedAzienda || l.azienda_id === selectedAzienda
    return matchesSearch && matchesAzienda
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lavoratori</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} /><span>Nuovo Lavoratore</span></button>
      </div>
      <div className="card mb-6 space-y-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Cerca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10" /></div>
        <select value={selectedAzienda} onChange={e => setSelectedAzienda(e.target.value)} className="input"><option value="">Tutte le aziende</option>{aziende.map(a => <option key={a.id} value={a.id}>{a.ragione_sociale}</option>)}</select>
      </div>
      {isLoading ? <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
        <div className="table-container"><table className="table"><thead><tr><th>Cognome</th><th>Nome</th><th>C.F.</th><th>Data Nascita</th><th>Azienda</th><th>VDT</th><th>Notturno</th></tr></thead><tbody>
          {filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8"><Users size={48} className="mx-auto opacity-50" /><p className="text-gray-500">Nessun lavoratore</p></td></tr> :
            filtered.map(l => { const az = aziende.find(a => a.id === l.azienda_id)
              return <tr key={l.id}><td className="font-medium">{l.cognome}</td><td>{l.nome}</td><td>{l.codice_fiscale}</td><td>{new Date(l.data_nascita).toLocaleDateString('it-IT')}</td><td>{az?.ragione_sociale || '-'}</td>
                <td>{l.lavoratore_videoterminale ? '✓' : '-'}</td><td>{l.lavoratore_notturno ? '✓' : '-'}</td></tr> })}
        </tbody></table></div>)}
      {showModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b"><h2 className="text-xl font-semibold">Nuovo Lavoratore</h2></div>
        <form onSubmit={handleCreate} className="p-6 space-y-4"><div className="grid grid-cols-2 gap-4">
          <div><label className="label">Codice Fiscale *</label><input type="text" className="input" required value={newLavoratore.codice_fiscale} onChange={e => setNewLavoratore({...newLavoratore, codice_fiscale: e.target.value.toUpperCase()})} /></div>
          <div><label className="label">Cognome *</label><input type="text" className="input" required value={newLavoratore.cognome} onChange={e => setNewLavoratore({...newLavoratore, cognome: e.target.value})} /></div>
          <div><label className="label">Nome *</label><input type="text" className="input" required value={newLavoratore.nome} onChange={e => setNewLavoratore({...newLavoratore, nome: e.target.value})} /></div>
          <div><label className="label">Data Nascita *</label><input type="date" className="input" required value={newLavoratore.data_nascita} onChange={e => setNewLavoratore({...newLavoratore, data_nascita: e.target.value})} /></div>
          <div><label className="label">Sesso</label><select className="input" value={newLavoratore.sesso} onChange={e => setNewLavoratore({...newLavoratore, sesso: e.target.value as 'M'|'F'})}><option value="M">Maschio</option><option value="F">Femmina</option></select></div>
          <div><label className="label">Azienda *</label><select className="input" required value={newLavoratore.azienda_id} onChange={e => setNewLavoratore({...newLavoratore, azienda_id: e.target.value})}><option value="">Seleziona...</option>{aziende.map(a => <option key={a.id} value={a.id}>{a.ragione_sociale}</option>)}</select></div>
          <div className="col-span-2 flex gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={newLavoratore.lavoratore_videoterminale} onChange={e => setNewLavoratore({...newLavoratore, lavoratore_videoterminale: e.target.checked})} />VDT</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={newLavoratore.lavoratore_notturno} onChange={e => setNewLavoratore({...newLavoratore, lavoratore_notturno: e.target.checked})} />Notturno</label></div>
        </div><div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annulla</button><button type="submit" className="btn-primary">Salva</button></div></form>
      </div></div>}
    </div>
  )
}
