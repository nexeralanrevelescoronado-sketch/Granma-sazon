// Arma docs/GUION-ABUELO.pdf a partir de docs/GUION-ABUELO.md (letra grande para leer al grabar).
// Uso: node scripts/guion-pdf.mjs   (necesita Playwright con Chromium)
import {createRequire} from 'node:module'; const {chromium}=createRequire('/opt/node-tools/x.js')('playwright');
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path'; import {fileURLToPath} from 'node:url';
const DOCS=join(dirname(fileURLToPath(import.meta.url)),'..','docs');
const md=readFileSync(join(DOCS,'GUION-ABUELO.md'),'utf8').split('\n');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`(.+?)`/g,'<code>$1</code>');
let h='',lista=null,frases=false;
const cierra=()=>{if(lista){h+=`</${lista}>`;lista=null}};
for(const l of md){
  if(l.startsWith('Generado con'))continue;
  if(l.startsWith('# ')){cierra();h+=`<h1>${fmt(l.slice(2))}</h1>`}
  else if(l.startsWith('## ')){cierra();frases=l.includes('Frases');h+=`<h2>${fmt(l.slice(3))}</h2>`}
  else if(/^\d+\. /.test(l)){if(lista!=='ol'){cierra();h+=`<ol class="${frases?'frases':''}">`;lista='ol'}h+=`<li>${fmt(l.replace(/^\d+\. /,''))}`}
  else if(/^\s+- /.test(l)){h+=`<div class="sub">• ${fmt(l.trim().slice(2))}</div>`}
  else if(l.trim()){cierra();h+=`<p>${fmt(l)}</p>`}
}
cierra();
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><title>Guion del Abuelo</title><style>
@page{size:Letter;margin:18mm 16mm}
body{font:13pt/1.5 Georgia,serif;color:#2b1d14}
h1{font-size:22pt;color:#A8412B;margin:0 0 4pt;border-bottom:2px solid #A8412B;padding-bottom:6pt}
h2{font-size:15pt;color:#A8412B;margin:16pt 0 6pt}
ol{padding-left:26pt;margin:0}li{margin-bottom:5pt}
.sub{margin:3pt 0 0 6pt;font-size:12pt}
code{font-family:monospace;background:#f3e9dc;padding:0 3pt;border-radius:3pt}
ol.frases li{font-size:15pt;line-height:1.45;margin-bottom:11pt;break-inside:avoid;padding-left:4pt}
ol.frases li::marker{color:#A8412B;font-weight:bold}
</style><body>${h}</body></html>`;
const b=await chromium.launch();const p=await b.newPage();await p.setContent(html);
await p.pdf({path:join(DOCS,'GUION-ABUELO.pdf'),format:'Letter',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8pt;width:100%;text-align:center;color:#777">Granma Sazón · Guion del Abuelo · <span class="pageNumber"></span> de <span class="totalPages"></span></div>'});
await b.close();
