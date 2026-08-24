import { NextResponse } from 'next/server';
import { outlookStatus,syncOutlook } from '@/lib/outlook';
export async function GET(){return NextResponse.json(outlookStatus())}
export async function POST(){try{return NextResponse.json(await syncOutlook())}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Synchronisierung fehlgeschlagen.'},{status:500})}}
