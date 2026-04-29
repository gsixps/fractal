const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const ROOT='/home/z/my-project',LOG=path.join(ROOT,'dev.log');
const SRV=path.join(ROOT,'.next/standalone/server.js');
try{fs.readFileSync(path.join(ROOT,'.env.local'),'utf8').split('\n').forEach(l=>{
  const t=l.trim();if(!t||t[0]==='#')return;const i=t.indexOf('=');
  if(i<1)return;const k=t.slice(0,i),v=t.slice(i+1).trim().replace(/^['"]|['"]$/g,'');
  if(v)process.env[k]=v;
});}catch{}
process.env.NODE_ENV='production';
process.env.NODE_OPTIONS='--max-old-space-size=512';
if(!process.env.DATABASE_URL)process.env.DATABASE_URL='file:/home/z/my-project/db/custom.db';
const fd=fs.openSync(LOG,'a');
function go(){const c=spawn(process.execPath,[SRV,'-p','3000'],{cwd:path.join(ROOT,'.next/standalone'),stdio:['ignore',fd,fd],env:process.env});
c.on('exit',()=>setTimeout(go,2000));c.on('error',()=>setTimeout(go,3000));}
go();
