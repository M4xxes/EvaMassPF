import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import ProjectCard from '../components/project/ProjectCard.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import NotFound from './NotFound.jsx'
import { t, clean, getCategorie, projetsDe } from '../lib/content.js'

/** Page d'une catégorie : liste automatiquement tous les projets rattachés à cette catégorie. */
export default function Categorie() {
  const { categorie } = useParams()
  const cat = getCategorie(categorie)
  if (!cat) return <NotFound />
  const list = projetsDe(cat.slug)
  const back = cat.rubrique === 'professionnel' ? { to: '/projets-professionnels', label: t.nav_pro } : { to: '/projets', label: t.nav_scolaires }

  return (
    <>
      <PageHeader
        kicker={<Link to={back.to} className="link-underline hover:text-accent">← {back.label}</Link>}
        title={cat.nom}
        intro={clean(cat.description)}
      >
        {clean(cat.roles_affiches) && (
          <Reveal as="p" delay={200} className="label mt-6 text-accent">{cat.roles_affiches}</Reveal>
        )}
      </PageHeader>

      <div className="container-site">
        {list.length ? (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={(i % 3) * 100}>
                <ProjectCard projet={p} showCategory={false} priority={i < 3} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <p className="border-t border-line pt-8 text-muted">{t.aucun_projet}</p>
        )}
      </div>
    </>
  )
}
