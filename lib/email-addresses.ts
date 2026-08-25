import { cleanMailString } from './email-encoding.ts';

export type MailRecipient={name:string;address:string;type:'to'|'cc'|'bcc'};

export function normalizeRecipients(value:unknown):MailRecipient[]{
 let raw=value;
 if(typeof raw==='string')try{raw=JSON.parse(raw)}catch{return[]}
 if(!Array.isArray(raw))return[];
 const result:MailRecipient[]=[];
 for(const entry of raw){
  if(!entry||typeof entry!=='object')continue;
  const item=entry as Record<string,unknown>,nested=item.emailAddress&&typeof item.emailAddress==='object'?item.emailAddress as Record<string,unknown>:{},name=cleanMailString(nested.name||item.name),address=cleanMailString(nested.address||item.address||item.smtpAddress||item.email),kind=String(item.type||item.recipType||'to').toLowerCase(),type:MailRecipient['type']=kind==='cc'?'cc':kind==='bcc'?'bcc':'to';
  if(!name&&!address)continue;
  if(!result.some(existing=>existing.type===type&&existing.address.toLowerCase()===address.toLowerCase()&&existing.name===name))result.push({name,address,type});
 }
 return result;
}

export function recipientLabel(recipient:MailRecipient){return recipient.name&&recipient.address?`${recipient.name} <${recipient.address}>`:recipient.name||recipient.address}
