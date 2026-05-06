import { useState, useEffect } from 'react'
import { User, Visita, Lavoratore, Azienda } from '@/types'
import { getAllVisite, createVisita } from '@/services/visiteService'
import { getAllLavoratori } from '@/services/lavoratoriService'
import { getAllAziende } from '@/services/aziendeService'
import { Plus, Calendar } from 'lucide-react'

interface VisiteListPageProps { user: User }

export default function VisiteListPage({ user }: VisiteListPageProps) {
  const [visite, setVisite] = useState<Visita[]>([])
  const [lavoratori, setLavoratori] = useState<Lavoratore[]>([])
  const [aziende, setAziende] = useState<Azienda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newVisita, setNewVisita] = useState<Partial<Visita>>({ tipologia: 'periodica', esito: 'in_corso', medico_id: user.id })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [v, l, a] = await Promise.all([getAllVisite(), getAllLavoratori(), getAllAziende()])
      setVisite(v); setLavoratori(l); setAziende(a)
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newVisita.lavoratore_id) return
    const lav = lavoratori.find(l => l.id === newVisita.lavoratore_id)
    try {
      const created = await createVisita({ ...newVisita, azienda_id: lav?.azienda_id, medico_id: user.id })
      setVisite([created, ...visite]); setShowModal(false)
      setNewVisita({ tipologia: 'periodica', esito: 'in_corso', medico_id: user.id })
    } catch (err) { alert('Errore creazione visita') }
  }

  const esitoColors: Record<string, string> = { idoneo: 'badge-success', idoneo_con_limitazioni: 'badge-warning', inidoneo_temporaneo: 'badge-danger', inidoneo_permanente: 'badge-danger', rinviato: 'badge-info', in_corso: 'badge-info' }

  return (
    <div>
      <div className="flex justify-between mb-6"><h1 className="text-2xl font-bold">Visite Mediche</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} />Nuova Visita</button></div>
      {isLoading ? <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
        <div className="table-container"><table className="table"><thead><tr><th>Data</th><th>Lavoratore</th><th>Azienda</th><th>Tipologia</th><th>Esito</th><th>Prossima</th></tr></thead><tbody>
          {visite.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500"><Calendar size={48} className="mx-auto mb-2 opacity-50" />Nessuna visita registrata</td></tr> :
            visite.map(v => { const lav = lavoratori.find(l => l.id === v.lavoratore_id); const az = aziende.find(a => a.id === v.azienda_id)
              return <tr key={v.id}><td>{new Date(v.data_visita).toLocaleDateString('it-IT')}</td><td>{lav ? `${lav.cognome} ${lav.nome}` : '?'}</td><td>{az?.ragione_sociale || '?'}</td><td className="capitalize">{v.tipologia}</td>
                <td><span className={`badge ${esitoColors[v.esito] || 'badge-info'}`}>{v.esito.replace('_', ' ')}</span></td><td>{v.prossima_visita ? new Date(v.prossima_visita).toLocaleDateString('it-IT') : '-'}</td></tr> })}
        </tbody></table></div>)}
      {showModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4">Nuova Visita</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="label">Lavoratore</label><select className="input" required value={newVisita.lavoratore_id || ''} onChange={e => setNewVisita({...newVisita, lavoratore_id: e.target.value})}><option value="">Seleziona...</option>{lavoratori.map(l => <option key={l.id} value={l.id}>{l.cognome} {l.nome}</option>)}</select></div>
          <div><label className="label">Tipologia</label><select className="input" value={newVisita.tipologia} onChange={e => setNewVisita({...newVisita, tipologia: e.target.value as any})}><option value="preventiva">Preventiva</option><option value="periodica">Periodica</option><option value="rientro">Rientro</option><option value="straordinaria">Straordinaria</option></select></div>
          <div><label className="label">Data Visita</label><input type="date" className="input" required value={newVisita.data_visita || ''} onChange={e => setNewVisita({...newVisita, data_visita: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annulla</button><button type="submit" className="btn-primary">Salva</button></div>
        </form>
      </div></div>}
    </div>
  )
}
