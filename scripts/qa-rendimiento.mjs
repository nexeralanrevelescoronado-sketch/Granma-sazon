// Banco de fluidez: CPU frenada 4× (≈ teléfono), personaje hablando + confeti + reacciones + vapor a la vez.
// Mide tiempos de cuadro (rAF), tareas largas (TBT aprox.) y CLS en el navegador. Uso: node scripts/qa-rendimiento.mjs
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire('/opt/node-tools/x.js')('playwright')); }
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((req, res) => { let p = new URL(req.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(RAIZ, p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`;
const estado = { v: 1, perfil: { aprende: 'en', interes: 'trabajo', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 0, racha: { n: 0, ultimo: null }, vidas: { n: 5, t: Date.now() }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false }, constancia: { fecha: null } };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 }); const pg = await ctx.newPage();
await pg.addInitScript(() => { window.__m = { cls: 0, largas: [], cuadros: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.largas.push(e.duration); }).observe({ type: 'longtask', buffered: true }); });
await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', JSON.stringify(e)), estado); await pg.reload(); await pg.waitForTimeout(500);
const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const escenario = async (ruta, extra) => {
  await pg.goto(B + ruta); await pg.waitForTimeout(300);
  await pg.evaluate(() => { window.__m.cuadros = []; let t0 = performance.now(); const paso = (t) => { window.__m.cuadros.push(t - t0); t0 = t; if (window.__m.cuadros.length < 400) requestAnimationFrame(paso); }; requestAnimationFrame(paso); });
  await pg.waitForTimeout(900); if (extra) await extra(); await pg.waitForTimeout(4200);
  return pg.evaluate(() => { const c = [...window.__m.cuadros].slice(2).sort((a, b) => a - b), q = (p) => c[Math.min(c.length - 1, Math.floor(c.length * p))];
    return { cuadros: c.length, p50: +q(.5).toFixed(1), p95: +q(.95).toFixed(1), max: +c[c.length - 1].toFixed(1), mas33ms: c.filter((x) => x > 33.4).length, tbt: +window.__m.largas.reduce((s, d) => s + Math.max(0, d - 50), 0).toFixed(0), cls: +window.__m.cls.toFixed(4) }; });
};
const stress = async () => { await pg.evaluate(async () => { const m = await import('./assets/animaciones/index.js'); m.confeti(40); document.querySelectorAll('.pj').forEach((s) => m.reaccion(s, s.dataset.quien === 'abuelo' ? 'asiente' : 'aplauso')); });
  await pg.waitForTimeout(700); await pg.evaluate(async () => { const m = await import('./assets/animaciones/index.js'); m.confeti(40); }); };
const R = {};
R['Lección: 4 globos hablando + confeti + reacciones'] = await escenario('#/leccion/1', stress);
R['Inicio: 3 globos hablando'] = await escenario('#/', null);
R['Demo: vapor + 2 personajes + habla + confeti'] = await escenario('demo-animaciones.html', async () => { await pg.click('[data-a="habla-abuelo"]'); await pg.click('[data-a="confeti"]'); await pg.waitForTimeout(500); await pg.click('[data-a="aplauso"]'); await pg.click('[data-a="confeti"]'); });
console.table(R); await browser.close(); srv.close();
