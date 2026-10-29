/**
 * Images Open Graph (aperçu lors d'un partage sur LinkedIn, Facebook…) : 1200px en JPEG.
 * Utilisé uniquement au pré-rendu → n'alourdit pas le JavaScript du navigateur.
 */
const ogImages = import.meta.glob(
  '/src/content/uploads/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true, import: 'default', query: '?w=1200&format=jpeg&quality=75' },
)

/** URL absolue de l'image Open Graph d'une page (le domaine vient de Netlify au build). */
export const ogImageUrl = (seo, origin = '') => {
  const src = seo.image ? ogImages[seo.image] : null
  return src ? `${origin}${src}` : ''
}
