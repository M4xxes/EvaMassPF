#!/usr/bin/env node
// Télécharge toutes les images du portfolio Adobe d'Eva Masson et les range par projet.
// Usage (depuis le dossier eva-export) :  node scripts/download-media.mjs
// Node 18+ requis (fetch natif). Aucune dépendance.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BASE = 'https://evamassonc01e.myportfolio.com';
const ROOT = path.resolve(process.argv[2] || '.');
const CONTENT = path.join(ROOT, 'content');
const MEDIA = path.join(CONTENT, 'media');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

// Clé de page (utilisée dans projects.json) -> chemin sur le site
const PAGES = {
  'work': '/work',
  'bande-annonce': '/bande-annonce',
  'clip': '/clip',
  'courts-metrages': '/courts-metrages',
  'publicite-packshots': '/publicite-packshots',
  'interview': '/interview',
  'motion-design': '/motion-design',
  'projets-personnels': '/projets-personnels',
  'reportage': '/reportage',
  'photographie': '/photographie',
  'mon-experience-professionnelle': '/mon-experience-professionnelle',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const failures = [];

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]).replace(/&amp;/g, '&') : null;
}

function largestFromSrcset(srcset) {
  let best = null;
  for (const part of srcset.split(',')) {
    const [url, size] = part.trim().split(/\s+/);
    if (!url) continue;
    const w = parseInt(size, 10) || 0;
    if (!best || w > best.w) best = { url, w };
  }
  return best?.url ?? null;
}

// Identifiant stable d'une image sur le CDN (le nom de fichier sans le suffixe de taille)
function assetKey(url) {
  const file = new URL(url).pathname.split('/').pop();
  return file.replace(/_(rw|rwc|car)_[^.]*/, '').replace(/\.[a-z0-9]+$/i, '');
}

