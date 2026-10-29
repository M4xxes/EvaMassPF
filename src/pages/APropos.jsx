import { Link } from 'react-router-dom'
import Picture from '../components/media/Picture.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import SocialLinks from '../components/ui/SocialLinks.jsx'
import { aPropos, t, clean } from '../lib/content.js'

/** À propos : photo d'Eva (optionnelle) + bio, éditables dans le CMS. */
export default function APropos() {
  const photo = clean(aPropos.photo)
  return (
    <section className={`container-site pt-32 md:pt-44 ${photo ? 'grid gap-12 md:grid-cols-[5fr_7fr] md:gap-20' : ''}`}>
      {photo && (
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-surface md:sticky md:top-28 md:self-start">
          <Picture src={photo} alt={clean(aPropos.photo_alt)} priority sizes="(min-width: 768px) 40vw, 100vw" className="absolute inset-0" imgClassName="h-full w-full object-cover" />
        </Reveal>
      )}
      <div>
        <Reveal as="p" className="label mb-5">{t.nav_apropos}</Reveal>
        <Reveal as="h1" delay={80} className="text-[clamp(3rem,9vw,8.5rem)]">{aPropos.titre}</Reveal>
        <Reveal as="p" delay={160} className="mt-10 max-w-[30ch] font-serif text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.12]">
          {clean(aPropos.bio)}
        </Reveal>
        <Reveal delay={240} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link to="/contact" className="label link-underline hover:text-accent">{t.nav_contact} →</Link>
          <SocialLinks className="-ml-2" />
        </Reveal>
      </div>
    </section>
  )
}
