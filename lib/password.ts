import { randomBytes,scryptSync,timingSafeEqual } from 'node:crypto';
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex'),hash=scryptSync(password,salt,64).toString('hex');return`scrypt:${salt}:${hash}`}
export function verifyPassword(password:string,stored:string){try{const[,salt,expected]=stored.split(':'),actual=scryptSync(password,salt,64),target=Buffer.from(expected,'hex');return target.length===actual.length&&timingSafeEqual(target,actual)}catch{return false}}
