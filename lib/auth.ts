import { createHmac,timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
export type SessionUser={id:string;username:string;displayName:string;role:'admin'|'user';exp:number};
const secret=()=>process.env.AUTH_SECRET||process.env.APP_PASSWORD||'netzklaerung-local-secret-change-in-production';
const sign=(value:string)=>createHmac('sha256',secret()).update(value).digest('base64url');
export function createSession(user:Omit<SessionUser,'exp'>){const payload=Buffer.from(JSON.stringify({...user,exp:Date.now()+8*60*60*1000})).toString('base64url');return`${payload}.${sign(payload)}`}
export function readSession(value?:string|null):SessionUser|null{if(!value)return null;try{const[payload,signature]=value.split('.'),expected=sign(payload),a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;const user=JSON.parse(Buffer.from(payload,'base64url').toString())as SessionUser;return user.exp>Date.now()?user:null}catch{return null}}
export function requestUser(request:NextRequest){return readSession(request.cookies.get('nk_session')?.value)}
