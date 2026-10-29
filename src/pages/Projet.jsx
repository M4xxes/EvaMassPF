import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import Picture from '../components/media/Picture.jsx'
import VideoFacade from '../components/media/VideoFacade.jsx'
import MasonryGrid from '../components/media/MasonryGrid.jsx'
import TechSheet from '../components/project/TechSheet.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import NotFound from './NotFound.jsx'
import { t, clean, toHtml, getProjet, getCategorie, categorieUrl, projetUrl, voisins } from '../lib/content.js'

/** Page détail d'un projet : vidéo(s), fiche technique, description, galerie, liens. */
export default function Projet() {
  const { categorie, slug } = useParams()
  const p = getProjet(categorie, slug)
  if (!p) return <NotFound />
  const cat = getCategorie(p.categorie)
  const html = toHtml(p.description)
  const { precedent, suivant } = voisins(p)
  const [main, ...autres] = p.videos
  // Vidéos verticales (format 9:16) : mise en page côte à côte avec le texte
  const vertical = main?.format === '9:16'

  return (
    <article>
      <header className="container-site pt-28 md:pt-36">
        <Reveal as="p" className="label mb-6">
          <Link to={categorieUrl(cat)} className="link-underline hover:text-accent">← {cat?.nom}</Link>
        </Reveal>
        <Reveal as="h1" delay={80} className="max-w-[18ch] text-[clamp(3rem,8.5vw,8rem)]">{p.titre}</Reveal>
        {clean(p.credit) && <Reveal as="p" delay={140} className="mt-4 font-mono text-xs uppercase tracking-label text-muted">{p.credit}</Reveal>}
      </header>

      <div className={`container-site mt-10 md:mt-16 ${vertical ? 'grid gap-12 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start md:gap-16' : ''}`}>
        <Reveal delay={120}>
          {main ? (
            <VideoFacade video={main} fallbackImage={p.couverture} title={p.titre} priority />
          ) : (
            <div className={`relative overflow-hidden bg-surface ${p.galerie.length ? 'aspect-[16/9]' : ''}`}>
              <Picture
                src={p.couverture}
                alt={`${p.titre} — ${cat?.nom}`}
                priority
                sizes="(min-width: 1440px) 1300px, 100vw"
                className={p.galerie.length ? 'absolute inset-0' : ''}
                imgClassName={p.galerie.length ? 'h-full w-full object-cover' : 'mx-auto max-h-[85svh] w-auto'}
              />
            </div>
          )}
        </Reveal>

        <div className={vertical ? '' : 'mt-12 md:mt-16'}>
          <Reveal><TechSheet projet={p} /></Reveal>
          {html && <Reveal className="prose-cine mt-10 md:mt-14" dangerouslySetInnerHTML={{ __html: html }} />}
          {!html && clean(p.resume) && <Reveal as="p" className="prose-cine mt-10">{p.resume}</Reveal>}

          {p.liens.length > 0 && (
            <Reveal className="mt-12">
              <h2 className="label mb-4">{t.liens}</h2>
              <ul className="border-t border-line">
                {p.liens.map((l) => (
                  <li key={l.url} className="border-b border-line">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4 hover:text-accent">
                      <span className="link-underline">{l.titre || l.url}</span>
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">{t.nouvel_onglet}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      {autres.length > 0 && (
        <div className="container-site mt-16 grid gap-8 md:grid-cols-2">
          {autres.map((v, i) => (
            <Reveal key={v.url} delay={i * 100}><VideoFacade video={v} fallbackImage={p.couverture} title={p.titre} /></Reveal>
          ))}
        </div>
      )}

      {p.galerie.length > 0 && (
        <section className="container-site mt-20 md:mt-28" aria-label={t.galerie}>
          <MasonryGrid images={p.galerie} title={p.titre} />
        </section>
      )}

      {(precedent || suivant) && (
        <nav aria-label={`${t.precedent} / ${t.suivant}`} className="container-site mt-28 grid grid-cols-2 border-t border-line">
          {[precedent, suivant].map((x, i) =>
            x ? (
              <Link key={x.slug} to={projetUrl(x)} className={`group py-8 md:py-12 ${i ? 'border-l border-line pl-4 text-right md:pl-8' : 'pr-4 md:pr-8'}`}>
                <span className={`label flex items-center gap-2 ${i ? 'justify-end' : ''}`}>
                  {!i && <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />}
                  {i ? t.suivant : t.precedent}
                  {!!i && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />}
                </span>
                <span className="mt-3 block font-serif text-[clamp(1.6rem,3.4vw,3rem)] leading-none transition-colors group-hover:text-accent">{x.titre}</span>
              </Link>
            ) : (
              <span key={i} className={i ? 'border-l border-line' : ''} />
            ),
          )}
        </nav>
      )}
    </article>
  )
}