export function extractImages(html) {
  // On ne garde que le contenu principal (pas le header, le menu ni le footer)
  const start = html.search(/<main[\s>]/i);
  const end = html.search(/<\/main>/i);
  const scope = start >= 0 && end > start ? html.slice(start, end) : html;

  const urls = [];
  const seen = new Set();
  const push = (u) => {
    if (!u || !/cdn\.myportfolio\.com/.test(u)) return;
    const abs = u.startsWith('//') ? 'https:' + u : u;
    const key = assetKey(abs);
    if (seen.has(key)) return;
    seen.add(key);
    urls.push(abs);
  };

  // <img> et <source> dans l'ordre du document, + background-image en style inline
  const re = /<(img|source)\b[^>]*>|background-image\s*:\s*url\((['"]?)([^'")]+)\2\)/gi;
  let m;
  while ((m = re.exec(scope))) {
    if (m[3]) { push(m[3]); continue; }
    const tag = m[0];
    const srcset = attr(tag, 'data-srcset') || attr(tag, 'srcset');
    push((srcset && largestFromSrcset(srcset)) || attr(tag, 'data-src') || attr(tag, 'src'));
  }
  return urls;
}

function ogImage(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);
  return m ? attr(m[0], 'content') : null;
}

function extOf(url, contentType) {
  const fromUrl = new URL(url).pathname.match(/\.(jpe?g|png|gif|webp|avif)$/i);
  if (fromUrl) return fromUrl[1].toLowerCase().replace('jpeg', 'jpg');
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('webp')) return 'webp';
  if (contentType?.includes('gif')) return 'gif';
  return 'jpg';
}

async function download(url, destNoExt) {
  const res = await get(url);
  const ext = extOf(url, res.headers.get('content-type'));
  const dest = `${destNoExt}.${ext}`;
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

const pad = (n) => String(n).padStart(2, '0');
const rel = (p) => path.relative(CONTENT, p).split(path.sep).join('/');

async function main() {
  const data = JSON.parse(await readFile(path.join(CONTENT, 'projects.json'), 'utf8'));
  const pageFiles = {}; // pageKey -> [chemins locaux dans l'ordre]
  const pageMeta = {};

  // 1. Toutes les images de chaque page, dans l'ordre
  for (const [key, p] of Object.entries(PAGES)) {
    const url = BASE + p;
    try {
      const html = await (await get(url)).text();
      const imgs = extractImages(html);
      const og = ogImage(html);
      pageMeta[key] = { url, images: imgs.length, ogImage: og };
      pageFiles[key] = [];
      for (let i = 0; i < imgs.length; i++) {
        try {
          const f = await download(imgs[i], path.join(MEDIA, '_pages', key, pad(i + 1)));
          pageFiles[key].push(f);
          log.push(`OK  ${key} #${i + 1}  ${imgs[i]}`);
        } catch (e) {
          pageFiles[key].push(null);
          failures.push(`${key} #${i + 1}  ${imgs[i]}  (${e.message})`);
        }
        await sleep(400);
      }
      if (og) {
        try { pageMeta[key].ogLocal = rel(await download(og, path.join(MEDIA, '_pages', key, 'og-cover'))); }
        catch (e) { failures.push(`${key} og:image  ${og}  (${e.message})`); }
      }
    } catch (e) {
      failures.push(`page ${url}  (${e.message})`);
    }
    await sleep(800);
  }

  // 2. Rangement par projet + miniatures YouTube
  const warnings = [];
  for (const proj of data.projects) {
    const dir = path.join(MEDIA, proj.category, proj.id);
    proj.imageFiles = [];
    const files = pageFiles[proj.images?.page] || [];
    for (const [i, slot] of (proj.images?.slots || []).entries()) {
      const src = files[slot - 1];
      if (!src) { warnings.push(`${proj.id} : image n°${slot} introuvable sur la page ${proj.images.page}`); continue; }
      const dest = path.join(dir, pad(i + 1) + path.extname(src));
      await mkdir(dir, { recursive: true });
      await copyFile(src, dest);
      proj.imageFiles.push(rel(dest));
    }
    for (const v of proj.videos || []) {
      if (v.provider !== 'youtube') continue;
      for (const q of ['maxresdefault', 'hqdefault']) {
        try {
          const f = await download(`https://img.youtube.com/vi/${v.id}/${q}.jpg`, path.join(dir, `thumb-youtube-${v.id}`));
          v.thumbnail = rel(f);
          break;
        } catch { /* on essaie la qualité suivante */ }
      }
      if (!v.thumbnail) failures.push(`${proj.id} : miniature YouTube ${v.id}`);
      await sleep(300);
    }
  }

  // Vérifie qu'aucune image d'une page n'a été oubliée dans les "slots"
  for (const [key, files] of Object.entries(pageFiles)) {
    const used = new Set(data.projects.filter((p) => p.images?.page === key).flatMap((p) => p.images.slots));
    files.forEach((f, i) => {
      if (f && !used.has(i + 1) && data.projects.some((p) => p.images?.page === key)) {
        warnings.push(`${key} : l'image n°${i + 1} (${rel(f)}) n'est rattachée à aucun projet`);
      }
    });
  }

  data.pages = pageMeta;
  await writeFile(path.join(CONTENT, 'projects.resolved.json'), JSON.stringify(data, null, 2));

  const report = [
    '# Rapport de téléchargement', '',
    '## Images trouvées par page', '',
    '| Page | Images | og:image |', '|---|---|---|',
    ...Object.entries(pageMeta).map(([k, m]) => `| ${k} | ${m.images} | ${m.ogLocal ?? '-'} |`), '',
    '## Images par projet', '',
    ...data.projects.map((p) => `- **${p.title}** : ${p.imageFiles.length} image(s)${p.videos.some((v) => v.thumbnail) ? ' + miniature YouTube' : ''}`), '',
    '## Avertissements', '', ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['Aucun']), '',
    '## Échecs', '', ...(failures.length ? failures.map((f) => `- ${f}`) : ['Aucun']), '',
  ].join('\n');
  await writeFile(path.join(CONTENT, 'REPORT.md'), report);
  await writeFile(path.join(CONTENT, 'download.log'), log.join('\n'));

  console.log(report);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('download-media.mjs')) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
