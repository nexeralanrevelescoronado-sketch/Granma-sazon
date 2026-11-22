import {createRequire} from 'node:module'; const {chromium}=createRequire('/opt/node-tools/x.js')('playwright');
const c=await chromium.launchPersistentContext('/tmp/claude-0/prof',{headless:true,args:['--no-sandbox']}); const p=await c.newPage();
await p.goto('http://localhost:8099/'); await p.evaluate(()=>localStorage.setItem('granma:v1',JSON.stringify({v:1,perfil:{aprende:'en',interes:'trabajo',cocina:'mexicana',nombre:'Ana',listo:true},xp:120,racha:{n:3,ultimo:new Date().toLocaleDateString('sv-SE')},vidas:{n:4,t:Date.now()},caps:{},recetas:{},consejos:{},cotorreos:{},biblia:{},insignias:{},misiones:{fecha:'',prog:{},cobradas:{}},stats:{retoMejor:0,retos:0},ajustes:{sonido:false,voz:false},constancia:{fecha:null}})));
await c.close();
