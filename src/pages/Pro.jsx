import { ArrowUpRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import ProjectCard from '../components/project/ProjectCard.jsx'
import CategoryCard from '../components/project/CategoryCard.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { t, pro, clean, projetsProPerso, categoriesDe } from '../lib/content.js'

/**
 * Projets professionnels / personnels :
 * - projets marqués « professionnel » ou « personnel » dans le CMS ;
 * - catégories de la rubrique « professionnel » (ex. Stages) dès qu'elles contiennent un projet ;
 * - liens vers les autres sites (Evasive, Evastre Photographie…).
 */
export default function Pro() {
  const projets = projetsProPerso()
  const cats = categoriesDe('professionnel', { nonVides: true })
  const liens = (pro.liens || []).filter((l) => clean(l.url))

  return (
    <>
      <PageHeader kicker={t.nav_pro} title={pro.titre} intro={clean(pro.intro)} />

      {projets.length > 0 && (
        <ul className="container-site grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {projets.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 3) * 100}><ProjectCard projet={p} /></Reveal>
          ))}
        </ul>
      )}

      {cats.length > 0 && (
        <ul className="container-site mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 3) * 100}><CategoryCard categorie={c} index={i} /></Reveal>
          ))}
        </ul>
      )}

      {liens.length > 0 && (
        <section className="container-site mt-16" aria-labelledby="titre-sites">
          <h2 id="titre-sites" className="label mb-6">{t.sites}</h2>
          <ul className="border-t border-line">
            {liens.map((l, i) => (
              <Reveal as="li" key={l.url} delay={i * 80} className="border-b border-line">
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[1fr_auto] items-center gap-6 py-8 md:grid-cols-[1fr_1fr_auto] md:py-12">
                  <span className="font-serif text-[clamp(2.4rem,6vw,5.5rem)] leading-none transition duration-500 ease-cine group-hover:translate-x-2 group-hover:text-accent">{l.titre}</span>
                  <span className="hidden text-muted md:block">{clean(l.description)}</span>
                  <ArrowUpRight aria-hidden="true" className="h-7 w-7 text-muted transition duration-500 ease-cine group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                  <span className="sr-only">{t.nouvel_onglet}</span>
                </a>
                {clean(l.description) && <p className="-mt-5 pb-6 text-sm text-muted md:hidden">{l.description}</p>}
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
