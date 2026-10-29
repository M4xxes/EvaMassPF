import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Picture from '../media/Picture.jsx'
import { categorieUrl, clean, t } from '../../lib/content.js'

/** Carte catégorie (page Projets scolaires) : numéro, couverture, rôles d'Eva, nombre de projets. */
export default function CategoryCard({ categorie, index, priority = false }) {
  const count = categorie.projets?.length ?? 0
  return (
    <Link to={categorieUrl(categorie)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {categorie.couverture && (
          <Picture
            src={categorie.couverture}
            alt={categorie.nom}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover grayscale-[35%] transition duration-[1.4s] ease-cine group-hover:scale-[1.05] group-hover:grayscale-0"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
        <span className="absolute left-4 top-4 font-mono text-[12px] tracking-label text-white/80">
          {String(index + 1).padStart(2, '0')}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-4 top-4 h-5 w-5 text-white/70 transition duration-500 ease-cine group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[rgb(226_164_90)]"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-6">
          <h2 className="text-[clamp(2rem,3.2vw,3rem)]">{categorie.nom}</h2>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-label text-white/75">
            {clean(categorie.roles_affiches)}
          </p>
        </div>
      </div>
      <p className="label mt-3">
        {count} {count > 1 ? t.projets : t.projet}
      </p>
    </Link>
  )
}
