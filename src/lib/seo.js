/**
 * Métadonnées SEO / Open Graph par URL.
 * Source unique utilisée à la fois par le pré-rendu (HTML statique lu par Google,
 * LinkedIn, Facebook…) et par le navigateur lors de la navigation (hook useSeo).
 */
import {
  site, t, aPropos, pro, clean, categories, getCategorie, getProjet, projetsMisEnAvant,
} from './content.js'

const nom = clean(site.nom) || 'Eva Masson'
const descDefaut = clean(site.description_seo)

const truncate = (s, n = 160) => {
  const txt = (s || '').replace(/[#*_>`[\]]/g, '').replace(/\s+/g, ' ').trim()
  return txt.length > n ? `${txt.slice(0, n - 1).trimEnd()}…` : txt
}

export function getSeo(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const parts = path.split('/').filter(Boolean)
  const base = { title: nom, description: descDefaut, image: site.image_hero, type: 'website', notFound: false }

  if (path === '/') return { ...base, title: `${nom} — ${clean(site.sous_titre)}` }

  if (path === '/projets')
    return { ...base, title: `${t.titre_categories} — ${nom}`, description: clean(t.intro_scolaires) || descDefaut,
      image: categories[0]?.couverture || base.image }

  if (path === '/projets-professionnels')
    return { ...base, title: `${clean(pro.titre)} — ${nom}`, description: clean(pro.intro) || descDefaut }

  if (path === '/experience') return { ...base, title: `${t.titre_experience} — ${nom}` }

  if (path === '/a-propos')
    return { ...base, title: `${clean(aPropos.titre)} — ${nom}`, description: truncate(clean(aPropos.bio)) || descDefaut,
      image: aPropos.photo || base.image }

  if (path === '/contact')
    return { ...base, title: `${t.titre_contact} — ${nom}`, description: clean(t.intro_contact) || descDefaut }

  if (parts[0] === 'projets' && parts.length === 2) {
    const c = getCategorie(parts[1])
    if (c)
      return { ...base, title: `${c.nom} — ${nom}`,
        description: clean(c.description) || [c.nom, clean(c.roles_affiches)].filter(Boolean).join(' · '),
        image: c.couverture || base.image }
  }

  if (parts[0] === 'projets' && parts.length === 3) {
    const p = getProjet(parts[1], parts[2])
    if (p)
      return { ...base, title: `${p.titre} — ${nom}`, type: 'article',
        description: truncate(clean(p.resume) || clean(p.description)) ||
          [getCategorie(p.categorie)?.nom, p.roles.join(', ')].filter(Boolean).join(' · '),
        image: p.couverture || base.image }
  }

  return { ...base, title: `${t.introuvable_titre} — ${nom}`, notFound: true,
    image: projetsMisEnAvant()[0]?.couverture || base.image }
}
