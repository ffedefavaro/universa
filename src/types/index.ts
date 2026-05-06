// Tipi principali per MediLavoro

export type UserRole = 'medico' | 'segreteria' | 'admin';
export type VisitaTipologia = 'preventiva' | 'periodica' | 'rientro' | 'straordinaria' | 'pre-pensionamento' | 'volontaria' | 'su_richiesta';
export type VisitaEsito = 'idoneo' | 'idoneo_con_limitazioni' | 'inidoneo_temporaneo' | 'inidoneo_permanente' | 'rinviato' | 'in_corso';
export type LivelloEsposizione = 'basso' | 'medio' | 'alto' | 'non_esposto';
export type Sesso = 'M' | 'F';
export type StatoAttivita = 'attiva' | 'sospesa' | 'cessata';
export type ProtocolloTipologia = 'preventivo' | 'periodico' | 'rientro' | 'straordinario';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  nome: string;
  cognome: string;
  ruolo: UserRole;
  numero_iscrizione_albo?: string;
  provincia_albo?: string;
  specializzazione?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface Azienda {
  id: string;
  ragione_sociale: string;
  partita_iva: string;
  codice_fiscale?: string;
  indirizzo_sede?: string;
  cap_sede?: string;
  comune_sede?: string;
  provincia_sede?: string;
  indirizzo_up?: string;
  cap_up?: string;
  comune_up?: string;
  provincia_up?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  datore_lavoro_nome?: string;
  datore_lavoro_cognome?: string;
  datore_lavoro_cf?: string;
  codice_ateco?: string;
  descrizione_ateco?: string;
  num_lavoratori_totali: number;
  num_lavoratori_esposti_rischio: number;
  medico_id?: string;
  stato_attivita: StatoAttivita;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UnitaProduttiva {
  id: string;
  azienda_id: string;
  denominazione: string;
  indirizzo?: string;
  cap?: string;
  comune?: string;
  provincia?: string;
  dirigente_preposto?: string;
  rlso_nome?: string;
  rlso_cognome?: string;
  created_at: string;
}

export interface Rischio {
  id: string;
  codice: string;
  descrizione: string;
  categoria: string;
  note?: string;
  riferimento_normativo?: string;
  is_active: boolean;
}

export interface Mansione {
  id: string;
  azienda_id: string;
  denominazione: string;
  descrizione?: string;
  reparto?: string;
  rischi_note?: string;
  created_at: string;
  updated_at: string;
}

export interface MansioneRischio {
  id: string;
  mansione_id: string;
  rischio_id: string;
  livello_esposizione?: LivelloEsposizione;
}

export interface ProtocolloSanitario {
  id: string;
  nome: string;
  descrizione?: string;
  tipologia: ProtocolloTipologia;
  periodicita_mesi: number;
  eta_minima?: number;
  eta_massima?: number;
  richiede_spirometria: boolean;
  richiede_audiometria: boolean;
  richiede_ecg: boolean;
  richiede_radiografia: boolean;
  richiede_ematologici: boolean;
  richiede_urinocoltura: boolean;
  richiede_tossicologico: boolean;
  criteri_inidoneita?: string;
  limitazioni_possibili?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProtocolloMansione {
  id: string;
  protocollo_id: string;
  mansione_id: string;
  periodicita_personalizzata_mesi?: number;
  note_specifiche?: string;
}

export interface ProtocolloRischio {
  id: string;
  protocollo_id: string;
  rischio_id: string;
}

export interface Lavoratore {
  id: string;
  azienda_id: string;
  codice_fiscale: string;
  cognome: string;
  nome: string;
  data_nascita: string;
  luogo_nascita?: string;
  provincia_nascita?: string;
  sesso: Sesso;
  cittadinanza: string;
  indirizzo?: string;
  cap?: string;
  comune_residenza?: string;
  provincia_residenza?: string;
  telefono?: string;
  email?: string;
  data_assunzione?: string;
  data_cessazione?: string;
  tipo_contratto?: string;
  part_time: boolean;
  mansione_id?: string;
  lavoratore_videoterminale: boolean;
  lavoratore_notturno: boolean;
  lavoratore_straniero: boolean;
  note_anamnestiche?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Visita {
  id: string;
  lavoratore_id: string;
  azienda_id: string;
  medico_id: string;
  tipologia: VisitaTipologia;
  data_visita: string;
  ora_visita?: string;
  durata_minuti?: number;
  esito: VisitaEsito;
  prossima_visita?: string;
  motivazione_rinvio?: string;
  giorni_rinvio?: number;
  limitazioni?: string;
  prescrizioni?: string;
  provvedimenti?: string;
  giudizio_sintetico?: string;
  firmato: boolean;
  data_firma?: string;
  firma_digitale_hash?: string;
  created_at: string;
  updated_at: string;
  locked: boolean;
}

export interface VisitaAnamnesi {
  id: string;
  visita_id: string;
  patologie_cardiovascolari?: string;
  patologie_respiratorie?: string;
  patologie_metaboliche?: string;
  patologie_neurologiche?: string;
  patologie_psichiatriche?: string;
  patologie_apparato_digerente?: string;
  patologie_renal?: string;
  farmaci_assunti?: string;
  allergie_note?: string;
  anamnesi_familiare?: string;
  abitudini_viziante?: string;
  created_at: string;
  updated_at: string;
}

export interface EsameStrumentale {
  id: string;
  visita_id: string;
  tipo_esame: string;
  data_esecuzione: string;
  risultato?: string;
  referto_path?: string;
  esito_valutazione?: string;
  created_at: string;
}

export interface DashboardStats {
  totaleAziende: number;
  totaleLavoratori: number;
  visiteOggi: number;
  visiteSettimana: number;
  scadenzeProssime7Giorni: number;
  scadenzeProssime30Giorni: number;
  inidoneiTemporanei: number;
  inidoneiPermanenti: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
