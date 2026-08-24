import { createHash,randomUUID } from 'node:crypto';
import MsgReader from '@kenjiuno/msgreader';
import { simpleParser } from 'mailparser';
import sanitizeHtml from 'sanitize-html';
import { db } from './db';
import { linkCase,saveAttachment } from './store-document';

const clean=(html:string)=>sanitizeHtml(html,{allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img','table','thead','tbody','tr','th','td']),allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','width','height'],a:['href','name','target']},allowedSchemes:['http','https','mailto'],allowedSchemesByTag:{img:['cid']}});
function mime(filename:string){const ext=filename.split('.').pop()?.toLowerCase();return({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',pdf:'application/pdf',txt:'text/plain',csv:'text/csv',xml:'application/xml',edi:'application/edifact'}as Record<string,string>)[ext||'']||'application/octet-stream'}
function insert(input:{subject:string;senderName:string;senderAddress:string;recipients:unknown[];receivedAt:string;bodyHtml:string;bodyText:string;caseId:string|null;source:string;attachmentCount:number;contentHash:string}){const existing=db.prepare('SELECT id,case_id caseId FROM emails WHERE content_hash=? LIMIT 1').get(input.contentHash)as{id:string;caseId:string|null}|undefined;if(existing){if(input.caseId&&!existing.caseId)db.prepare('UPDATE emails SET case_id=? WHERE id=?').run(input.caseId,existing.id);return{ id:existing.id,duplicate:true }}const id=randomUUID(),now=new Date().toISOString();db.prepare(`INSERT INTO emails(id,graph_id,internet_message_id,subject,sender_name,sender_address,recipients,received_at,body_html,body_text,has_attachments,case_id,source,created_at,content_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,null,'',input.subject,input.senderName,input.senderAddress,JSON.stringify(input.recipients),input.receivedAt,input.bodyHtml,input.bodyText,input.attachmentCount?1:0,input.caseId,input.source,now,input.contentHash);return{id,duplicate:false}}
export async function importEmailBuffer(buffer:Buffer,filename:string,forcedCaseId?:string){
 const contentHash=createHash('sha256').update(buffer).digest('hex');
 if(/\.msg$/i.test(filename)){
  const arrayBuffer=buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength)as ArrayBuffer,reader=new MsgReader(arrayBuffer),info=reader.getFileData();
  if(info.error)throw new Error(`MSG konnte nicht gelesen werden: ${info.error}`);
  const html=info.bodyHtml||(info.html?new TextDecoder().decode(info.html):''),text=info.body||sanitizeHtml(html,{allowedTags:[],allowedAttributes:{}}),caseId=forcedCaseId||linkCase(`${info.subject||''}\n${text}`),attachments=info.attachments||[],inserted=insert({subject:info.subject||filename,senderName:info.senderName||'',senderAddress:info.senderSmtpAddress||info.sentRepresentingSmtpAddress||info.senderEmail||'',recipients:info.recipients||[],receivedAt:new Date(info.messageDeliveryTime||info.clientSubmitTime||info.creationTime||Date.now()).toISOString(),bodyHtml:clean(html),bodyText:text,caseId,source:'msg-drop',attachmentCount:attachments.length,contentHash}),id=inserted.id;
  if(inserted.duplicate)return{id,attachments:0,caseId,duplicate:true};
  for(const item of attachments){const attachment=reader.getAttachment(item),attachmentName=attachment.fileName||item.fileName||'anlage.bin';saveAttachment({emailId:id,filename:attachmentName,contentType:mime(attachmentName),buffer:Buffer.from(attachment.content)})}
  return{id,attachments:attachments.length,caseId,duplicate:false};
 }
 if(!/\.eml$/i.test(filename))throw new Error('Unterstützt werden Outlook-Nachrichten als .msg oder .eml.');
 const parsed=await simpleParser(buffer),html=typeof parsed.html==='string'?clean(parsed.html):'',text=parsed.text||'',to=Array.isArray(parsed.to)?parsed.to.flatMap(item=>item.value):parsed.to?.value||[],caseId=forcedCaseId||linkCase(`${parsed.subject||''}\n${text}`),inserted=insert({subject:parsed.subject||filename,senderName:parsed.from?.value[0]?.name||'',senderAddress:parsed.from?.value[0]?.address||'',recipients:to,receivedAt:(parsed.date||new Date()).toISOString(),bodyHtml:html,bodyText:text,caseId,source:'eml-drop',attachmentCount:parsed.attachments.length,contentHash}),id=inserted.id;
 if(inserted.duplicate)return{id,attachments:0,caseId,duplicate:true};
 for(const attachment of parsed.attachments)saveAttachment({emailId:id,filename:attachment.filename||'anlage.bin',contentType:attachment.contentType,buffer:attachment.content});
 return{id,attachments:parsed.attachments.length,caseId,duplicate:false};
}
