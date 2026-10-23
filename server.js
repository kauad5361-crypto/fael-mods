// FAEL MODS shared key server — Node.js 18+
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = __dirname;
const DB = path.join(ROOT, 'keys-db.json');
const PORT = Number(process.env.PORT || 3000);
function readDb(){ try { return JSON.parse(fs.readFileSync(DB,'utf8')); } catch { return {keys:{}}; } }
function writeDb(db){ fs.writeFileSync(DB, JSON.stringify(db,null,2), {mode:0o600}); }
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(obj));}
function body(req){return new Promise((resolve,reject)=>{let raw='';req.on('data',d=>{raw+=d;if(raw.length>1e6)reject(new Error('too large'));});req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{reject(new Error('bad json'));}});req.on('error',reject);});}
function dateVal(v){const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}
const server=http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS') return send(res,204,{});
 const url=new URL(req.url,'http://localhost');
 try {
  if(req.method==='POST' && url.pathname==='/api/keys'){
   const data=await body(req); if(!Array.isArray(data.keys)||!data.keys.length||data.keys.length>100) return send(res,400,{message:'Lista de keys inválida.'});
   const db=readDb(); let added=0;
   for(const k of data.keys){
    const key=String(k.name||'').trim(); if(!key||key.length>200)continue;
    db.keys[key]={key,product:String(k.product||'FAEL MODS'),owner:String(k.owner||''),created:k.created||new Date().toISOString(),expires:k.expires||null,status:['Ativo','Inativo','Pausado'].includes(k.status)?k.status:'Inativo',deleted:false};
    added++;
   }
   writeDb(db); return send(res,201,{ok:true,added});
  }
  if(req.method==='POST' && url.pathname==='/api/keys/status'){
   const data=await body(req),key=String(data.key||'').trim();const db=readDb();if(!db.keys[key]||db.keys[key].deleted)return send(res,404,{message:'Key não encontrada.'});
   if(!['Ativo','Inativo','Pausado'].includes(data.status))return send(res,400,{message:'Status inválido.'});
   db.keys[key].status=data.status;writeDb(db);return send(res,200,{ok:true});
  }
  if(req.method==='POST' && url.pathname==='/api/keys/delete'){
   const data=await body(req),key=String(data.key||'').trim();const db=readDb();if(!db.keys[key])return send(res,404,{message:'Key não encontrada.'});
   db.keys[key].deleted=true;writeDb(db);return send(res,200,{ok:true});
  }
  if(req.method==='POST' && url.pathname==='/api/keys/validate'){
   const data=await body(req),key=String(data.key||'').trim();const db=readDb(),item=db.keys[key];
   if(!item||item.deleted)return send(res,200,{valid:false,message:'Key não encontrada.'});
   if(item.status!=='Ativo')return send(res,200,{valid:false,message:'Esta key não está ativa.'});
   const exp=dateVal(item.expires);if(exp&&exp.getTime()<Date.now())return send(res,200,{valid:false,message:'Esta key expirou.'});
   return send(res,200,{valid:true,product:item.product,expires:item.expires});
  }
  if(req.method==='GET' && url.pathname==='/api/health') return send(res,200,{ok:true,service:'FAEL MODS key API'});
  if(req.method==='GET' && url.pathname==='/') {res.writeHead(302,{Location:'/FAEL_MODS_painel_conectado.html'});return res.end();}
  if(req.method==='GET'){
   const safe=path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
   const file=path.join(ROOT,safe);
   if(!file.startsWith(ROOT))return send(res,403,{message:'Forbidden'});
   fs.readFile(file,(err,content)=>{if(err){res.writeHead(404);return res.end('Not found');}
    const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(content);
   });return;
  }
  return send(res,404,{message:'Rota não encontrada.'});
 } catch(e){return send(res,400,{message:'Pedido inválido.'});}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`FAEL MODS API listening on port ${PORT}`));
