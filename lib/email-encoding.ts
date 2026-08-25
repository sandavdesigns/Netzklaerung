import iconv from 'iconv-lite';
import { repairMojibake } from './csv.ts';

const codePages:Record<number,string>={65001:'utf8',1200:'utf16le',1201:'utf16be',1252:'windows1252',850:'cp850',28591:'latin1',20127:'ascii'};

export function cleanMailString(value:unknown){return repairMojibake(String(value||'')).replace(/^\uFEFF/,'')}

export function decodeMsgHtml(bytes:Uint8Array|undefined,codePage?:number){
 if(!bytes?.length)return'';
 const buffer=Buffer.from(bytes),header=buffer.subarray(0,Math.min(buffer.length,2048)).toString('latin1'),declared=header.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1],encoding=codePages[codePage||0]||(declared&&iconv.encodingExists(declared)?declared:'');
 if(encoding)return cleanMailString(iconv.decode(buffer,encoding));
 try{return cleanMailString(new TextDecoder('utf-8',{fatal:true}).decode(buffer))}catch{return cleanMailString(iconv.decode(buffer,'windows1252'))}
}
