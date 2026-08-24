import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(){const count=(db.prepare('SELECT COUNT(*) count FROM users').get()as{count:number}).count;return NextResponse.json({setupRequired:count===0})}
