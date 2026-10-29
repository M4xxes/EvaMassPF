/**
 * Pré-rendu statique (dernière étape de `npm run build`).
 *
 * Pour chaque URL du site (accueil, catégories, projets… y compris ceux ajoutés
 * dans le CMS), on génère un fichier dist/<url>/index.html contenant :
 *  - le HTML de la page (affichage immédiat, contenu lisible par Google) ;
 *  - <title>, meta description et balises Open Graph propres à la page.
 * Puis sitemap.xml, robots.txt et 404.html.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render, allRoutes, getSeo, ogImageUrl, site } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
)

// Domaine public : variable URL fournie par Netlify au build, sinon champ « URL du site » du CMS.
const origin = (process.env.URL || site.url_site || '').replace(/\/+$/, '')

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function head(url) {
  const seo = getSeo(url)
  const image = ogImageUrl(seo, origin)
  const canonical = origin ? `${origin}${url}` : ''
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    canonical && !seo.notFound && `<link rel="canonical" href="${canonical}" />`,
    seo.notFound && '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="${seo.type}" />`,
    `<meta property="og:site_name" content="${esc(site.nom)}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    canonical && `<meta property="og:url" content="${canonical}" />`,
    image && `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
    .filter(Boolean)
    .join('\n    ')
}

const page = (url) =>
  template.replace('<!--app-head-->', head(url)).replace('<!--app-html-->', render(url))

const routes = allRoutes()
for (const url of routes) {
  const file = path.join(dist, url === '/' ? 'index.html' : `${url}/index.html`)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, page(url))
}
await fs.writeFile(path.join(dist, '404.html'), page('/404'))

if (origin) {
  const urls = routes.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join('\n')
  await fs.writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
}
await fs.writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nDisallow: /admin/\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`,
)

// Le bundle serveur ne sert qu'au build.
await fs.rm(ssrDir, { recursive: true, force: true })
console.log(`✓ ${routes.length} pages pré-rendues${origin ? ` pour ${origin}` : ' (pas de domaine : sitemap ignoré)'}`)
