import { NextRequest,NextResponse } from 'next/server';

export function proxy(request:NextRequest){
 if(request.nextUrl.pathname==='/api/health')return NextResponse.next();
 const username=process.env.APP_USERNAME,password=process.env.APP_PASSWORD;
 if(!username||!password)return NextResponse.next();
 const header=request.headers.get('authorization');
 if(header?.startsWith('Basic ')){
  try{const decoded=atob(header.slice(6)),separator=decoded.indexOf(':'),user=decoded.slice(0,separator),pass=decoded.slice(separator+1);if(user===username&&pass===password)return NextResponse.next()}catch{}
 }
 return new NextResponse('Anmeldung erforderlich.',{status:401,headers:{'WWW-Authenticate':'Basic realm="NetzKlaerung", charset="UTF-8"','Cache-Control':'no-store'}});
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg|og.png).*)']};
