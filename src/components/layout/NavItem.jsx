import { NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { t, getCategorie } from '../../lib/content.js'

/** Lien de menu : interne (NavLink, état actif) ou externe (nouvel onglet). */
/**
 * Rubrique d'une URL /projets/<categorie>/… : les catégories « professionnel » (Stages…)
 * appartiennent à « Pro / Perso », pas à « Projets scolaires ».
 */
const rubriqueActive = (pathname) => {
  const [, racine, cat] = pathname.split('/')
  if (racine === 'projets-professionnels') return '/projets-professionnels'
  if (racine !== 'projets') return null
  return getCategorie(cat)?.rubrique === 'professionnel' ? '/projets-professionnels' : '/projets'
}

export default function NavItem({ item, className = '', onClick }) {
  const { pathname } = useLocation()
  if (item.href)
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center gap-1 ${className}`} onClick={onClick}>
        <span className="link-underline">{item.label}</span>
        <ArrowUpRight aria-hidden="true" className="h-[0.8em] w-[0.8em] opacity-60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        <span className="sr-only">{t.nouvel_onglet}</span>
      </a>
    )
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => {
        const rubrique = rubriqueActive(pathname)
        const actif = rubrique ? rubrique === item.to : isActive
        return `${className} ${actif ? 'text-accent' : ''}`
      }}
    >
      <span className="link-underline">{item.label}</span>
    </NavLink>
  )
}
