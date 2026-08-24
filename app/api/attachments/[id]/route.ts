import fs from 'node:fs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params,row=db.prepare('SELECT filename,content_type contentType,storage_path storagePath FROM attachments WHERE id=?').get(id)as{filename:string;contentType:string;storagePath:string}|undefined;if(!row||!fs.existsSync(row.storagePath))return NextResponse.json({error:'Anlage nicht gefunden.'},{status:404});return new NextResponse(fs.readFileSync(row.storagePath),{headers:{'content-type':row.contentType||'application/octet-stream','content-disposition':`attachment; filename*=UTF-8''${encodeURIComponent(row.filename)}`,'x-content-type-options':'nosniff'}})}
