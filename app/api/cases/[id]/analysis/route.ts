import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Summary={locations?:{art?:string;id?:string}[];values?:{art?:string;wert?:string;einheit?:string}[];references?:{art?:string;wert?:string}[];statuses?:string[]};
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const{id}=await params,item=db.prepare('SELECT location,meter_number meterNumber,process_reference processReference FROM cases WHERE id=?').get(id)as{location:string;meterNumber:string;processReference:string}|undefined;
 if(!item)return NextResponse.json({error:'Vorgang nicht gefunden.'},{status:404});
 const documents=db.prepare(`SELECT id,filename,message_type messageType,version,sender,receiver,reference,parsed_json parsedJson,created_at createdAt FROM edifact_documents WHERE case_id=? ORDER BY created_at`).all(id)as Record<string,string>[],identifiers=new Set<string>(),values:Record<string,{document:string;type:string;value:string;unit:string}[]>= {},warnings:string[]=[];
 const timeline=documents.map(document=>{const parsed=JSON.parse(document.parsedJson)as{messages?:{summary?:Summary}[]};for(const summary of(parsed.messages||[]).map(message=>message.summary||{})){for(const location of summary.locations||[])if(location.id)identifiers.add(location.id);for(const reference of summary.references||[])if(reference.wert)identifiers.add(reference.wert);for(const value of summary.values||[]){const key=value.art||'Messwert / Menge';(values[key]??=[]).push({document:document.filename,type:document.messageType,value:value.wert||'',unit:value.einheit||''})}}return{id:document.id,filename:document.filename,messageType:document.messageType,version:document.version,sender:document.sender,receiver:document.receiver,reference:document.reference,createdAt:document.createdAt}});
 if(documents.length===0)warnings.push('Noch keine EDIFACT-Nachricht am Vorgang.');
 if(item.location&&!identifiers.has(item.location)&&documents.length)warnings.push('Die im Vorgang hinterlegte Lokation wurde in den zugeordneten EDIFACT-Zusammenfassungen nicht erkannt.');
 for(const[group,entries]of Object.entries(values)){const normalized=new Set(entries.map(entry=>`${entry.value}|${entry.unit}`));if(normalized.size>1)warnings.push(`${group}: unterschiedliche Werte oder Einheiten in der Nachrichtenkette erkannt.`)}
 const types=new Set(documents.map(document=>document.messageType));if(documents.length&&![...types].some(type=>type==='CONTRL'||type==='APERAK'))warnings.push('Keine CONTRL- oder APERAK-Nachricht in der zugeordneten Kette. Das ist ein Prüfhinweis, kein sicherer Prozessfehler.');
 return NextResponse.json({timeline,identifiers:[...identifiers],valueGroups:values,warnings,notice:'Automatische Hinweise ersetzen keine Prüfung anhand des zum Bezugszeitpunkt gültigen Anwendungshandbuchs.'})
}
