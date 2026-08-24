import { NextRequest,NextResponse } from 'next/server';
import { readSession } from '@/lib/auth';
export function proxy(request:NextRequest){const path=request.nextUrl.pathname;if(path==='/api/health'||path.startsWith('/api/auth/'))return NextResponse.next();if(!path.startsWith('/api/'))return NextResponse.next();return readSession(request.cookies.get('nk_session')?.value)?NextResponse.next():NextResponse.json({error:'Anmeldung erforderlich.'},{status:401})}
export const config={matcher:['/api/:path*']};
