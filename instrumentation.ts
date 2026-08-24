export async function register(){
 if(process.env.NEXT_RUNTIME!=='nodejs')return;
 const g=globalThis as typeof globalThis&{__outlookTimer?:NodeJS.Timeout};
 const minutes=Number(process.env.OUTLOOK_SYNC_MINUTES||5);
 if(g.__outlookTimer||!Number.isFinite(minutes)||minutes<=0||!process.env.OUTLOOK_MAILBOX)return;
 const run=async()=>{try{const{syncOutlook}=await import('./lib/outlook');await syncOutlook()}catch(error){console.error('[Outlook-Sync]',error instanceof Error?error.message:error)}};
 setTimeout(run,10_000);
 g.__outlookTimer=setInterval(run,minutes*60_000);
}
