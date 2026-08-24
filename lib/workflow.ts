import { randomUUID } from 'node:crypto';
import { db } from './db';

const common=['MaLo / MeLo und Zählernummer abgeglichen','Zuständigkeit und Marktrolle geprüft','Nachrichtenreferenzen und Prüfidentifikator geprüft','Ergebnis fachlich verifiziert'];
const presets:Record<string,string[]>={
 'Messwerte / Energiemenge':['Messzeitraum und Einheit geprüft','Messwertstatus / Ersatzwertbildung geprüft','MSCONS mit führendem System verglichen'],
 'Stammdaten / Zuordnung':['Aktuellen und vorherigen Stammdatenstand verglichen','Zuordnung von MaLo, MeLo und Geräten geprüft','UTILMD-Antworten und Ablehnungsgründe geprüft'],
 'Lieferbeginn / -ende':['Gewünschtes und bestätigtes Zuordnungsdatum geprüft','Vor- und Nachlieferant berücksichtigt','Antwort- und Ablehnungsnachrichten geprüft'],
 'Gerätewechsel / Ausbau':['Alte und neue Gerätenummer geprüft','Ein-/Ausbauzeitpunkt und Stände geprüft','MSB-Zuständigkeit zum Ereigniszeitpunkt geprüft'],
 'Bilanzierung / Mehr-Mindermenge':['Bilanzierungszeitraum und Bilanzkreis geprüft','Mengenherkunft und Korrekturstand dokumentiert','Auswirkungen auf Abrechnung bewertet'],
 'Marktkommunikation / Frist':['Nachrichtenversion und Gültigkeitszeitraum geprüft','CONTRL / APERAK und Antwortkette geprüft','Fristquelle dokumentiert']
};

export function checklistFor(category:string){return[...(presets[category]||[]),...common]}
export function seedChecklist(caseId:string,category:string){const now=new Date().toISOString(),insert=db.prepare(`INSERT INTO case_checks(id,case_id,label,status,required,note,source,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`);checklistFor(category).forEach((label,index)=>insert.run(randomUUID(),caseId,label,'open',index<2?1:0,'','preset',index,now,now))}
export function closingIssues(caseId:string,item:Record<string,unknown>){const issues:string[]=[];if(!String(item.rootCause||'').trim())issues.push('Ursache fehlt');if(!String(item.targetResolution||'').trim())issues.push('Lösung / Ergebnis fehlt');if(!String(item.handoverSummary||'').trim())issues.push('Übergabezusammenfassung fehlt');const openRequired=(db.prepare(`SELECT COUNT(*) count FROM case_checks WHERE case_id=? AND required=1 AND status='open'`).get(caseId)as{count:number}).count;if(openRequired)issues.push(`${openRequired} Pflichtprüfung(en) offen`);return issues}
export function logActivity(caseId:string,kind:string,text:string,author:string){db.prepare(`INSERT INTO activities(case_id,kind,text,author,created_at) VALUES(?,?,?,?,?)`).run(caseId,kind,text,author,new Date().toISOString())}
