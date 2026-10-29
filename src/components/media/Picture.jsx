import { getPicture } from '../../lib/images.js'

/**
 * Image responsive : <picture> AVIF → WebP → JPEG, srcset multi-tailles,
 * lazy-loading par défaut, dimensions intrinsèques (pas de décalage de mise en page).
 *
 * @param {string} src      chemin enregistré par le CMS (/src/content/uploads/…)
 * @param {string} alt      texte alternatif descriptif (obligatoire, "" si décoratif)
 * @param {string} sizes    attribut sizes (largeur affichée selon l'écran)
 * @param {boolean} priority image au-dessus de la ligne de flottaison (hero) → chargement immédiat
 */
export default function Picture({ src, alt, sizes = '100vw', className = '', imgClassName = '', priority = false }) {
  const pic = getPicture(src)
  const common = {
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : undefined,
    className: imgClassName,
  }

  // Image externe ou introuvable : on affiche l'URL telle quelle.
  if (!pic) return src ? <img src={src} {...common} className={`${imgClassName} ${className}`} /> : null

  return (
    <picture className={className}>
      {Object.entries(pic.sources).map(([format, srcset]) => (
        <source key={format} type={`image/${format}`} srcSet={srcset} sizes={sizes} />
      ))}
      <img src={pic.img.src} width={pic.img.w} height={pic.img.h} {...common} />
    </picture>
  )
}
