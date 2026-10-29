import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import NavItem from './NavItem.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import SocialLinks from '../ui/SocialLinks.jsx'
import { navItems } from './nav.js'
import { site, t } from '../../lib/content.js'

export default function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const items = navItems()
  const overHero = pathname === '/' && !scrolled && !open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ferme le menu mobile au changement de page
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Menu mobile : Échap pour fermer + blocage du scroll
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && (setOpen(false), toggleRef.current?.focus())
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500 ${
        overHero
          ? 'border-b border-transparent text-white'
          : 'border-b border-line/60 bg-bg/80 text-fg backdrop-blur-md'
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="font-serif text-[1.65rem] leading-none tracking-tight md:text-3xl" aria-label={`${site.nom} — ${t.nav_accueil}`}>
          {site.nom}
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-[13px] lg:flex">
          {items.map((item) => (
            <NavItem key={item.label} item={item} className="py-2 transition-colors hover:text-accent" />
          ))}
          <ThemeToggle className="-mr-3" />
        </nav>

        <div className="flex items-center lg:hidden">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? t.fermer : t.menu}
            className="-mr-2 grid h-11 w-11 place-items-center"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>

      {/* Hors du <header> : son backdrop-filter piégerait ce panneau en position fixe */}
      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigation principale"
          className="page-enter fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col justify-between overflow-y-auto bg-bg px-4 pb-8 pt-6 text-fg md:top-20 md:px-8"
        >
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={item.label} className="page-enter" style={{ animationDelay: `${i * 60}ms` }}>
                <NavItem item={item} className="block py-2 font-serif text-[2.6rem] leading-tight" />
              </li>
            ))}
          </ul>
          <SocialLinks className="-ml-2 mt-10" />
        </nav>
      )}
    </>
  )
}
