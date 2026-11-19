# Portfolio — Eva MASSON

Site portfolio d'Eva Masson (audiovisuel & photographie), avec un espace d'administration
(`/admin`) qui lui permet d'ajouter, de modifier ou de supprimer ses projets sans toucher au code.

- **Stack** : Vite 7 · React 18 · Tailwind CSS 3 · React Router 7
- **CMS** : Decap CMS (git-based), connexion par **code d'accès** (sans compte GitHub), workflow brouillon / publication
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

Prérequis : **Node.js 20.19+** (exigé par Vite 7).

```bash
npm ci               # installe exactement les versions du package-lock.json
npm run dev          # site sur http://localhost:5173
```

Pour utiliser le CMS en local (sans connexion GitHub, les fichiers sont modifiés directement sur le disque) :

```bash
npm run dev          # terminal 1
npm run cms          # terminal 2 : lance decap-server via npx (port 8081, non installé dans le projet)
# puis ouvrir http://localhost:5173/admin/index.html → « Se connecter »
```

Build de production :

```bash
npm run build        # → dist/
npx serve dist       # pour tester le résultat
```

> ⚠️ **Ne pas lancer `npm audit fix --force`** : il saute des versions majeures sans vérifier la
> compatibilité (Vite 8, imagetools 7…) et casse le build. Les versions ont été choisies pour avoir
> 0 vulnérabilité sans rupture : Vite 7, React Router 7, vite-imagetools 9 (Node 20) avec sharp 0.35
> imposé via `overrides`. Pour une future montée de version, procéder paquet par paquet puis
> relancer `npm run build`.

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
│   ├── admin/                 ← CMS : index.html (connexion par code), config.yml (collections), preview.js/.css (aperçus)
│   └── favicon.svg
├── scripts/prerender.mjs      ← pré-rendu statique + sitemap
├── netlify/functions/auth.mjs ← connexion à /admin par code d'accès (voir section 5)
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
│   │   ├── og.js              ← images Open Graph (pré-rendu uniquement, copiées dans dist/assets par prerender.mjs)
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
| `/projets-professionnels` | Projets pro / perso, catégories pro non vides (Stages, Audacieux…), lien Evastre Photographie |
| `/experience` | Frise d'expériences (lien de menu masqué tant qu'il n'y en a aucune) |
| `/a-propos`, `/contact` | À propos, contact |
| `/photographie` | Redirection (Netlify) vers evastre.netlify.app (site photo d'Eva) |

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
- **Sélection de l'accueil** : `reglages/site.json → selection_accueil` (liste ordonnée de slugs de
  projets, 4 à 8). `projetsMisEnAvant()` la suit dans l'ordre et ignore les slugs supprimés ; si elle
  est vide, retour à la case `mis_en_avant` des projets. Une fois la liste utilisée en production,
  la case pourra être retirée du formulaire Projets.
- **CV** : `reglages/site.json → cv` (PDF uploadé dans `uploads/` ou lien externe). `cvUrl()` renvoie
  l'URL ; vide → entrée de menu et boutons (`components/ui/CvButton.jsx`) masqués.
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

## 5. Connexion au CMS par code d'accès

Eva se connecte à `/admin` avec un simple **code**, sans compte GitHub.

