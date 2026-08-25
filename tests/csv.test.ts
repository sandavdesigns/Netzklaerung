import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeCsvWithInfo,parseCsv,repairMojibake } from '../lib/csv.ts';

const csv='Firmenname;Straße;Ort\r\nMüller & Söhne GmbH;Königsstraße 7;Düsseldorf';

test('decodes UTF-8 including BOM',()=>{const result=decodeCsvWithInfo(Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),Buffer.from(csv)]));assert.equal(result.encoding,'UTF-8');assert.equal(result.text,csv);assert.equal(parseCsv(result.text).rows[0][0],'Müller & Söhne GmbH')});
test('decodes Windows-1252',()=>{const result=decodeCsvWithInfo(Buffer.from(csv,'latin1'));assert.equal(result.encoding,'Windows-1252');assert.equal(result.text,csv)});
test('decodes UTF-16 LE',()=>{const result=decodeCsvWithInfo(Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(csv,'utf16le')]));assert.equal(result.encoding,'UTF-16 LE');assert.equal(result.text,csv)});
test('decodes UTF-16 BE',()=>{const little=Buffer.from(csv,'utf16le');for(let i=0;i<little.length;i+=2){const first=little[i];little[i]=little[i+1];little[i+1]=first}const result=decodeCsvWithInfo(Buffer.concat([Buffer.from([0xfe,0xff]),little]));assert.equal(result.encoding,'UTF-16 BE');assert.equal(result.text,csv)});
test('repairs common double-encoded umlauts',()=>{const damaged='Firmenname;StraÃŸe;Ort\r\nMÃ¼ller & SÃ¶hne GmbH;KÃ¶nigsstraÃŸe 7;DÃ¼sseldorf',result=decodeCsvWithInfo(Buffer.from(damaged));assert.equal(result.encoding,'UTF-8');assert.equal(result.repaired,true);assert.equal(result.text,csv)});
test('repairs cells even if another cell contains Unicode outside Windows-1252',()=>{assert.equal(repairMojibake('MÃ¼ller GmbH;Łódź'),'Müller GmbH;Łódź')});
