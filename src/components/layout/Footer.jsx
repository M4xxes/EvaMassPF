import { Link } from 'react-router-dom'
import SocialLinks from '../ui/SocialLinks.jsx'
import NavItem from './NavItem.jsx'
import { navItems } from './nav.js'
import { site, t, clean } from '../../lib/content.js'

export default function Footer() {
  const email = clean(site.email_contact)
  return (
    <footer className="mt-32 border-t border-line">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
        <div>
          <p className="label mb-6">{t.nav_contact}</p>
          {email && (
            <a href={`mailto:${email}`} className="link-underline break-all font-serif text-[clamp(1.9rem,4.5vw,4rem)] leading-none hover:text-accent">
              {email}
            </a>
          )}
          <SocialLinks className="-ml-2 mt-8" />
        </div>
        <nav aria-label="Pied de page" className="md:justify-self-end">
          <ul className="space-y-2 text-[15px]">
            {navItems().map((item) => (
              <li key={item.label}>
                <NavItem item={item} className="text-muted transition-colors hover:text-fg" />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-site flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
        <Link to="/" className="font-serif text-xl">{site.nom}</Link>
        <p className="label">© {new Date().getFullYear()} — {clean(site.sous_titre)}</p>
      </div>
    </footer>
  )
}
