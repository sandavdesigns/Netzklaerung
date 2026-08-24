import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir=process.env.DATA_DIR||path.join(process.cwd(),'data');
fs.mkdirSync(dataDir,{recursive:true});
fs.mkdirSync(path.join(dataDir,'attachments'),{recursive:true});
const globalDb=globalThis as typeof globalThis&{__netzklaerungDb?:Database.Database};
export const db=globalDb.__netzklaerungDb??new Database(path.join(dataDir,'netzklaerung.sqlite'));
if(process.env.NODE_ENV!=='production')globalDb.__netzklaerungDb=db;
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.pragma('busy_timeout = 5000');
db.exec(`
CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY,title TEXT NOT NULL,category TEXT NOT NULL,partner TEXT NOT NULL,market TEXT NOT NULL,location TEXT NOT NULL,meter_number TEXT,owner TEXT NOT NULL,due_date TEXT NOT NULL,status TEXT NOT NULL,priority TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY AUTOINCREMENT,case_id TEXT NOT NULL,kind TEXT NOT NULL,text TEXT NOT NULL,author TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY,graph_id TEXT UNIQUE,internet_message_id TEXT,subject TEXT NOT NULL,sender_name TEXT,sender_address TEXT,recipients TEXT,received_at TEXT NOT NULL,body_html TEXT,body_text TEXT,has_attachments INTEGER NOT NULL DEFAULT 0,case_id TEXT,source TEXT NOT NULL DEFAULT 'outlook',created_at TEXT NOT NULL,FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY,email_id TEXT,filename TEXT NOT NULL,content_type TEXT,size INTEGER NOT NULL DEFAULT 0,storage_path TEXT NOT NULL,edifact_document_id TEXT,created_at TEXT NOT NULL,FOREIGN KEY(email_id) REFERENCES emails(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS case_files (id TEXT PRIMARY KEY,case_id TEXT NOT NULL,filename TEXT NOT NULL,content_type TEXT,size INTEGER NOT NULL DEFAULT 0,storage_path TEXT NOT NULL,kind TEXT NOT NULL DEFAULT 'file',created_at TEXT NOT NULL,FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS edifact_documents (id TEXT PRIMARY KEY,filename TEXT NOT NULL,message_type TEXT NOT NULL,version TEXT,sender TEXT,receiver TEXT,reference TEXT,raw_text TEXT NOT NULL,parsed_json TEXT NOT NULL,validation_json TEXT NOT NULL DEFAULT '[]',email_id TEXT,case_id TEXT,created_at TEXT NOT NULL,FOREIGN KEY(email_id) REFERENCES emails(id) ON DELETE SET NULL,FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_cases_status_due ON cases(status,due_date); CREATE INDEX IF NOT EXISTS idx_cases_partner ON cases(partner); CREATE INDEX IF NOT EXISTS idx_activities_case ON activities(case_id,created_at); CREATE INDEX IF NOT EXISTS idx_case_files_case ON case_files(case_id,created_at DESC); CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(received_at DESC); CREATE INDEX IF NOT EXISTS idx_edifact_type ON edifact_documents(message_type,created_at DESC);
`);
export function getState(key:string){return(db.prepare('SELECT value FROM app_state WHERE key=?').get(key)as{value:string}|undefined)?.value}
export function setState(key:string,value:string){db.prepare(`INSERT INTO app_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).run(key,value,new Date().toISOString())}
export function attachmentDir(emailId:string){const safe=emailId.replace(/[^a-zA-Z0-9_-]/g,'_'),dir=path.join(dataDir,'attachments',safe);fs.mkdirSync(dir,{recursive:true});return dir}
export function caseFileDir(caseId:string){const safe=caseId.replace(/[^a-zA-Z0-9_-]/g,'_'),dir=path.join(dataDir,'cases',safe);fs.mkdirSync(dir,{recursive:true});return dir}
export function safeFilename(value:string){return path.basename(value).replace(/[^a-zA-Z0-9._äöüÄÖÜß-]/g,'_').slice(0,180)||'anlage.bin'}
