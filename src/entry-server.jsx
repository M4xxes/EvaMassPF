/**
 * Entrée de pré-rendu (utilisée uniquement au build par scripts/prerender.mjs) :
 * génère le HTML de chaque page pour le SEO et un affichage instantané.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

export { allRoutes } from './lib/content.js'
export { getSeo } from './lib/seo.js'
export { ogImageUrl } from './lib/og.js'
export { site } from './lib/content.js'

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
