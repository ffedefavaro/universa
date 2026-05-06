import jsPDF from 'jspdf';
import { Visita, Lavoratore, Azienda, User, VisitaAnamnesi, EsameStrumentale } from '@/types';

export async function generateCartellaSanitariaPDF(
  visita: Visita,
  lavoratore: Lavoratore,
  azienda: Azienda,
  medico: User,
  anamnesi?: VisitaAnamnesi | null,
  esami?: EsameStrumentale[]
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CARTELLA SANITARIA E DI RISCHIO', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('(D.Lgs. 81/2008 e s.m.i.)', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Line separator
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Dati lavoratore
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DATI DEL LAVORATORE', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const datiLavoratore = [
    ['Cognome:', lavoratore.cognome],
    ['Nome:', lavoratore.nome],
    ['Codice Fiscale:', lavoratore.codice_fiscale],
    ['Data di nascita:', formatDate(lavoratore.data_nascita)],
    ['Luogo di nascita:', `${lavoratore.luogo_nascita || ''} (${lavoratore.provincia_nascita || ''})`],
    ['Sesso:', lavoratore.sesso],
    ['Residenza:', `${lavoratore.indirizzo || ''}, ${lavoratore.cap || ''} ${lavoratore.comune_residenza || ''} (${lavoratore.provincia_residenza || ''})`],
    ['Telefono:', lavoratore.telefono || ''],
    ['Email:', lavoratore.email || '']
  ];
  
  datiLavoratore.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 45, y);
    y += 5;
  });
  
  y += 3;

  // Dati azienda
  doc.setFont('helvetica', 'bold');
  doc.text('DATI AZIENDALI', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  const datiAzienda = [
    ['Ragione sociale:', azienda.ragione_sociale],
    ['Partita IVA:', azienda.partita_iva],
    ['Sede:', `${azienda.indirizzo_sede || ''}, ${azienda.cap_sede || ''} ${azienda.comune_sede || ''} (${azienda.provincia_sede || ''})`],
    ['Datore di lavoro:', `${azienda.datore_lavoro_nome || ''} ${azienda.datore_lavoro_cognome || ''}`]
  ];
  
  datiAzienda.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 45, y);
    y += 5;
  });
  
  y += 5;

  // Line separator
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Dati visita
  doc.setFont('helvetica', 'bold');
  doc.text('DATI VISITA MEDICA', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  const tipologiaMap: Record<string, string> = {
    'preventiva': 'Visita Preventiva',
    'periodica': 'Visita Periodica',
    'rientro': 'Visita al Rientro',
    'straordinaria': 'Visita Straordinaria',
    'pre-pensionamento': 'Visita Pre-Pensionamento',
    'volontaria': 'Visita Volontaria',
    'su_richiesta': 'Visita su Richiesta'
  };
  
  const esitoMap: Record<string, string> = {
    'idoneo': 'IDONEO',
    'idoneo_con_limitazioni': 'IDONEO CON LIMITAZIONI',
    'inidoneo_temporaneo': 'INIDONEO TEMPORANEO',
    'inidoneo_permanente': 'INIDONEO PERMANENTE',
    'rinviato': 'RINVIATO',
    'in_corso': 'IN CORSO'
  };
  
  const datiVisita = [
    ['Tipologia:', tipologiaMap[visita.tipologia] || visita.tipologia],
    ['Data visita:', formatDate(visita.data_visita)],
    ['Esito:', esitoMap[visita.esito] || visita.esito]
  ];
  
  if (visita.prossima_visita) {
    datiVisita.push(['Prossima visita:', formatDate(visita.prossima_visita)]);
  }
  
  datiVisita.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 45, y);
    y += 5;
  });
  
  y += 5;

  // Anamnesi
  if (anamnesi) {
    doc.setFont('helvetica', 'bold');
    doc.text('ANAMNESI', 15, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    const anamnesiFields: [string, string | undefined][] = [
      ['Patologie cardiovascolari:', anamnesi.patologie_cardiovascolari],
      ['Patologie respiratorie:', anamnesi.patologie_respiratorie],
      ['Patologie metaboliche:', anamnesi.patologie_metaboliche],
      ['Patologie neurologiche:', anamnesi.patologie_neurologiche],
      ['Patologie psichiatriche:', anamnesi.patologie_psichiatriche],
      ['Patologie apparato digerente:', anamnesi.patologie_apparato_digerente],
      ['Farmaci assunti:', anamnesi.farmaci_assunti],
      ['Allergie:', anamnesi.allergie_note],
      ['Abitudini viziante:', anamnesi.abitudini_viziante]
    ];
    
    anamnesiFields.forEach(([label, value]) => {
      if (value && value.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, y);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(value, pageWidth - 50);
        doc.text(splitText, 45, y);
        y += 5 * splitText.length;
      }
    });
    
    y += 5;
  }

  // Esami strumentali
  if (esami && esami.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('ESAMI STRUMENTALI', 15, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    esami.forEach((esame) => {
      doc.text(`- ${esame.tipo_esame} (${formatDate(esame.data_esecuzione)}): ${esame.risultato || 'N/D'}`, 20, y);
      y += 5;
    });
    
    y += 5;
  }

  // Giudizio
  doc.setFont('helvetica', 'bold');
  doc.text('GIUDIZIO SANITARIO', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  
  if (visita.limitazioni) {
    doc.text('Limitazioni:', 15, y);
    y += 5;
    const splitLimitazioni = doc.splitTextToSize(visita.limitazioni, pageWidth - 30);
    doc.text(splitLimitazioni, 20, y);
    y += 5 * splitLimitazioni.length;
  }
  
  if (visita.prescrizioni) {
    doc.text('Prescrizioni:', 15, y);
    y += 5;
    const splitPrescrizioni = doc.splitTextToSize(visita.prescrizioni, pageWidth - 30);
    doc.text(splitPrescrizioni, 20, y);
    y += 5 * splitPrescrizioni.length;
  }
  
  if (visita.provvedimenti) {
    doc.text('Provvedimenti:', 15, y);
    y += 5;
    const splitProvvedimenti = doc.splitTextToSize(visita.provvedimenti, pageWidth - 30);
    doc.text(splitProvvedimenti, 20, y);
    y += 5 * splitProvvedimenti.length;
  }
  
  if (visita.giudizio_sintetico) {
    y += 3;
    const splitGiudizio = doc.splitTextToSize(visita.giudizio_sintetico, pageWidth - 30);
    doc.text(splitGiudizio, 15, y);
    y += 5 * splitGiudizio.length;
  }
  
  y += 10;

  // Firma medico
  const signatureY = pageHeight - 40;
  doc.line(pageWidth - 70, signatureY, pageWidth - 15, signatureY);
  y = signatureY + 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Il Medico Competente', pageWidth - 42, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${medico.nome} ${medico.cognome}`, pageWidth - 42, y, { align: 'center' });
  
  if (medico.numero_iscrizione_albo) {
    y += 4;
    doc.setFontSize(8);
    doc.text(`Iscrizione Albo: ${medico.numero_iscrizione_albo}${medico.provincia_albo ? ` (${medico.provincia_albo})` : ''}`, pageWidth - 42, y, { align: 'center' });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  const footerY = pageHeight - 10;
  doc.text(`Documento generato il ${new Date().toLocaleDateString('it-IT')}`, pageWidth / 2, footerY, { align: 'center' });
  
  return doc.output('blob');
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
}

export async function downloadPDF(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
