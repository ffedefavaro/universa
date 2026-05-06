import { runQuery, runMutation } from './database';
import { Lavoratore } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllLavoratori(aziendaId?: string): Promise<Lavoratore[]> {
  if (aziendaId) {
    return await runQuery<Lavoratore>('SELECT * FROM lavoratori WHERE azienda_id = ? ORDER BY cognome, nome', [aziendaId]);
  }
  return await runQuery<Lavoratore>('SELECT * FROM lavoratori ORDER BY cognome, nome');
}

export async function getLavoratoreById(id: string): Promise<Lavoratore | null> {
  const results = await runQuery<Lavoratore>('SELECT * FROM lavoratori WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

export async function getLavoratoreByCF(cf: string): Promise<Lavoratore | null> {
  const results = await runQuery<Lavoratore>('SELECT * FROM lavoratori WHERE codice_fiscale = ?', [cf]);
  return results.length > 0 ? results[0] : null;
}

export async function createLavoratore(lavoratore: Partial<Lavoratore>): Promise<Lavoratore> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO lavoratori (id, azienda_id, codice_fiscale, cognome, nome, data_nascita, luogo_nascita, provincia_nascita, sesso, cittadinanza, indirizzo, cap, comune_residenza, provincia_residenza, telefono, email, data_assunzione, tipo_contratto, part_time, mansione_id, lavoratore_videoterminale, lavoratore_notturno, lavoratore_straniero, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, lavoratore.azienda_id, lavoratore.codice_fiscale, lavoratore.cognome, lavoratore.nome, lavoratore.data_nascita, lavoratore.luogo_nascita, lavoratore.provincia_nascita, lavoratore.sesso, lavoratore.cittadinanza, lavoratore.indirizzo, lavoratore.cap, lavoratore.comune_residenza, lavoratore.provincia_residenza, lavoratore.telefono, lavoratore.email, lavoratore.data_assunzione, lavoratore.tipo_contratto, lavoratore.part_time ? 1 : 0, lavoratore.mansione_id, lavoratore.lavoratore_videoterminale ? 1 : 0, lavoratore.lavoratore_notturno ? 1 : 0, lavoratore.lavoratore_straniero ? 1 : 0, lavoratore.created_by]
  );
  return (await getLavoratoreById(id))!;
}

export async function updateLavoratore(id: string, updates: Partial<Lavoratore>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  const fieldMap: Record<string, string> = {
    cognome: 'cognome', nome: 'nome', data_nascita: 'data_nascita',
    luogo_nascita: 'luogo_nascita', provincia_nascita: 'provincia_nascita',
    sesso: 'sesso', cittadinanza: 'cittadinanza', indirizzo: 'indirizzo',
    cap: 'cap', comune_residenza: 'comune_residenza', provincia_residenza: 'provincia_residenza',
    telefono: 'telefono', email: 'email', data_assunzione: 'data_assunzione',
    data_cessazione: 'data_cessazione', tipo_contratto: 'tipo_contratto',
    mansione_id: 'mansione_id', note_anamnestiche: 'note_anamnestiche'
  };
  
  Object.entries(fieldMap).forEach(([key, col]) => {
    if (updates[key as keyof Lavoratore] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(updates[key as keyof Lavoratore]);
    }
  });
  
  if (updates.part_time !== undefined) { fields.push('part_time = ?'); values.push(updates.part_time ? 1 : 0); }
  if (updates.lavoratore_videoterminale !== undefined) { fields.push('lavoratore_videoterminale = ?'); values.push(updates.lavoratore_videoterminale ? 1 : 0); }
  if (updates.lavoratore_notturno !== undefined) { fields.push('lavoratore_notturno = ?'); values.push(updates.lavoratore_notturno ? 1 : 0); }
  if (updates.lavoratore_straniero !== undefined) { fields.push('lavoratore_straniero = ?'); values.push(updates.lavoratore_straniero ? 1 : 0); }
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await runMutation(`UPDATE lavoratori SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteLavoratore(id: string): Promise<void> {
  await runMutation('DELETE FROM lavoratori WHERE id = ?', [id]);
}

export async function searchLavoratori(query: string, aziendaId?: string): Promise<Lavoratore[]> {
  const searchTerm = `%${query}%`;
  if (aziendaId) {
    return await runQuery<Lavoratore>(
      'SELECT * FROM lavoratori WHERE azienda_id = ? AND (cognome LIKE ? OR nome LIKE ? OR codice_fiscale LIKE ?) ORDER BY cognome, nome',
      [aziendaId, searchTerm, searchTerm, searchTerm]
    );
  }
  return await runQuery<Lavoratore>(
    'SELECT * FROM lavoratori WHERE cognome LIKE ? OR nome LIKE ? OR codice_fiscale LIKE ? ORDER BY cognome, nome',
    [searchTerm, searchTerm, searchTerm]
  );
}