**Fonctionnement** : Decap CMS enregistre le contenu dans le dépôt GitHub et a donc besoin d'un jeton
GitHub. Au clic sur « Se connecter », il ouvre la fenêtre
[`netlify/functions/auth.mjs`](netlify/functions/auth.mjs) (fonction Netlify). Celle-ci demande le
code, le compare à `ADMIN_CODE` (comparaison à temps constant, 1,5 s d'attente après un échec), puis
transmet `GITHUB_TOKEN` au CMS via le protocole `postMessage` de Decap, uniquement vers une page du
même site. Le branchement est fait dans [`public/admin/index.html`](public/admin/index.html)
(`CMS.init` avec `base_url` = le site et `auth_endpoint` = la fonction).

**Mise en place (une seule fois)**

1. **Créer le jeton GitHub** (compte propriétaire du dépôt) : *Settings* → *Developer settings* →
   *Personal access tokens* → **Fine-grained tokens** → *Generate new token* :
   - *Repository access* : **Only select repositories** → `M4xxes/EvaMassPF` ;
   - *Permissions* (Repository) : **Contents** : *Read and write*,
     **Pull requests** : *Read and write* (brouillons), **Issues** : *Read and write*
     (étiquettes des brouillons), *Metadata* : *Read-only* (automatique) ;
   - *Expiration* : la plus longue possible, et **noter la date** pour le renouveler.
2. **Netlify** → *Site configuration* → *Environment variables* → ajouter :
   - `GITHUB_TOKEN` = le jeton créé ci-dessus ;
   - `ADMIN_CODE` = le code donné à Eva (**au moins 12 caractères**, ex. trois mots et un chiffre).
   Cocher « Contains secret values ». Puis *Deploys* → *Trigger deploy* pour les prendre en compte.
3. Donner le code à Eva (de vive voix ou par message privé, pas par email partagé).

**Gestion au quotidien**

- **Changer le code** : modifier `ADMIN_CODE` puis redéployer. Les sessions déjà ouvertes restent
  actives jusqu'à la déconnexion ; pour couper tout accès immédiatement, régénérer aussi le jeton.
- **Jeton expiré** (message d'erreur à la connexion) : en créer un nouveau, remplacer `GITHUB_TOKEN`,
  redéployer.
- Les modifications d'Eva apparaissent dans l'historique GitHub au nom du propriétaire du jeton.
- **Sécurité** : le code donne les mêmes droits que le jeton (écriture sur ce seul dépôt). Après
  connexion, le jeton est conservé dans le navigateur d'Eva jusqu'à « Déconnexion ».
- En local, `npm run dev` + `npm run cms` contourne la connexion (fichiers modifiés sur le disque).
  Pour tester la fenêtre de code en local : `npx netlify-cli dev` avec les deux variables définies.

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

Suivi du cahier des charges d'octobre 2026, à compléter depuis le CMS :

- **Photo d'Eva** pour À propos. (Le CV `uploads/cv/CV_MASSON_EVA_2026.pdf` est en ligne ; les 6 expériences
  de la page Expérience en sont reprises telles quelles.)
- **Sélection de l'accueil** : liste vide pour l'instant → l'accueil affiche encore les 5 projets
  cochés « Mettre en avant ». À remplir avec 4 ou 8 projets.
- **Interviews / Reportage** :
  - REPORTAGE (« Je filme le métier qui me plaît ») : lien YouTube et titre définitif à fournir ;
  - Les Voix de Lyon : créé, résumé à fournir ;
  - Konbibli, Konbiglisse : vidéos encore sur le lecteur Adobe, texte de Konbiglisse à mettre à jour.
- **Motion design / Graphisme** : nouveaux textes des 4 projets ; lien YouTube de l'animation
  After Effects (le lien `MzucElHrcz8` fourni est celui des Voix de Lyon).
- **Stages** : projets SIDO et SKINTIPS (couverture SIDO, 6 photos HD SKINTIPS avec accord des
  personnes photographiées), description et couverture de la catégorie. Dates connues par le CV :
  SIDO septembre 2026, SKINTIPS depuis septembre 2026.
- **Audacieux** : catégorie créée (masquée tant qu'elle est vide) ; réalisations à mettre en ligne,
  couverture, lien Instagram du festival (champ « Liens externes » d'un projet : les catégories
  n'ont pas de champ lien).
- **Photographie** : option A retenue par défaut (lien vers evastre.netlify.app) ; l'option B
  (catégorie dédiée) reste à décider.
- Anciennes lacunes toujours ouvertes : pitch de *Ce que la nuit n'a pas su prendre*, vidéo et pitch du
  *Coup de la liberté*, description du clip, dates des projets, vidéos Adobe de la bande annonce,
  du clip et du packshot.

Les textes repris de l'ancien site sont conservés **tels quels** (y compris leurs fautes de frappe).
