/**
 * Images optimisées au build (vite-imagetools + sharp).
 *
 * Chaque image de src/content/uploads/ (y compris celles uploadées par Eva via le CMS)
 * est déclinée en AVIF + WebP + JPEG, en 3 largeurs maximum (jamais agrandie).
 * Le CMS enregistre des chemins du type "/src/content/uploads/xxx.jpg" : ce sont
 * exactement les clés de ce glob, d'où la correspondance directe.
 */
const pictures = import.meta.glob(
  '/src/content/uploads/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true, import: 'default', query: '?w=480;960;1600&format=avif;webp;jpeg&quality=72&as=picture' },
)

/** @returns {{ sources: Record<string,string>, img: { src: string, w: number, h: number } } | null} */
export const getPicture = (path) => (path ? pictures[path] || null : null)

/** Fichiers non-image (vidéo mp4 d'extrait, etc.) : servis tels quels. */
const files = import.meta.glob('/src/content/uploads/**/*.{mp4,webm,MP4,WEBM}', {
  eager: true,
  import: 'default',
  query: '?url',
})
export const getFileUrl = (path) => (path ? files[path] || null : null)
