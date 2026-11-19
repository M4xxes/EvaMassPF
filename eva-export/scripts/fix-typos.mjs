#!/usr/bin/env node
// Corrige l'orthographe, la grammaire et la typographie des textes extraits du portfolio d'Eva.
// Usage (depuis le dossier eva-export) : node scripts/fix-typos.mjs
// - Lit content/projects.json (ou projects.resolved.json s'il existe) et content/site.json
// - Écrit les versions corrigées *.fixed.json, sans toucher aux originaux
// - Écrit content/CORRECTIONS.md (avant / après pour chaque correction)

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CONTENT = path.resolve(process.argv[2] || '.', 'content');

// [texte fautif, texte corrigé]. Les phrases sont longues exprès pour ne corriger que le bon endroit.
const FIXES = [
  // --- Pitchs et descriptions ---
  ['Une jeune femme atteinte d’une leucémie vie les derniers jour de sa vie en réalisant des rêves d’enfant avec son meilleur amis ignorant sa condition.',
   'Une jeune femme atteinte d’une leucémie vit les derniers jours de sa vie en réalisant des rêves d’enfant avec son meilleur ami, qui ignore sa condition.'],
  ['les deux podcasteurs bascule lorsque', 'les deux podcasteurs basculent lorsque'],
  ['Clémence y est resté enfermée', 'Clémence y est restée enfermée'],
  ['Un court métrage sélectionner au concours “Halloween Creator Festival” - 2025',
   'Un court-métrage sélectionné au concours « Halloween Creators Festival » 2025'],
  ['Une femme victime de violence conjugale decide de ce faire justice elle meme avant que justice ne la rattrape.',
   'Une femme victime de violences conjugales décide de se faire justice elle-même avant que la justice ne la rattrape.'],
  ['Reportage sélectionner au concours "je film le métier qui me plait"',
   'Reportage sélectionné au concours « Je filme le métier qui me plaît »'],
  ['à sa vision du monde du livre mettant ainsi en lumière', 'à sa vision du monde du livre, mettant ainsi en lumière'],
  ['déplacements, rotations..', 'déplacements, rotations…'],
  ['Captation videos et montage de capsules videos a destination des réseaux sociaux tout au long de l\'evenement',
   'Captation vidéo et montage de capsules vidéo à destination des réseaux sociaux tout au long de l’événement'],
  ['Captations photos et videos d\'evenements', 'Captation photo et vidéo d’événements'],

  // --- Rôles et intitulés ---
  ['Régisseuse Général', 'Régisseuse générale'],
  ['Opératrice Caméra', 'Opératrice caméra'],
  ['Cheffe Électricienne', 'Cheffe électricienne'],
  ['Assistante Réalisatrice', 'Assistante réalisatrice'],
  ['SCENARISATION / RÉALISATION', 'SCÉNARISATION / RÉALISATION'],
  ['REALISATION / ASSISTANAT', 'RÉALISATION / ASSISTANAT'],
  ['AFTER EFFECT / PHOTOSHOP', 'AFTER EFFECTS / PHOTOSHOP'],
  ['"title": "AFTER EFFECT"', '"title": "AFTER EFFECTS"'],
  ['"label": "stages"', '"label": "Stages"'],
  ['"label": "Projets Scolaire"', '"label": "Projets scolaires"'],
  ['"label": "Projets Professionnel"', '"label": "Projets professionnels"'],

  // --- CV (site.json) ---
  ['Photographie et Captation d\'évenements', 'Photographie et captation d’événements'],
  ['Captation et Montage de capsule video promotionnel de l\'évenement à destination des réseaux sociaux',
   'Captation et montage de capsules vidéo promotionnelles de l’événement à destination des réseaux sociaux'],
  ['Juin 2025 - Aout 2025 & Juin 2024 - Aout 2024', 'Juin 2025 - Août 2025 & Juin 2024 - Août 2024'],
  ['Juin 2023 - Aout 2023', 'Juin 2023 - Août 2023'],
  ['Controle qualité', 'Contrôle qualité'],
  ['Participation à l\'organisation d\'activités culturelles et Aide à l\'accueil du public',
   'Participation à l’organisation d’activités culturelles et aide à l’accueil du public'],
  ['Entretien exterieur (nettoyage, désherbage, etc..), Travaux de peinture et montage de mobilier et Tâches de bureautique',
   'Entretien extérieur (nettoyage, désherbage, etc.), travaux de peinture, montage de mobilier et tâches de bureautique'],
  ['Médiatheque L\'Ouvre-Boîte', 'Médiathèque L’Ouvre-Boîte'],
  ['Médiathèque L\'Ouvre-Boîte', 'Médiathèque L’Ouvre-Boîte'],
  ['Clinique de l\'Ouest Lyonnais', 'Clinique de l’Ouest Lyonnais'],
  ['Licence Informatique - 1ere année', 'Licence Informatique - 1re année'],
  ['Faculté des Sciences et Technique (Saint Etienne)', 'Faculté des Sciences et Techniques (Saint-Étienne)'],
  ['Saint-Symphorien-sur-coise', 'Saint-Symphorien-sur-Coise'],
  ['Gestion et coordination d\'equipe', 'Gestion et coordination d’équipe'],
  ['Organisation d\'événements', 'Organisation d’événements'],
  ['conduite d\'ateliers culturel en médiatheque', 'conduite d’ateliers culturels en médiathèque'],
  ['Organisation et animation d\'un atelier', 'Organisation et animation d’un atelier'],
  ['"Davinci Resolve"', '"DaVinci Resolve"'],
  ['"After Effect"]', '"After Effects"]'],
  ['Je m\'intéresse', 'Je m’intéresse'],
  ['réalisation d\'un projet. Curieuse', 'réalisation d’un projet. Curieuse'],
  ['j\'aime participer à la création d\'un projet', 'j’aime participer à la création d’un projet'],
];

