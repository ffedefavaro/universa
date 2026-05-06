import initSqlJs, { Database } from 'sql.js';
import * as idb from 'idb';

const DB_NAME = 'medilavoro-db';
const DB_VERSION = 1;

let dbInstance: Database | null = null;
let idbInstance: IDBDatabase | null = null;

export const SQL_CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    ruolo TEXT NOT NULL CHECK (ruolo IN ('medico', 'segreteria', 'admin')),
    numero_iscrizione_albo TEXT,
    provincia_albo TEXT,
    specializzazione TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aziende (
    id TEXT PRIMARY KEY,
    ragione_sociale TEXT NOT NULL,
    partita_iva TEXT UNIQUE NOT NULL,
    codice_fiscale TEXT,
    indirizzo_sede TEXT,
    cap_sede TEXT,
    comune_sede TEXT,
    provincia_sede TEXT,
    indirizzo_up TEXT,
    cap_up TEXT,
    comune_up TEXT,
    provincia_up TEXT,
    telefono TEXT,
    email TEXT,
    pec TEXT,
    datore_lavoro_nome TEXT,
    datore_lavoro_cognome TEXT,
    datore_lavoro_cf TEXT,
    codice_ateco TEXT,
    descrizione_ateco TEXT,
    num_lavoratori_totali INTEGER DEFAULT 0,
    num_lavoratori_esposti_rischio INTEGER DEFAULT 0,
    medico_id TEXT REFERENCES users(id),
    stato_attivita TEXT DEFAULT 'attiva' CHECK (stato_attivita IN ('attiva', 'sospesa', 'cessata')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS unita_produttive (
    id TEXT PRIMARY KEY,
    azienda_id TEXT NOT NULL REFERENCES aziende(id) ON DELETE CASCADE,
    denominazione TEXT NOT NULL,
    indirizzo TEXT,
    cap TEXT,
    comune TEXT,
    provincia TEXT,
    dirigente_preposto TEXT,
    rlso_nome TEXT,
    rlso_cognome TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rischi (
    id TEXT PRIMARY KEY,
    codice TEXT UNIQUE NOT NULL,
    descrizione TEXT NOT NULL,
    categoria TEXT NOT NULL,
    note TEXT,
    riferimento_normativo TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS mansioni (
    id TEXT PRIMARY KEY,
    azienda_id TEXT NOT NULL REFERENCES aziende(id) ON DELETE CASCADE,
    denominazione TEXT NOT NULL,
    descrizione TEXT,
    reparto TEXT,
    rischi_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mansioni_rischi (
    id TEXT PRIMARY KEY,
    mansione_id TEXT NOT NULL REFERENCES mansioni(id) ON DELETE CASCADE,
    rischio_id TEXT NOT NULL REFERENCES rischi(id) ON DELETE CASCADE,
    livello_esposizione TEXT CHECK (livello_esposizione IN ('basso', 'medio', 'alto', 'non_esposto')),
    UNIQUE(mansione_id, rischio_id)
);

CREATE TABLE IF NOT EXISTS protocolli_sanitari (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descrizione TEXT,
    tipologia TEXT NOT NULL CHECK (tipologia IN ('preventivo', 'periodico', 'rientro', 'straordinario')),
    periodicita_mesi INTEGER DEFAULT 12,
    eta_minima INTEGER,
    eta_massima INTEGER,
    richiede_spirometria BOOLEAN DEFAULT FALSE,
    richiede_audiometria BOOLEAN DEFAULT FALSE,
    richiede_ecg BOOLEAN DEFAULT FALSE,
    richiede_radiografia BOOLEAN DEFAULT FALSE,
    richiede_ematologici BOOLEAN DEFAULT TRUE,
    richiede_urinocoltura BOOLEAN DEFAULT FALSE,
    richiede_tossicologico BOOLEAN DEFAULT FALSE,
    criteri_inidoneita TEXT,
    limitazioni_possibili TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS protocolli_mansioni (
    id TEXT PRIMARY KEY,
    protocollo_id TEXT NOT NULL REFERENCES protocolli_sanitari(id) ON DELETE CASCADE,
    mansione_id TEXT NOT NULL REFERENCES mansioni(id) ON DELETE CASCADE,
    periodicita_personalizzata_mesi INTEGER,
    note_specifiche TEXT,
    UNIQUE(protocollo_id, mansione_id)
);

CREATE TABLE IF NOT EXISTS protocolli_rischi (
    id TEXT PRIMARY KEY,
    protocollo_id TEXT NOT NULL REFERENCES protocolli_sanitari(id) ON DELETE CASCADE,
    rischio_id TEXT NOT NULL REFERENCES rischi(id) ON DELETE CASCADE,
    UNIQUE(protocollo_id, rischio_id)
);

CREATE TABLE IF NOT EXISTS lavoratori (
    id TEXT PRIMARY KEY,
    azienda_id TEXT NOT NULL REFERENCES aziende(id) ON DELETE CASCADE,
    codice_fiscale TEXT UNIQUE NOT NULL,
    cognome TEXT NOT NULL,
    nome TEXT NOT NULL,
    data_nascita DATE NOT NULL,
    luogo_nascita TEXT,
    provincia_nascita TEXT,
    sesso TEXT CHECK (sesso IN ('M', 'F')),
    cittadinanza TEXT DEFAULT 'Italiana',
    indirizzo TEXT,
    cap TEXT,
    comune_residenza TEXT,
    provincia_residenza TEXT,
    telefono TEXT,
    email TEXT,
    data_assunzione DATE,
    data_cessazione DATE,
    tipo_contratto TEXT,
    part_time BOOLEAN DEFAULT FALSE,
    mansione_id TEXT REFERENCES mansioni(id),
    lavoratore_videoterminale BOOLEAN DEFAULT FALSE,
    lavoratore_notturno BOOLEAN DEFAULT FALSE,
    lavoratore_straniero BOOLEAN DEFAULT FALSE,
    note_anamnestiche TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS visite (
    id TEXT PRIMARY KEY,
    lavoratore_id TEXT NOT NULL REFERENCES lavoratori(id) ON DELETE CASCADE,
    azienda_id TEXT NOT NULL REFERENCES aziende(id) ON DELETE CASCADE,
    medico_id TEXT NOT NULL REFERENCES users(id),
    tipologia TEXT NOT NULL CHECK (tipologia IN ('preventiva', 'periodica', 'rientro', 'straordinaria', 'pre-pensionamento', 'volontaria', 'su_richiesta')),
    data_visita DATE NOT NULL,
    ora_visita TIME,
    durata_minuti INTEGER,
    esito TEXT CHECK (esito IN ('idoneo', 'idoneo_con_limitazioni', 'inidoneo_temporaneo', 'inidoneo_permanente', 'rinviato', 'in_corso')),
    prossima_visita DATE,
    motivazione_rinvio TEXT,
    giorni_rinvio INTEGER,
    limitazioni TEXT,
    prescrizioni TEXT,
    provvedimenti TEXT,
    giudizio_sintetico TEXT,
    firmato BOOLEAN DEFAULT FALSE,
    data_firma DATETIME,
    firma_digitale_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS visite_anamnesi (
    id TEXT PRIMARY KEY,
    visita_id TEXT UNIQUE NOT NULL REFERENCES visite(id) ON DELETE CASCADE,
    patologie_cardiovascolari TEXT,
    patologie_respiratorie TEXT,
    patologie_metaboliche TEXT,
    patologie_neurologiche TEXT,
    patologie_psichiatriche TEXT,
    patologie_apparato_digerente TEXT,
    patologie_renal TEXT,
    farmaci_assunti TEXT,
    allergie_note TEXT,
    anamnesi_familiare TEXT,
    abitudini_viziante TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS esami_strumentali (
    id TEXT PRIMARY KEY,
    visita_id TEXT NOT NULL REFERENCES visite(id) ON DELETE CASCADE,
    tipo_esame TEXT NOT NULL,
    data_esecuzione DATE NOT NULL,
    risultato TEXT,
    referto_path TEXT,
    esito_valutazione TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default risks
INSERT OR IGNORE INTO rischi (id, codice, descrizione, categoria, riferimento_normativo) VALUES 
('r1', 'CHIMICO', 'Agenti chimici pericolosi', 'Chimico', 'D.Lgs 81/08 Titolo IX'),
('r2', 'RUMORE', 'Esposizione al rumore', 'Fisico', 'D.Lgs 81/08 Titolo VIII Capo II'),
('r3', 'VIBRAZIONI', 'Esposizione a vibrazioni', 'Fisico', 'D.Lgs 81/08 Titolo VIII Capo III'),
('r4', 'VDT', 'Videoterminali', 'Organizzativo', 'D.Lgs 81/08 Titolo VII'),
('r5', 'MOVIMENTAZIONE', 'Movimentazione manuale carichi', 'Ergonomico', 'D.Lgs 81/08 Titolo VI'),
('r6', 'MICROCLIMA', 'Microclima sfavorevole', 'Fisico', 'D.Lgs 81/08 Titolo VIII'),
('r7', 'RADIAZIONI', 'Radiazioni ionizzanti e non ionizzanti', 'Fisico', 'D.Lgs 81/08 Titolo VIII Capo V'),
('r8', 'CANCEROGENI', 'Agenti cancerogeni e mutageni', 'Chimico', 'D.Lgs 81/08 Titolo IX Capo II'),
('r9', 'BIOLOGICO', 'Agenti biologici', 'Biologico', 'D.Lgs 81/08 Titolo X'),
('r10', 'STRESS', 'Stress lavoro-correlato', 'Organizzativo', 'Accordo Europeo 2004'),
('r11', 'NOTTURNO', 'Lavoro notturno', 'Organizzativo', 'D.Lgs 66/2003'),
('r12', 'AMIANTO', 'Esposizione ad amianto', 'Chimico', 'D.Lgs 81/08 Titolo IX Capo III');
`;

async function initIndexedDB(): Promise<IDBDatabase> {
  if (idbInstance) return idbInstance;
  
  idbInstance = await idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sql-dump')) {
        db.createObjectStore('sql-dump', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  
  return idbInstance;
}

export async function initDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  
  const SQL = await initSqlJs();
  dbInstance = new SQL.Database();
  
  try {
    dbInstance.run(SQL_CREATE_TABLES);
    
    const dumped = dbInstance.export();
    const blob = new Blob([dumped], { type: 'application/x-sqlite3' });
    const arrayBuffer = await blob.arrayBuffer();
    
    const indexedDB = await initIndexedDB();
    await indexedDB.put('sql-dump', { id: 'current', data: arrayBuffer, timestamp: Date.now() });
    
    createDefaultAdmin();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
  
  return dbInstance;
}

export async function loadDatabaseFromIndexedDB(): Promise<Database | null> {
  try {
    const indexedDB = await initIndexedDB();
    const dump = await indexedDB.get('sql-dump', 'current');
    
    if (dump && dump.data) {
      const SQL = await initSqlJs();
      dbInstance = new SQL.Database(new Uint8Array(dump.data));
      return dbInstance;
    }
  } catch (error) {
    console.error('Error loading database from IndexedDB:', error);
  }
  
  return null;
}

export async function saveDatabaseToIndexedDB(): Promise<void> {
  if (!dbInstance) return;
  
  try {
    const dumped = dbInstance.export();
    const indexedDB = await initIndexedDB();
    await indexedDB.put('sql-dump', { id: 'current', data: dumped.buffer, timestamp: Date.now() });
  } catch (error) {
    console.error('Error saving database to IndexedDB:', error);
    throw error;
  }
}

export function getDatabase(): Database | null {
  return dbInstance;
}

export function createDefaultAdmin(): void {
  if (!dbInstance) return;
  
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  const adminId = uuidv4();
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  try {
    dbInstance.run(`
      INSERT OR IGNORE INTO users (id, email, password_hash, nome, cognome, ruolo, is_active)
      VALUES (?, ?, ?, 'Admin', 'User', 'admin', 1)
    `, [adminId, 'admin@medilavoro.it', hashedPassword]);
    
    saveDatabaseToIndexedDB();
    console.log('Default admin user created: admin@medilavoro.it / admin123');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

export async function runQuery<T>(sql: string, params?: any[]): Promise<T[]> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  
  try {
    const stmt = dbInstance.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    
    return results;
  } catch (error) {
    console.error('Query error:', error, sql);
    throw error;
  }
}

export async function runMutation(sql: string, params?: any[]): Promise<number> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  
  try {
    dbInstance.run(sql, params);
    await saveDatabaseToIndexedDB();
    return dbInstance.getRowsModified();
  } catch (error) {
    console.error('Mutation error:', error, sql);
    throw error;
  }
}

export async function getCurrentSession(): Promise<any | null> {
  try {
    const indexedDB = await initIndexedDB();
    const sessions = await indexedDB.getAll('sessions');
    const now = new Date().toISOString();
    
    for (const session of sessions) {
      if (session.expires_at > now) {
        return session;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function saveSession(session: any): Promise<void> {
  try {
    const indexedDB = await initIndexedDB();
    await indexedDB.put('sessions', session);
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const indexedDB = await initIndexedDB();
    const tx = indexedDB.transaction('sessions', 'readwrite');
    await tx.store.clear();
    await tx.done;
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
