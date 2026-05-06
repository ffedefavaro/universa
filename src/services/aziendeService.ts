import { runQuery, runMutation } from './database';
import { Azienda, UnitaProduttiva, Mansione, Rischio } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllAziende(): Promise<Azienda[]> {
  return await runQuery<Azienda>('SELECT * FROM aziende ORDER BY ragione_sociale');
}

export async function getAziendaById(id: string): Promise<Azienda | null> {
  const aziende = await runQuery<Azienda>('SELECT * FROM aziende WHERE id = ?', [id]);
  return aziende.length > 0 ? aziende[0] : null;
}

export async function createAzienda(azienda: Partial<Azienda>): Promise<Azienda> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO aziende (id, ragione_sociale, partita_iva, codice_fiscale, indirizzo_sede, cap_sede, comune_sede, provincia_sede, telefono, email, pec, datore_lavoro_nome, datore_lavoro_cognome, codice_ateco, descrizione_ateco, stato_attivita, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attiva', ?)`,
    [id, azienda.ragione_sociale, azienda.partita_iva, azienda.codice_fiscale, azienda.indirizzo_sede, azienda.cap_sede, azienda.comune_sede, azienda.provincia_sede, azienda.telefono, azienda.email, azienda.pec, azienda.datore_lavoro_nome, azienda.datore_lavoro_cognome, azienda.codice_ateco, azienda.descrizione_ateco, azienda.created_by]
  );
  return (await getAziendaById(id))!;
}

export async function updateAzienda(id: string, updates: Partial<Azienda>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof Azienda] !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(updates[key as keyof Azienda]);
    }
  });
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await runMutation(`UPDATE aziende SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteAzienda(id: string): Promise<void> {
  await runMutation('DELETE FROM aziende WHERE id = ?', [id]);
}

export async function getAllUnitaProduttive(aziendaId?: string): Promise<UnitaProduttiva[]> {
  if (aziendaId) {
    return await runQuery<UnitaProduttiva>('SELECT * FROM unita_produttive WHERE azienda_id = ? ORDER BY denominazione', [aziendaId]);
  }
  return await runQuery<UnitaProduttiva>('SELECT * FROM unita_produttive ORDER BY denominazione');
}

export async function createUnitaProduttiva(up: Partial<UnitaProduttiva>): Promise<UnitaProduttiva> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO unita_produttive (id, azienda_id, denominazione, indirizzo, cap, comune, provincia, dirigente_preposto, rlso_nome, rlso_cognome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, up.azienda_id, up.denominazione, up.indirizzo, up.cap, up.comune, up.provincia, up.dirigente_preposto, up.rlso_nome, up.rlso_cognome]
  );
  const results = await runQuery<UnitaProduttiva>('SELECT * FROM unita_produttive WHERE id = ?', [id]);
  return results[0];
}

export async function getAllRischi(): Promise<Rischio[]> {
  return await runQuery<Rischio>('SELECT * FROM rischi WHERE is_active = 1 ORDER BY categoria, descrizione');
}

export async function getAllMansioni(aziendaId?: string): Promise<Mansione[]> {
  if (aziendaId) {
    return await runQuery<Mansione>('SELECT * FROM mansioni WHERE azienda_id = ? ORDER BY denominazione', [aziendaId]);
  }
  return await runQuery<Mansione>('SELECT * FROM mansioni ORDER BY denominazione');
}

export async function createMansione(mansione: Partial<Mansione>): Promise<Mansione> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO mansioni (id, azienda_id, denominazione, descrizione, reparto, rischi_note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, mansione.azienda_id, mansione.denominazione, mansione.descrizione, mansione.reparto, mansione.rischi_note]
  );
  const results = await runQuery<Mansione>('SELECT * FROM mansioni WHERE id = ?', [id]);
  return results[0];
}

export async function updateMansione(id: string, updates: Partial<Mansione>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof Mansione] !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(updates[key as keyof Mansione]);
    }
  });
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await runMutation(`UPDATE mansioni SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteMansione(id: string): Promise<void> {
  await runMutation('DELETE FROM mansioni WHERE id = ?', [id]);
}
