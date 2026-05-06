import { runQuery, runMutation } from './database';
import { Visita, VisitaAnamnesi, EsameStrumentale } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllVisite(aziendaId?: string, lavoratoreId?: string): Promise<Visita[]> {
  let sql = 'SELECT * FROM visite';
  const params: any[] = [];
  const conditions: string[] = [];
  
  if (aziendaId) { conditions.push('azienda_id = ?'); params.push(aziendaId); }
  if (lavoratoreId) { conditions.push('lavoratore_id = ?'); params.push(lavoratoreId); }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY data_visita DESC';
  
  return await runQuery<Visita>(sql, params);
}

export async function getVisitaById(id: string): Promise<Visita | null> {
  const results = await runQuery<Visita>('SELECT * FROM visite WHERE id = ?', [id]);
  return results.length > 0 ? results[0] : null;
}

export async function createVisita(visita: Partial<Visita>): Promise<Visita> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO visite (id, lavoratore_id, azienda_id, medico_id, tipologia, data_visita, ora_visita, esito, prossima_visita, limitazioni, prescrizioni, provvedimenti, giudizio_sintetico)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, visita.lavoratore_id, visita.azienda_id, visita.medico_id, visita.tipologia, visita.data_visita, visita.ora_visita, visita.esito, visita.prossima_visita, visita.limitazioni, visita.prescrizioni, visita.provvedimenti, visita.giudizio_sintetico]
  );
  return (await getVisitaById(id))!;
}

export async function updateVisita(id: string, updates: Partial<Visita>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  const fieldMap: Record<string, string> = {
    esito: 'esito', prossima_visita: 'prossima_visita', motivazione_rinvio: 'motivazione_rinvio',
    giorni_rinvio: 'giorni_rinvio', limitazioni: 'limitazioni', prescrizioni: 'prescrizioni',
    provvedimenti: 'provvedimenti', giudizio_sintetico: 'giudizio_sintetico',
    firmato: 'firmato', data_firma: 'data_firma', firma_digitale_hash: 'firma_digitale_hash',
    locked: 'locked', durata_minuti: 'durata_minuti'
  };
  
  Object.entries(fieldMap).forEach(([key, col]) => {
    if (updates[key as keyof Visita] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(updates[key as keyof Visita]);
    }
  });
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await runMutation(`UPDATE visite SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function getVisitaAnamnesi(visitaId: string): Promise<VisitaAnamnesi | null> {
  const results = await runQuery<VisitaAnamnesi>('SELECT * FROM visite_anamnesi WHERE visita_id = ?', [visitaId]);
  return results.length > 0 ? results[0] : null;
}

export async function saveVisitaAnamnesi(anamnesi: Partial<VisitaAnamnesi>): Promise<VisitaAnamnesi> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO visite_anamnesi (id, visita_id, patologie_cardiovascolari, patologie_respiratorie, patologie_metaboliche, patologie_neurologiche, patologie_psichiatriche, patologie_apparato_digerente, patologie_renal, farmaci_assunti, allergie_note, anamnesi_familiare, abitudini_viziante)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, anamnesi.visita_id, anamnesi.patologie_cardiovascolari, anamnesi.patologie_respiratorie, anamnesi.patologie_metaboliche, anamnesi.patologie_neurologiche, anamnesi.patologie_psichiatriche, anamnesi.patologie_apparato_digerente, anamnesi.patologie_renal, anamnesi.farmaci_assunti, anamnesi.allergie_note, anamnesi.anamnesi_familiare, anamnesi.abitudini_viziante]
  );
  const results = await runQuery<VisitaAnamnesi>('SELECT * FROM visite_anamnesi WHERE id = ?', [id]);
  return results[0];
}

export async function updateVisitaAnamnesi(visitaId: string, updates: Partial<VisitaAnamnesi>): Promise<void> {
  const existing = await getVisitaAnamnesi(visitaId);
  if (existing) {
    const fields: string[] = [];
    const values: any[] = [];
    
    const fieldMap: Record<string, string> = {
      patologie_cardiovascolari: 'patologie_cardiovascolari', patologie_respiratorie: 'patologie_respiratorie',
      patologie_metaboliche: 'patologie_metaboliche', patologie_neurologiche: 'patologie_neurologiche',
      patologie_psichiatriche: 'patologie_psichiatriche', patologie_apparato_digerente: 'patologie_apparato_digerente',
      patologie_renal: 'patologie_renal', farmaci_assunti: 'farmaci_assunti',
      allergie_note: 'allergie_note', anamnesi_familiare: 'anamnesi_familiare',
      abitudini_viziante: 'abitudini_viziante'
    };
    
    Object.entries(fieldMap).forEach(([key, col]) => {
      if (updates[key as keyof VisitaAnamnesi] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(updates[key as keyof VisitaAnamnesi]);
      }
    });
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(existing.id);
      await runMutation(`UPDATE visite_anamnesi SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  } else {
    await saveVisitaAnamnesi({ ...updates, visita_id: visitaId });
  }
}

export async function getEsamiStrumentali(visitaId: string): Promise<EsameStrumentale[]> {
  return await runQuery<EsameStrumentale>('SELECT * FROM esami_strumentali WHERE visita_id = ? ORDER BY tipo_esame', [visitaId]);
}

export async function addEsameStrumentale(esame: Partial<EsameStrumentale>): Promise<EsameStrumentale> {
  const id = uuidv4();
  await runMutation(
    `INSERT INTO esami_strumentali (id, visita_id, tipo_esame, data_esecuzione, risultato, esito_valutazione)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, esame.visita_id, esame.tipo_esame, esame.data_esecuzione, esame.risultato, esame.esito_valutazione]
  );
  const results = await runQuery<EsameStrumentale>('SELECT * FROM esami_strumentali WHERE id = ?', [id]);
  return results[0];
}

export async function getVisiteScadute(): Promise<Visita[]> {
  const today = new Date().toISOString().split('T')[0];
  return await runQuery<Visita>(
    "SELECT * FROM visite WHERE prossima_visita IS NOT NULL AND prossima_visita <= ? AND esito IN ('idoneo', 'idoneo_con_limitazioni') ORDER BY prossima_visita",
    [today]
  );
}

export async function getVisiteProssime(giorni: number): Promise<Visita[]> {
  const today = new Date();
  const future = new Date(today.getTime() + giorni * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split('T')[0];
  const futureStr = future.toISOString().split('T')[0];
  
  return await runQuery<Visita>(
    "SELECT * FROM visite WHERE prossima_visita IS NOT NULL AND prossima_visita >= ? AND prossima_visita <= ? AND esito IN ('idoneo', 'idoneo_con_limitazioni') ORDER BY prossima_visita",
    [todayStr, futureStr]
  );
}
