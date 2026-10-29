import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import { useSeo } from '../../lib/useSeo.js'
import { t } from '../../lib/content.js'

export default function Layout() {
  const { pathname } = useLocation()
  useSeo(pathname)

  // Retour en haut de page à chaque navigation
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="grain flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only z-[80] bg-accent px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t.aller_contenu}
      </a>
      <Header />
      {/* key = pathname → l'animation d'entrée rejoue à chaque changement de page */}
      <main id="contenu" key={pathname} className="page-enter flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
