import test from 'node:test';
import assert from 'node:assert/strict';
import iconv from 'iconv-lite';
import { normalizeRecipients,recipientLabel } from '../lib/email-addresses.ts';
import { isInlineAttachment } from '../lib/email-attachments.ts';
import { cleanMailString,decodeMsgHtml } from '../lib/email-encoding.ts';

test('repairs damaged German characters in stored mail text',()=>{assert.equal(cleanMailString('ZÃ¤hlerstÃ¤nde f\u0081r DÃ¼sseldorf'),'Zählerstände für Düsseldorf')});
test('decodes Windows-1252 HTML from MSG properties',()=>{const html='<p>Grüße für Köln – Zählerstand</p>';assert.equal(decodeMsgHtml(iconv.encode(html,'windows1252'),1252),html)});
test('normalizes Outlook, EML and MSG recipients',()=>{const recipients=normalizeRecipients([{emailAddress:{name:'MÃ¼ller Netz',address:'mueller@example.de'},type:'to'},{name:'Kundin Köln',address:'koeln@example.de',type:'cc'},{name:'Blind',smtpAddress:'blind@example.de',recipType:'bcc'}]);assert.deepEqual(recipients,[{name:'Müller Netz',address:'mueller@example.de',type:'to'},{name:'Kundin Köln',address:'koeln@example.de',type:'cc'},{name:'Blind',address:'blind@example.de',type:'bcc'}]);assert.equal(recipientLabel(recipients[0]),'Müller Netz <mueller@example.de>')});
test('never hides PDF attachments even if Outlook assigns a content ID',()=>{assert.equal(isInlineAttachment({contentType:'application/pdf',declaredInline:true,contentId:'pdf-1',html:'<a href="cid:pdf-1">PDF</a>'}),false)});
test('only hides images that are declared or referenced inline',()=>{assert.equal(isInlineAttachment({contentType:'image/png',contentId:'logo-1',html:'<img src="cid:logo-1">'}),true);assert.equal(isInlineAttachment({contentType:'image/png',contentId:'photo-1',html:'<p>Keine Referenz</p>'}),false)});
