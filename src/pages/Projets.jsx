import PageHeader from '../components/ui/PageHeader.jsx'
import CategoryCard from '../components/project/CategoryCard.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { t, clean, categoriesDe } from '../lib/content.js'

/** Projets scolaires : une carte par catégorie (catégories gérées dans le CMS). */
export default function Projets() {
  const cats = categoriesDe('scolaire')
  return (
    <>
      <PageHeader kicker={`${String(cats.length).padStart(2, '0')} — ${t.nav_scolaires}`} title={t.titre_categories} intro={clean(t.intro_scolaires)} />
      <ul className="container-site grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <Reveal as="li" key={c.slug} delay={(i % 3) * 100}>
            <CategoryCard categorie={c} index={i} priority={i < 3} />
          </Reveal>
        ))}
      </ul>
    </>
  )
}
