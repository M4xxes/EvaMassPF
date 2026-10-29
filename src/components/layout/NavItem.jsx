import { NavLink } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { t } from '../../lib/content.js'

/** Lien de menu : interne (NavLink, état actif) ou externe (nouvel onglet). */
export default function NavItem({ item, className = '', onClick }) {
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
      className={({ isActive }) => `${className} ${isActive ? 'text-accent' : ''}`}
    >
      <span className="link-underline">{item.label}</span>
    </NavLink>
  )
}
