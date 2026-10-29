# Portfolio — Eva MASSON

Site portfolio d'Eva Masson (audiovisuel & photographie), avec un espace d'administration
(`/admin`) qui lui permet d'ajouter, de modifier ou de supprimer ses projets sans toucher au code.

- **Stack** : Vite 5 · React 18 · Tailwind CSS 3 · React Router 6
- **CMS** : Decap CMS (git-based), connexion via GitHub, workflow brouillon / publication
- **Hébergement** : Netlify (déploiement automatique à chaque publication dans le CMS)
- **Guide utilisateur (non technique)** : [GUIDE-EVA.md](GUIDE-EVA.md)

---

## Sommaire

1. [Installation et lancement en local](#1-installation-et-lancement-en-local)
2. [Organisation du code](#2-organisation-du-code)
3. [Le contenu (CMS)](#3-le-contenu-cms)
4. [Déploiement sur Netlify](#4-déploiement-sur-netlify)
5. [Authentification du CMS (GitHub OAuth)](#5-authentification-du-cms-github-oauth)
6. [Performances, SEO, accessibilité](#6-performances-seo-accessibilité)
7. [Contenu manquant (TODO)](#7-contenu-manquant-todo)

---

## 1. Installation et lancement en local

Prérequis : **Node.js 20+**.

```bash
npm install
npm run dev          # site sur http://localhost:5173
```

Pour utiliser le CMS en local (sans connexion GitHub, les fichiers sont modifiés directement sur le disque) :

```bash
npm run dev          # terminal 1
npm run cms          # terminal 2 : lance decap-server (port 8081)
# puis ouvrir http://localhost:5173/admin/index.html → « Se connecter »
```

Build de production :

```bash
npm run build        # → dist/
npx serve dist       # pour tester le résultat
```

> ⚠️ `vite preview` ne sert pas les pages pré-rendues des sous-dossiers (il renvoie l'accueil
> pour `/projets`, ce qui provoque une erreur d'hydratation) : utiliser `npx serve dist`.

Le build se fait en trois temps (`package.json`) :

1. `vite build` : bundle navigateur + génération des images optimisées ;
2. `vite build --ssr src/entry-server.jsx` : bundle de rendu serveur ;
3. `node scripts/prerender.mjs` : génère un HTML statique par page (`dist/<url>/index.html`)
   avec title / description / Open Graph, plus `sitemap.xml`, `robots.txt` et `404.html`.

Le premier build prend environ 1 min 30 (traitement des images) ; les suivants réutilisent le
cache `node_modules/.cache/imagetools`.

## 2. Organisation du code

```
├── public/
│   ├── admin/                 ← CMS : index.html, config.yml (collections), preview.js/.css (aperçus)
│   └── favicon.svg
├── scripts/prerender.mjs      ← pré-rendu statique + sitemap
├── src/
│   ├── content/               ← TOUT le contenu (JSON écrit par le CMS)
│   │   ├── projets/           ← un fichier par projet
│   │   ├── categories/        ← un fichier par catégorie
│   │   ├── roles/             ← un fichier par rôle
│   │   ├── experiences/       ← un fichier par expérience
│   │   ├── reglages/          ← site.json, a-propos.json, reseaux.json, pro.json
│   │   └── uploads/           ← images / vidéos envoyées depuis le CMS
│   ├── lib/
│   │   ├── content.js         ← lecture du contenu (import.meta.glob), requêtes, URL
│   │   ├── images.js          ← images AVIF/WebP/JPEG multi-tailles (vite-imagetools)
│   │   ├── og.js              ← images Open Graph (pré-rendu uniquement)
│   │   ├── seo.js / useSeo.js ← title / description par page
│   ├── components/
│   │   ├── layout/            ← Header (menu mobile), Footer, Layout (transitions de page)
│   │   ├── media/             ← Picture, VideoFacade, Lightbox, MasonryGrid
│   │   ├── project/           ← ProjectCard, CategoryCard, TechSheet (fiche technique)
│   │   └── ui/                ← Reveal (apparition au scroll), SocialLinks, ThemeToggle…
│   ├── pages/                 ← Home, Projets, Categorie, Projet, Pro, Experience, APropos, Contact, NotFound
│   ├── App.jsx                ← routes
│   ├── main.jsx               ← entrée navigateur (hydratation)
│   └── entry-server.jsx       ← entrée pré-rendu
├── _migration/                ← archive de l'import depuis Adobe Portfolio (non utilisée au build)
└── netlify.toml               ← build, redirections, en-têtes
```

### Routes

| URL | Page |
|---|---|
| `/` | Accueil : hero plein écran + projets « mis en avant » + index des catégories |
| `/projets` | Projets scolaires (catégories de la rubrique « scolaire ») |
| `/projets/:categorie` | Liste des projets d'une catégorie |
| `/projets/:categorie/:slug` | Détail d'un projet |
| `/projets-professionnels` | Projets pro / perso, catégories pro non vides, liens Evasive / Evastre |
| `/experience` | Frise d'expériences (lien de menu masqué tant qu'il n'y en a aucune) |
| `/a-propos`, `/contact` | À propos, contact |
| `/photographie` | Redirection (Netlify) vers evamassonportfolio.netlify.app |

Les anciennes URL Adobe Portfolio (`/work`, `/clip`, `/interview`…) sont redirigées en 301 vers
les nouvelles pages (`netlify.toml`).

### Principes

- **Aucun texte ni image en dur dans les composants** : tout vient de `src/content/`, y compris
  les libellés d'interface (`reglages/site.json → textes`, éditables dans le CMS).
- **Champs `TODO:`** : une valeur commençant par `TODO:` signale une info manquante. Elle est
  visible dans le CMS (encadré orange dans l'aperçu) mais jamais affichée sur le site (`clean()`
  dans `lib/content.js`).
- **Vidéos** : façade (miniature + bouton) ; l'iframe YouTube (`youtube-nocookie`), Vimeo ou Adobe
  n'est chargée qu'au clic (`components/media/video.js` reconnaît les liens).
- **Thème** : sombre par défaut, clair en option ; appliqué avant le rendu par un script inline
  dans `index.html` (pas de flash). Couleurs = variables CSS (`src/styles/index.css`).
- **Animations** : apparition au scroll, ouverture letterbox du hero, zoom au survol, transitions
  de page — toutes coupées si `prefers-reduced-motion: reduce`.

### Direction artistique

| Rôle | Sombre | Clair |
|---|---|---|
| Fond | `#0B0B0C` | `#F3F0EA` |
| Texte | `#EDE9E3` | `#151515` |
| Texte secondaire | `#9C978F` | `#666159` |
| Accent « tungstène » | `#E2A45A` | `#9A5A1C` |

Polices auto-hébergées (`@fontsource`) : **Instrument Serif** (titres), **Geist** (texte),
**Geist Mono** (métadonnées, façon fiche technique).

## 3. Le contenu (CMS)

Decap CMS est servi en statique depuis `public/admin/` (script chargé depuis unpkg, version figée).
La configuration complète des formulaires est dans [`public/admin/config.yml`](public/admin/config.yml).

| Collection | Dossier / fichier | Notes |
|---|---|---|
| Projets | `src/content/projets/*.json` | titre, catégorie et couverture obligatoires ; relations vers Catégories et Rôles |
| Catégories | `src/content/categories/*.json` | champ « rubrique » : scolaire ou professionnel |
| Rôles | `src/content/roles/*.json` | proposés en choix multiple dans les projets |
| Expérience professionnelle | `src/content/experiences/*.json` | |
| Réglages du site | `src/content/reglages/*.json` | À propos, réseaux sociaux, page Pro/Perso, accueil + textes d'interface |

- **Ajout automatique** : `lib/content.js` charge tous les fichiers par `import.meta.glob` ;
  un nouveau projet apparaît dans sa catégorie, a sa page détail, est pré-rendu et ajouté au sitemap.
- **Images** : uploadées dans `src/content/uploads/`. Le chemin enregistré
  (`/src/content/uploads/x.jpg`) est exactement la clé du glob de `lib/images.js`, qui produit
  AVIF + WebP + JPEG en 480 / 960 / 1600 px (jamais agrandies). Les originaux restent dans le dépôt :
  recommander à Eva des fichiers de moins de 10 Mo.
- **Brouillons** : `publish_mode: editorial_workflow`. Un brouillon = une branche `cms/…` + une
  pull request sur GitHub ; « Publier » fusionne dans `main` → Netlify redéploie.
- **Aperçu** : `public/admin/preview.js` (rendu proche du site, sans build).
- **Slug de catégorie** : la valeur enregistrée dans un projet est le nom de fichier de la catégorie.
  Renommer une catégorie dans le CMS ne change pas son fichier : les projets restent rattachés.
  En revanche, **supprimer** une catégorie qui contient des projets les rend invisibles.

## 4. Déploiement sur Netlify

1. **Créer un dépôt GitHub** dédié et y pousser ce dossier :
   ```bash
   git add -A && git commit -m "Portfolio Eva Masson"
   git branch -M main
   git remote add origin git@github.com:<compte>/<depot>.git
   git push -u origin main
   ```
2. **Netlify** → *Add new site* → *Import an existing project* → GitHub → choisir le dépôt.
   Les réglages de build sont lus dans `netlify.toml` (`npm run build`, dossier `dist`, Node 20).
3. (Optionnel) *Domain management* → ajouter un domaine personnalisé.
   La variable `URL` fournie par Netlify sert de domaine pour les balises Open Graph et le sitemap
   (sinon, renseigner « Adresse du site » dans *Réglages → Accueil* du CMS).
4. Chaque commit sur `main` (donc chaque publication dans le CMS) déclenche un déploiement.
   Les brouillons du CMS (pull requests) génèrent des *Deploy Previews* : pratique pour montrer un
   projet avant de le publier. Pour économiser des minutes de build, on peut les désactiver dans
   *Site configuration → Build & deploy → Deploy Previews*.

## 5. Authentification du CMS (GitHub OAuth)

Netlify Identity / Git Gateway étant dépréciés, le CMS utilise le **backend GitHub** ; Netlify
sert uniquement de relais OAuth.

1. **GitHub** → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App* :
   - *Homepage URL* : l'URL du site Netlify (ex. `https://eva-masson.netlify.app`)
   - *Authorization callback URL* : `https://api.netlify.com/auth/done`
   - Créer, puis générer un *Client secret*.
2. **Netlify** → *Site configuration* → *Access & security* → *OAuth* →
   *Install provider* → **GitHub** → coller le *Client ID* et le *Client secret*.
3. Dans [`public/admin/config.yml`](public/admin/config.yml), remplacer
   `repo: TODO_PROPRIETAIRE/TODO_DEPOT` par le vrai dépôt (ex. `M4xxes/eva-masson-portfolio`),
   committer et pousser.
4. **Donner l'accès à Eva** : elle crée un compte GitHub gratuit ; sur le dépôt →
   *Settings* → *Collaborators* → *Add people* → son identifiant (droit *Write*).
   Elle accepte l'invitation reçue par email.
5. Eva se connecte sur `https://<site>/admin/` → « Se connecter avec GitHub ».

Seules les personnes ayant un droit d'écriture sur le dépôt peuvent se connecter.

## 6. Performances, SEO, accessibilité

Mesures Lighthouse (mobile, réseau simulé, serveur local avec gzip) :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| `/` | 90 (99 sur ordinateur) | 100 | 100 | 100 |
| `/projets` | 94 | 100 | 100 | 100 |
| `/projets/courts-metrages` | 91 | 100 | 100 | 100 |
| `/projets/courts-metrages/reviens` | 97 | 100 | 100 | 100 |
| `/projets/motion-design/hors-cadre` | 90 | 100 | 100 | 100 |
| `/projets-professionnels` | 98 | 100 | 100 | 100 |
| `/contact` | 98 | 100 | 100 | 100 |

Sur mobile, l'accueil est juste à 90 à cause de la grande image du hero (LCP ≈ 3,4 s en 4G simulée) :
si Eva remplace cette image, viser un fichier de bonne qualité mais pas démesuré.

- Images : `<picture>` AVIF/WebP/JPEG, `srcset` + `sizes`, `loading="lazy"` (sauf image principale
  en `fetchpriority="high"`), largeur/hauteur intrinsèques (CLS = 0).
- Polices auto-hébergées, pas de ressource tierce bloquante.
- Pré-rendu : contenu lisible sans JavaScript, balises Open Graph par projet (image 1200 px).
- Accessibilité : HTML sémantique, lien d'évitement, focus visible, menu mobile et visionneuse
  utilisables au clavier (Échap, ←, →, piège à focus), contrastes AA dans les deux thèmes.
- Les liens vers les réseaux s'ouvrent dans un nouvel onglet (`target="_blank"
  rel="noopener noreferrer"`), sauf l'email (`mailto:`), qui ouvre directement la messagerie.

## 7. Contenu manquant (TODO)

Repéré lors de l'import du site Adobe Portfolio (`_migration/`), à compléter depuis le CMS :

- **Photo d'Eva** pour la page À propos (aucune sur l'ancien site).
- **Clip « Tema les cernes »** : pas de description (titre et crédit lus sur l'image de couverture).
- **Ce que la nuit n'a pas su prendre** : pitch vide sur l'ancien site.
- **Le coup de la liberté** : ni vidéo ni pitch.
- **Stages** (catégorie pro) : page vide sur l'ancien site — masquée tant qu'elle n'a pas de projet.
- **Expérience professionnelle** : page vide sur l'ancien site — masquée du menu tant qu'elle est vide.
- **Interviews / Reportage** : l'ancien site affichait un titre « REPORTAGE » sans contenu.
- **Dates** des projets : aucune sur l'ancien site.
- **Vidéos hébergées chez Adobe** (bande annonce, clip, packshot, Konbibli, Konbiglisse, animation
  After Effects) : elles dépendent de l'abonnement Adobe Portfolio. À remettre sur YouTube/Vimeo
  puis à remplacer le lien dans le CMS, sinon elles disparaîtront si l'abonnement s'arrête.

Les textes repris de l'ancien site sont conservés **tels quels** (y compris leurs fautes de frappe).
