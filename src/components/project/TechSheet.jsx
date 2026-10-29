import { Link } from 'react-router-dom'
import { getCategorie, categorieUrl, year, t } from '../../lib/content.js'

/** « Fiche technique » façon clap : catégorie, rôle(s), année, durée, format. */
export default function TechSheet({ projet }) {
  const cat = getCategorie(projet.categorie)
  const v = projet.videos[0]
  const rows = [
    [t.categorie, cat && <Link to={categorieUrl(cat)} className="link-underline hover:text-accent">{cat.nom}</Link>],
    [t.roles, projet.roles.join(' · ')],
    [t.annee, year(projet.date)],
    [t.duree, v?.duree],
    [t.format, v?.format],
  ].filter(([, val]) => val)

  return (
    <dl className="grid grid-cols-2 border-t border-line md:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {rows.map(([k, val]) => (
        <div key={k} className="border-b border-line py-4 pr-4 md:border-b-0">
          <dt className="label">{k}</dt>
          <dd className="mt-2 text-[15px]">{val}</dd>
        </div>
      ))}
    </dl>
  )
}
