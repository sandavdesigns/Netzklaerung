export function isInlineAttachment(input:{contentType?:string;declaredInline?:boolean;contentId?:string;html?:string}){
 if(!String(input.contentType||'').toLowerCase().startsWith('image/'))return false;
 if(input.declaredInline)return true;
 const cid=String(input.contentId||'').replace(/^<|>$/g,'').trim();
 if(!cid)return false;
 return String(input.html||'').toLowerCase().includes(`cid:${cid.toLowerCase()}`);
}
