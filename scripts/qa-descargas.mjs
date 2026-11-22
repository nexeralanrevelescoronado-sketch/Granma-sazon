// QA: pausa manual, corte de internet a medias y reanudación automática de la descarga de la Biblia.
import {createRequire} from 'node:module'; import {dirname} from 'node:path'; import {fileURLToPath} from 'node:url';
let chromium; try { ({chromium}=await import('playwright')); } catch { ({chromium}=createRequire('/opt/node-tools/x.js')('playwright')); }
import {createServer} from 'node:http'; import {readFileSync,existsSync,statSync} from 'node:fs'; import {join,extname} from 'node:path';
const R=join(dirname(fileURLToPath(import.meta.url)),'..'); const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=createServer((q,s)=>{let p=new URL(q.url,'http://x').pathname;if(p.endsWith('/'))p+='index.html';const f=join(R,p);if(!existsSync(f)||statSync(f).isDirectory()){s.writeHead(404);return s.end()}
 const lento=/biblia\/(rv1909|kjv|web)\//.test(p); setTimeout(()=>{s.writeHead(200,{'Content-Type':T[extname(f)]||'application/octet-stream'});s.end(readFileSync(f))},lento?60:0)}).listen(0);
const B=`http://localhost:${srv.address().port}/`;
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:800}}); const pg=await ctx.newPage();
await pg.goto(B); await pg.evaluate(()=>localStorage.setItem('granma:v1',JSON.stringify({v:1,perfil:{aprende:'en',interes:'biblia',cocina:'mexicana',nombre:'',listo:true},xp:0,racha:{n:0,ultimo:null},vidas:{n:5,t:Date.now()},caps:{},recetas:{},consejos:{},cotorreos:{},biblia:{},insignias:{},misiones:{fecha:'',prog:{},cobradas:{}},stats:{retoMejor:0,retos:0},ajustes:{sonido:false},constancia:{fecha:null}}))); 
pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.reload(); await pg.waitForTimeout(500); await pg.goto(B+'#/descargas'); await pg.waitForSelector('[data-bajar="biblia"]');
const n=()=>pg.evaluate(async()=>{const c=await caches.open('granma-pkg-biblia-f1');return (await c.keys()).length});
const txt=()=>pg.locator('#pq-biblia [data-estado]').textContent();
// 1) pausar manualmente
await pg.click('[data-bajar="biblia"]'); while((await n())<20) await pg.waitForTimeout(50);
await pg.click('[data-pausar="biblia"]'); await pg.waitForSelector('[data-bajar="biblia"]');
const a=await n(); await pg.waitForTimeout(600); const a2=await n();
console.log('PAUSA manual: archivos',a,'→',a2,a===a2||a2-a<=4?'✔ se detuvo':'✘', '| texto:',await txt());
// 2) reanudar y cortar internet a medias
await pg.click('[data-bajar="biblia"]'); while((await n())<a+30) await pg.waitForTimeout(50);
await ctx.setOffline(true); await pg.waitForFunction(()=>/Se cortó|dropped/.test(document.querySelector('#pq-biblia [data-estado]').textContent),null,{timeout:20000});
const c1=await n(); console.log('CORTE: mensaje →',await txt(),'| archivos guardados',c1);
// 3) vuelve el internet: se reanuda solo
await ctx.setOffline(false); await pg.waitForFunction(()=>/Descargado|Downloaded/.test(document.querySelector('#pq-biblia [data-estado]').textContent),null,{timeout:90000});
const esperados=JSON.parse(readFileSync(R+'/data/paquetes.json','utf8')).paquetes.find(p=>p.id==='biblia').archivos.length; const fin=await n(); console.log('REANUDA sola: total',fin,'de',esperados, fin===esperados?'✔':'✘'); if(fin!==esperados) process.exitCode=1;
// 4) abrir un capítulo sin internet
await ctx.setOffline(true); await pg.goto(B+'#/biblia'); await pg.waitForSelector('.verso-fila'); console.log('Biblia offline filas',await pg.locator('.verso-fila').count());
await b.close(); srv.close();
