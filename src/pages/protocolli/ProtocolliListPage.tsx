import { useState, useEffect } from 'react'
import { User, ProtocolloSanitario } from '@/types'
import { getAllProtocolli, createProtocollo } from '@/services/protocolliService'
import { Plus, FileText } from 'lucide-react'

interface ProtocolliListPageProps { user: User }

export default function ProtocolliListPage({ user }: ProtocolliListPageProps) {
  const [protocolli, setProtocolli] = useState<ProtocolloSanitario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProt, setNewProt] = useState<Partial<ProtocolloSanitario>>({ nome: '', tipologia: 'periodico', periodicita_mesi: 12, richiede_ematologici: true })

  useEffect(() => { loadProtocols() }, [])

  async function loadProtocols() {
    try { const data = await getAllProtocolli(); setProtocolli(data) }
    catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try { const created = await createProtocollo({ ...newProt, created_by: user.id }); setProtocolli([...protocolli, created]); setShowModal(false); setNewProt({ nome: '', tipologia: 'periodico', periodicita_mesi: 12 }) }
    catch (err) { alert('Errore') }
  }

  return (
    <div>
      <div className="flex justify-between mb-6"><h1 className="text-2xl font-bold">Protocolli Sanitari</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} />Nuovo Protocollo</button></div>
      {isLoading ? <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
        <div className="table-container"><table className="table"><thead><tr><th>Nome</th><th>Tipologia</th><th>Periodicità (mesi)</th><th>Esami Richiesti</th></tr></thead><tbody>
          {protocolli.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-gray-500"><FileText size={48} className="mx-auto mb-2 opacity-50" />Nessun protocollo</td></tr> :
            protocolli.map(p => <tr key={p.id}><td className="font-medium">{p.nome}</td><td className="capitalize">{p.tipologia}</td><td>{p.periodicita_mesi}</td><td>{[p.richiede_ematologici && 'Ematici', p.richiede_spirometria && 'Spirometria', p.richiede_audiometria && 'Audiometria', p.richiede_ecg && 'ECG'].filter(Boolean).join(', ') || '-'}</td></tr>)}
        </tbody></table></div>)}
      {showModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4">Nuovo Protocollo</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="label">Nome</label><input type="text" className="input" required value={newProt.nome} onChange={e => setNewProt({...newProt, nome: e.target.value})} /></div>
          <div><label className="label">Tipologia</label><select className="input" value={newProt.tipologia} onChange={e => setNewProt({...newProt, tipologia: e.target.value as any})}><option value="preventivo">Preventivo</option><option value="periodico">Periodico</option><option value="rientro">Rientro</option></select></div>
          <div><label className="label">Periodicità (mesi)</label><input type="number" className="input" value={newProt.periodicita_mesi} onChange={e => setNewProt({...newProt, periodicita_mesi: parseInt(e.target.value)})} /></div>
          <div className="flex gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={newProt.richiede_ematologici} onChange={e => setNewProt({...newProt, richiede_ematologici: e.target.checked})} />Ematici</label><label className="flex items-center gap-2"><input type="checkbox" checked={newProt.richiede_spirometria} onChange={e => setNewProt({...newProt, richiede_spirometria: e.target.checked})} />Spirometria</label></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annulla</button><button type="submit" className="btn-primary">Salva</button></div>
        </form>
      </div></div>}
    </div>
  )
}
