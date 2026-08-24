import { NextRequest,NextResponse } from 'next/server';
import { importEmailBuffer } from '@/lib/import-email';

export const runtime='nodejs';
export async function POST(request:NextRequest){
 try{
  const form=await request.formData(),file=form.get('file'),caseId=String(form.get('caseId')||'').trim();
  if(!(file instanceof File))return NextResponse.json({error:'Keine Datei übergeben.'},{status:400});
  if(file.size>40*1024*1024)return NextResponse.json({error:'Die Nachricht ist größer als 40 MB.'},{status:413});
  const result=await importEmailBuffer(Buffer.from(await file.arrayBuffer()),file.name,caseId||undefined);
  return NextResponse.json(result,{status:201});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Import fehlgeschlagen.'},{status:400})}
}
