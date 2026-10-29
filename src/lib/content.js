/**
 * Couche de lecture du contenu (CMS Decap → fichiers JSON dans src/content/).
 *
 * Tout est chargé au build via import.meta.glob : ajouter un fichier depuis le CMS
 * suffit pour qu'il apparaisse sur le site (catégorie, page détail, accueil…),
 * sans toucher au code.
 */
import { marked } from 'marked'

// ---------------------------------------------------------------------------
// Chargement brut
// ---------------------------------------------------------------------------
const load = (modules) =>
  Object.entries(modules).map(([path, data]) => ({
    slug: path.split('/').pop().replace(/\.json$/, ''),
    ...data,
  }))

const projetsRaw = load(import.meta.glob('/src/content/projets/*.json', { eager: true, import: 'default' }))
const categoriesRaw = load(import.meta.glob('/src/content/categories/*.json', { eager: true, import: 'default' }))
const experiencesRaw = load(import.meta.glob('/src/content/experiences/*.json', { eager: true, import: 'default' }))

import siteData from '/src/content/reglages/site.json'
import aProposData from '/src/content/reglages/a-propos.json'
import reseauxData from '/src/content/reglages/reseaux.json'
import proData from '/src/content/reglages/pro.json'

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/**
 * Les champs commençant par « TODO: » signalent une information manquante
 * (visible dans le CMS pour Eva) : on ne les affiche jamais sur le site public.
 */
export const clean = (value) =>
  typeof value === 'string' && !value.trim().startsWith('TODO:') ? value.trim() : ''

/** Markdown (éditeur de texte riche du CMS) → HTML. */
export const toHtml = (md) => (clean(md) ? marked.parse(clean(md), { breaks: true }) : '')

const byOrder = (a, b) => (a.ordre ?? 999) - (b.ordre ?? 999) || a.titre?.localeCompare?.(b.titre)

export const year = (date) => (clean(String(date || '')) ? String(date).slice(0, 4) : '')

// ---------------------------------------------------------------------------
// Données exposées
// ---------------------------------------------------------------------------
export const site = siteData
export const t = siteData.textes
export const aPropos = aProposData
export const reseaux = (reseauxData.reseaux || []).filter((r) => clean(r.url))
export const pro = proData

export const categories = categoriesRaw
  .map((c) => ({ ...c, titre: c.nom }))
  .sort(byOrder)

export const projets = projetsRaw
  .filter((p) => clean(p.titre) && p.categorie)
  .map((p) => ({
    ...p,
    roles: p.roles || [],
    videos: (p.videos || []).filter((v) => clean(v.url)),
    galerie: (p.galerie || []).filter((g) => g.image),
    liens: (p.liens || []).filter((l) => clean(l.url)),
  }))
  .sort(byOrder)

export const experiences = experiencesRaw
  .filter((e) => clean(e.poste))
  // Les plus récentes en premier
  .sort((a, b) => String(b.debut || '').localeCompare(String(a.debut || '')))

// ---------------------------------------------------------------------------
// Requêtes
// ---------------------------------------------------------------------------
export const getCategorie = (slug) => categories.find((c) => c.slug === slug)

export const projetsDe = (catSlug) => projets.filter((p) => p.categorie === catSlug)

export const getProjet = (catSlug, slug) =>
  projets.find((p) => p.slug === slug && p.categorie === catSlug)

/** Catégories d'une rubrique (scolaire / professionnel), avec leurs projets. */
export const categoriesDe = (rubrique, { nonVides = false } = {}) =>
  categories
    .filter((c) => (c.rubrique || 'scolaire') === rubrique)
    .map((c) => ({ ...c, projets: projetsDe(c.slug) }))
    .filter((c) => !nonVides || c.projets.length > 0)

export const projetsMisEnAvant = () => projets.filter((p) => p.mis_en_avant)

/** Projets pro / perso (quelle que soit leur catégorie). */
export const projetsProPerso = () => projets.filter((p) => p.type && p.type !== 'scolaire')

export const projetUrl = (p) => `/projets/${p.categorie}/${p.slug}`
export const categorieUrl = (c) => `/projets/${typeof c === 'string' ? c : c.slug}`

/** Projet précédent / suivant dans la même catégorie (navigation en bas de page). */
export const voisins = (p) => {
  const list = projetsDe(p.categorie)
  const i = list.findIndex((x) => x.slug === p.slug)
  return {
    precedent: i > 0 ? list[i - 1] : null,
    suivant: i < list.length - 1 ? list[i + 1] : null,
  }
}

/** Toutes les URL du site — utilisé par le pré-rendu et le sitemap. */
export const allRoutes = () => [
  '/',
  '/projets',
  '/projets-professionnels',
  '/a-propos',
  '/contact',
  '/experience',
  ...categories.map((c) => categorieUrl(c)),
  ...projets.map((p) => projetUrl(p)),
]
