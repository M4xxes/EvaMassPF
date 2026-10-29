import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
// Polices auto-hébergées (pas de requête bloquante vers Google Fonts)
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/geist/index.css'
import '@fontsource/geist-mono/400.css'
import './styles/index.css'

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')
// En production les pages sont pré-rendues (HTML statique) → on « hydrate ».
// En développement le conteneur est vide → rendu classique.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
