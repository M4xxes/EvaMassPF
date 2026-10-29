import { useEffect } from 'react'
import { getSeo } from './seo.js'

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Met à jour title / description lors de la navigation côté navigateur.
 * (L'image Open Graph est déjà dans le HTML pré-rendu de chaque page, seul lu par les réseaux sociaux.)
 */
export function useSeo(pathname) {
  useEffect(() => {
    const seo = getSeo(pathname)
    document.title = seo.title
    setMeta('name', 'description', seo.description)
    setMeta('property', 'og:title', seo.title)
    setMeta('property', 'og:description', seo.description)
    setMeta('property', 'og:url', window.location.href)
  }, [pathname])
}
