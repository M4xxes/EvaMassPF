import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Picture from '../media/Picture.jsx'
import { getFileUrl } from '../../lib/images.js'
import { getCategorie, projetUrl, clean } from '../../lib/content.js'

const ratios = { portrait: 'aspect-[4/5]', landscape: 'aspect-[16/10]', wide: 'aspect-[21/10]' }

/**
 * Carte projet : couverture avec zoom lent au survol, et lecture d'un court extrait
 * vidéo muet si Eva en a fourni un dans le CMS (champ « extrait »).
 */
export default function ProjectCard({ projet, ratio = 'portrait', sizes, showCategory = true, priority = false, headingLevel = 'h2' }) {
  const Heading = headingLevel // niveau de titre selon la hiérarchie de la page
  const videoRef = useRef(null)
  const extrait = getFileUrl(projet.extrait)
  const cat = getCategorie(projet.categorie)
  const duree = projet.videos[0]?.duree

  const play = () => {
    const v = videoRef.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.play().catch(() => {})
  }
  const stop = () => videoRef.current?.pause()

  return (
    <Link
      to={projetUrl(projet)}
      className="group block"
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
    >
      <div className={`relative overflow-hidden bg-surface ${ratios[ratio]}`}>
        <Picture
          src={projet.couverture}
          alt={`${projet.titre} — ${cat?.nom ?? ''}`}
          sizes={sizes || '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
          priority={priority}
          className="absolute inset-0"
          imgClassName="h-full w-full object-cover transition duration-[1.4s] ease-cine group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />
        {extrait && (
          <video
            ref={videoRef}
            src={extrait}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-90" />
        {duree && (
          <span className="absolute right-3 top-3 font-mono text-[12px] uppercase tracking-label text-white/85">
            TC {duree}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <Heading className="text-[clamp(1.6rem,2.4vw,2.2rem)] transition-colors duration-500 group-hover:text-accent">
          {projet.titre}
        </Heading>
        {showCategory && cat && <span className="label shrink-0 text-right">{cat.nom}</span>}
      </div>
      {clean(projet.credit) && <p className="mt-1 text-sm text-muted">{projet.credit}</p>}
      {projet.roles.length > 0 && (
        <p className="label mt-2 !normal-case !tracking-normal text-[13px]">{projet.roles.join(' · ')}</p>
      )}
    </Link>
  )
}
