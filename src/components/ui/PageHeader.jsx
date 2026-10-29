import Reveal from './Reveal.jsx'

/** En-tête de page éditorial : surtitre mono, grand titre serif, chapô. */
export default function PageHeader({ kicker, title, intro, children }) {
  return (
    <header className="container-site pb-10 pt-32 md:pb-16 md:pt-44">
      {kicker && <Reveal as="p" className="label mb-5">{kicker}</Reveal>}
      <Reveal as="h1" delay={80} className="max-w-[16ch] text-[clamp(3rem,9vw,8.5rem)]">
        {title}
      </Reveal>
      {intro && (
        <Reveal as="p" delay={160} className="mt-8 max-w-[56ch] text-lg text-muted">
          {intro}
        </Reveal>
      )}
      {children}
    </header>
  )
}
