import { ArrowUpRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { t, clean, toHtml, experiences } from '../lib/content.js'

const fmt = (d) => {
  if (!clean(String(d || ''))) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return String(d)
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

/** Expérience professionnelle : frise chronologique (collection « Expérience » du CMS). */
export default function Experience() {
  return (
    <>
      <PageHeader kicker={t.nav_experience} title={t.titre_experience} />
      <div className="container-site">
        {experiences.length === 0 ? (
          <p className="border-t border-line pt-8 text-muted">{t.aucune_experience}</p>
        ) : (
          <ol className="relative border-l border-line pl-6 md:ml-[11rem] md:pl-10">
            {experiences.map((e, i) => (
              <Reveal as="li" key={e.slug} delay={i * 60} className="relative pb-14 last:pb-0">
                <span aria-hidden="true" className="absolute -left-[calc(1.5rem+4.5px)] top-2 h-2 w-2 rounded-full bg-accent md:-left-[calc(2.5rem+4.5px)]" />
                <p className="label md:absolute md:-left-[13.5rem] md:top-1 md:w-40 md:text-right">
                  {fmt(e.debut)} — {e.en_cours ? t.en_cours : fmt(e.fin)}
                </p>
                <h2 className="mt-2 text-[clamp(1.9rem,3.6vw,3rem)] md:mt-0">{e.poste}</h2>
                <p className="mt-2 text-muted">{e.structure}</p>
                {toHtml(e.description) && <div className="prose-cine mt-5 !text-base" dangerouslySetInnerHTML={{ __html: toHtml(e.description) }} />}
                {clean(e.lien) && (
                  <a href={e.lien} target="_blank" rel="noopener noreferrer" className="label mt-4 inline-flex items-center gap-1 hover:text-accent">
                    {e.structure} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">{t.nouvel_onglet}</span>
                  </a>
                )}
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}
