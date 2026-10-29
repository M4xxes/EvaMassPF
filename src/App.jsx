import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Projets from './pages/Projets.jsx'
import Categorie from './pages/Categorie.jsx'
import Projet from './pages/Projet.jsx'
import Pro from './pages/Pro.jsx'
import Experience from './pages/Experience.jsx'
import APropos from './pages/APropos.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

/** Routes : les pages catégorie et détail sont génériques → tout nouveau contenu du CMS a son URL. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projets" element={<Projets />} />
        <Route path="projets/:categorie" element={<Categorie />} />
        <Route path="projets/:categorie/:slug" element={<Projet />} />
        <Route path="projets-professionnels" element={<Pro />} />
        <Route path="experience" element={<Experience />} />
        <Route path="a-propos" element={<APropos />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
