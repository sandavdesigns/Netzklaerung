import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { APP_VERSION } from '@/lib/version';
export async function GET(){db.prepare('SELECT 1').get();return NextResponse.json({status:'ok',version:APP_VERSION,time:new Date().toISOString()})}
