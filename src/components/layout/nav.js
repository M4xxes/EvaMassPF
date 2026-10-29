import { site, t, experiences, clean } from '../../lib/content.js'

/** Entrées du menu. « Expérience » n'apparaît que si au moins une expérience existe dans le CMS. */
export const navItems = () =>
  [
    { to: '/projets', label: t.nav_scolaires },
    { to: '/projets-professionnels', label: t.nav_pro },
    clean(site.lien_photographie) && { href: site.lien_photographie, label: t.nav_photo },
    experiences.length > 0 && { to: '/experience', label: t.nav_experience },
    { to: '/a-propos', label: t.nav_apropos },
    { to: '/contact', label: t.nav_contact },
  ].filter(Boolean)