// Les remplacements se font sur le JSON sérialisé : on échappe donc les guillemets doubles
// qui se trouvent dans les textes (pas dans les motifs qui visent des clés JSON).
const toJsonText = (s) => (s.startsWith('"') ? s : s.replace(/"/g, '\\"'));

async function fix(file) {
  const src = path.join(CONTENT, file);
  if (!existsSync(src)) return null;
  let text = await readFile(src, 'utf8');
  const applied = [];
  for (const [from, to] of FIXES) {
    const f = toJsonText(from), t = toJsonText(to);
    if (f === t || !text.includes(f)) continue;
    const count = text.split(f).length - 1;
    text = text.split(f).join(t);
    applied.push({ from, to, count });
  }
  JSON.parse(text); // on s'assure que le JSON est toujours valide
  const out = file.replace(/\.json$/, '.fixed.json');
  await writeFile(path.join(CONTENT, out), text);
  return { file, out, applied };
}

const files = [existsSync(path.join(CONTENT, 'projects.resolved.json')) ? 'projects.resolved.json' : 'projects.json', 'site.json'];
const results = (await Promise.all(files.map(fix))).filter(Boolean);

const used = new Set(results.flatMap((r) => r.applied.map((a) => a.from)));
const unused = FIXES.filter(([f, t]) => f !== t && !used.has(f)).map(([f]) => f);

const md = ['# Corrections appliquées', ''];
for (const r of results) {
  md.push(`## ${r.file} → ${r.out} (${r.applied.length} corrections)`, '');
  for (const a of r.applied) md.push(`- ~~${a.from}~~`, `  → **${a.to}**${a.count > 1 ? ` (×${a.count})` : ''}`);
  md.push('');
}
md.push('## Corrections non trouvées (texte déjà corrigé ou modifié)', '', ...(unused.length ? unused.map((u) => `- ${u}`) : ['Aucune']), '');
await writeFile(path.join(CONTENT, 'CORRECTIONS.md'), md.join('\n'));

console.log(md.join('\n'));
