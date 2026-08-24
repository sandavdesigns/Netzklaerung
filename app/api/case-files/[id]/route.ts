import fs from 'node:fs';
import { NextRequest,NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime='nodejs';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const{id}=await params,row=db.prepare(`SELECT filename,content_type contentType,storage_path storagePath FROM case_files WHERE id=?`).get(id)as{filename:string;contentType:string;storagePath:string}|undefined;
 if(!row||!fs.existsSync(row.storagePath))return NextResponse.json({error:'Datei nicht gefunden.'},{status:404});
 const inline=(row.contentType.startsWith('image/')||row.contentType==='application/pdf')&&!request.nextUrl.searchParams.has('download');
 return new NextResponse(fs.readFileSync(row.storagePath),{headers:{'content-type':row.contentType||'application/octet-stream','content-disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(row.filename)}`,'x-content-type-options':'nosniff','cache-control':'private, max-age=300'}});
}
