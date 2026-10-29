import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Picture from '../components/media/Picture.jsx'
import ProjectCard from '../components/project/ProjectCard.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { getFileUrl, getPicture } from '../lib/images.js'
import { site, t, aPropos, clean, projetsMisEnAvant, categoriesDe, categorieUrl } from '../lib/content.js'

/* Mise en page éditoriale de la sélection : alternance grand / petit formats */
const layout = [
  { col: 'md:col-span-7', ratio: 'landscape' },
  { col: 'md:col-span-5 md:mt-40', ratio: 'portrait' },
  { col: 'md:col-span-5', ratio: 'portrait' },
  { col: 'md:col-span-7 md:mt-24', ratio: 'landscape' },
]

function Hero() {
  const [open, setOpen] = useState(false)
  const video = getFileUrl(site.video_hero)
  const poster = getPicture(site.image_hero)?.img.src

  // Ouverture des bandes letterbox juste après l'affichage
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className={`letterbox relative flex h-[100svh] min-h-[34rem] items-end overflow-hidden bg-black text-white ${open ? 'is-open' : ''}`}>
      <div className="absolute inset-0">
        {video ? (
          <video src={video} poster={poster} autoPlay muted loop playsInline aria-hidden="true" className="h-full w-full object-cover opacity-80" />
        ) : (
          <Picture
            src={site.image_hero}
            alt={clean(site.image_hero_alt)}
            priority
            // En portrait l'image (16:9) est fortement recadrée : il faut une version plus large que l'écran
            sizes="(orientation: portrait) 180vh, 100vw"
            className="absolute inset-0"
            imgClassName="kenburns h-full w-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
      </div>

      <div className="container-site relative z-10 pb-[12svh] md:pb-[14svh]">
        <h1 className="text-[clamp(4.2rem,15vw,15rem)] leading-[0.85]">
          {site.nom.split(' ').map((w, i) => (
            <span key={i} className={`block ${i ? 'italic text-[rgb(226_164_90)]' : ''}`}>{w}</span>
          ))}
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/85 md:text-sm">{site.sous_titre}</p>
          <a href="#selection" className="group hidden items-center gap-3 font-mono text-[12px] uppercase tracking-label text-white/75 hover:text-white md:flex">
            {t.faire_defiler}
            <ArrowDown aria-hidden="true" className="h-4 w-4 transition group-hover:translate-y-1" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const featured = projetsMisEnAvant()
  const cats = categoriesDe('scolaire')
  return (
    <>
      <Hero />

      {featured.length > 0 && (
        <section id="selection" className="container-site scroll-mt-24 pt-24 md:pt-40" aria-labelledby="titre-selection">
          <div className="mb-12 flex items-end justify-between gap-6 md:mb-20">
            <Reveal as="h2" id="titre-selection" className="text-[clamp(2.8rem,7vw,6rem)]">{t.titre_selection}</Reveal>
            <Link to="/projets" className="label link-underline mb-3 hover:text-accent">{t.voir_tout} →</Link>
          </div>
          <ul className="grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-24">
            {featured.map((p, i) => {
              const l = layout[i % layout.length]
              return (
                <Reveal as="li" key={p.slug} className={l.col} delay={(i % 2) * 120}>
                  <ProjectCard projet={p} ratio={l.ratio} sizes="(min-width: 768px) 58vw, 100vw" headingLevel="h3" />
                </Reveal>
              )
            })}
          </ul>
        </section>
      )}

      {/* Index des catégories, façon générique de film */}
      <section className="container-site pt-32 md:pt-48" aria-labelledby="titre-categories">
        <Reveal as="h2" id="titre-categories" className="mb-10 text-[clamp(2.8rem,7vw,6rem)]">{t.titre_categories}</Reveal>
        <ul className="border-t border-line">
          {cats.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 50} className="border-b border-line">
              <Link to={categorieUrl(c)} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 md:grid-cols-[4rem_1fr_1fr_auto] md:py-8">
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-serif text-[clamp(1.9rem,4vw,3.4rem)] leading-none transition duration-500 ease-cine group-hover:translate-x-2 group-hover:text-accent">
                  {c.nom}
                </span>
                <span className="label hidden md:block">{clean(c.roles_affiches)}</span>
                <ArrowRight aria-hidden="true" className="h-5 w-5 text-muted transition duration-500 ease-cine group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {clean(aPropos.bio) && (
        <section className="container-site pt-32 md:pt-48" aria-labelledby="titre-apropos">
          <Reveal as="h2" id="titre-apropos" className="label mb-8">{aPropos.titre}</Reveal>
          <Reveal as="p" delay={100} className="max-w-[28ch] font-serif text-[clamp(2rem,4.4vw,4rem)] leading-[1.08]">
            {aPropos.bio}
          </Reveal>
          <Reveal delay={200} className="mt-10">
            <Link to="/a-propos" className="label link-underline hover:text-accent">{aPropos.titre} →</Link>
          </Reveal>
        </section>
      )}
    </>
  )
}
