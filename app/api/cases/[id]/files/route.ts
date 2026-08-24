import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextRequest,NextResponse } from 'next/server';
import { caseFileDir,db,safeFilename } from '@/lib/db';
import { importEmailBuffer } from '@/lib/import-email';

export const runtime='nodejs';
const allowed=new Set(['application/pdf','text/plain','text/csv','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const{id}=await params;
 const files=db.prepare(`SELECT id,filename,content_type contentType,size,kind,created_at createdAt FROM case_files WHERE case_id=? ORDER BY created_at DESC`).all(id);
 const emails=db.prepare(`SELECT id,subject filename,'message/rfc822' contentType,0 size,'email' kind,received_at createdAt,sender_name senderName,sender_address senderAddress FROM emails WHERE case_id=? ORDER BY received_at DESC`).all(id);
 return NextResponse.json({files,emails});
}
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const{id}=await params,exists=db.prepare('SELECT 1 FROM cases WHERE id=?').get(id);
  if(!exists)return NextResponse.json({error:'Vorgang nicht gefunden.'},{status:404});
  const form=await request.formData(),file=form.get('file');
  if(!(file instanceof File))return NextResponse.json({error:'Keine Datei übergeben.'},{status:400});
  if(file.size>40*1024*1024)return NextResponse.json({error:'Die Datei ist größer als 40 MB.'},{status:413});
  const buffer=Buffer.from(await file.arrayBuffer()),now=new Date().toISOString();
  if(/\.(msg|eml)$/i.test(file.name)){
   const result=await importEmailBuffer(buffer,file.name,id);
   db.prepare(`INSERT INTO activities(case_id,kind,text,author,created_at) VALUES(?,?,?,?,?)`).run(id,'email',`E-Mail abgelegt: ${file.name}`,'Anna Keller',now);
   return NextResponse.json({kind:'email',...result},{status:201});
  }
  if(!file.type.startsWith('image/')&&!allowed.has(file.type))return NextResponse.json({error:'Erlaubt sind Bilder, PDF-, Text-, CSV- und Excel-Dateien sowie .msg/.eml.'},{status:415});
  const fileId=randomUUID(),filename=safeFilename(file.name),storagePath=path.join(caseFileDir(id),`${fileId}-${filename}`),kind=file.type.startsWith('image/')?'screenshot':'file';
  fs.writeFileSync(storagePath,buffer);
  db.transaction(()=>{db.prepare(`INSERT INTO case_files(id,case_id,filename,content_type,size,storage_path,kind,created_at) VALUES(?,?,?,?,?,?,?,?)`).run(fileId,id,filename,file.type||'application/octet-stream',file.size,storagePath,kind,now);db.prepare(`INSERT INTO activities(case_id,kind,text,author,created_at) VALUES(?,?,?,?,?)`).run(id,'file',`${kind==='screenshot'?'Screenshot':'Datei'} abgelegt: ${filename}`,'Anna Keller',now)})();
  return NextResponse.json({id:fileId,kind},{status:201});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Ablage fehlgeschlagen.'},{status:400})}
}
