import { runQuery, runMutation } from './database';
import { ProtocolloSanitario, ProtocolloMansione, ProtocolloRischio } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllProtocolli(): Promise<ProtocolloSanitario[]> {
  return await runQuery<ProtocolloSanitario>('SELECT * FROM protocolli_sanitari WHERE is_active = 1 ORDER BY nome');
}

export async function getProtocolloById(id: string): Promise<ProtocolloSanitario | null> {
  const results = await runQuery<ProtocolloSanitario>('SELECT * FROM protocolli_sanitari WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

export async function createProtocollo(protocollo: Partial<ProtocolloSanitario>): Promise<ProtocolloSanitario> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO protocolli_sanitari (id, nome, descrizione, tipologia, periodicita_mesi, eta_minima, eta_massima, richiede_spirometria, richiede_audiometria, richiede_ecg, richiede_radiografia, richiede_ematologici, richiede_urinocoltura, richiede_tossicologico, criteri_inidoneita, limitazioni_possibili, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, protocollo.nome, protocollo.descrizione, protocollo.tipologia, protocollo.periodicita_mesi, protocollo.eta_minima, protocolo.eta_massima, protocollo.richiede_spirometria ? 1 : 0, protocollo.richiede_audiometria ? 1 : 0, protocollo.richiede_ecg ? 1 : 0, protocollo.richiede_radiografia ? 1 : 0, protocollo.richiede_ematologici ? 1 : 0, protocollo.richiede_urinocoltura ? 1 : 0, protocollo.richiede_tossicologico ? 1 : 0, protocollo.criteri_inidoneita, protocollo.limitazioni_possibili, protocollo.created_by]
  );
  return (await getProtocolloById(id))!;
}

export async function updateProtocollo(id: string, updates: Partial<ProtocolloSanitario>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  const fieldMap: Record<string, string> = {
    nome: 'nome', descrizione: 'descrizione', tipologia: 'tipologia',
    periodicita_mesi: 'periodicita_mesi', eta_minima: 'eta_minima', eta_massima: 'eta_massima',
    criteri_inidoneita: 'criteri_inidoneita', limitazioni_possibili: 'limitazioni_possibili'
  };
  
  Object.entries(fieldMap).forEach(([key, col]) => {
    if (updates[key as keyof ProtocolloSanitario] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(updates[key as keyof ProtocolloSanitario]);
    }
  });
  
  const boolFields: (keyof ProtocolloSanitario)[] = ['richiede_spirometria', 'richiede_audiometria', 'richiede_ecg', 'richiede_radiografia', 'richiede_ematologici', 'richiede_urinocoltura', 'richiede_tossicologico'];
  boolFields.forEach(field => {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field] ? 1 : 0);
    }
  });
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await runMutation(`UPDATE protocolli_sanitari SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteProtocollo(id: string): Promise<void> {
  await runMutation('UPDATE protocolli_sanitari SET is_active = 0 WHERE id = ?', [id]);
}

export async function getProtocolliPerMansione(mansioneId: string): Promise<ProtocolloSanitario[]> {
  return await runQuery<ProtocolloSanitario>(
    `SELECT p.* FROM protocolli_sanitari p
     INNER JOIN protocolli_mansioni pm ON p.id = pm.protocollo_id
     WHERE pm.mansione_id = ? AND p.is_active = 1`,
    [mansioneId]
  );
}

export async function associaProtocolloMansione(protocolloId: string, mansioneId: string, periodicitaPersonalizzata?: number, note?: string): Promise<void> {
  const id = uuidv4();
  await runMutation(
    'INSERT OR REPLACE INTO protocolli_mansioni (id, protocollo_id, mansione_id, periodicita_personalizzata_mesi, note_specifiche) VALUES (?, ?, ?, ?, ?)',
    [id, protocolloId, mansioneId, periodicitaPersonalizzata, note]
  );
}

export async function getProtocolliMansioni(): Promise<ProtocolloMansione[]> {
  return await runQuery<ProtocolloMansione>('SELECT * FROM protocolli_mansioni');
}
