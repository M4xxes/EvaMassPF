import PageHeader from '../components/ui/PageHeader.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import SocialLinks from '../components/ui/SocialLinks.jsx'
import { site, t, clean } from '../lib/content.js'

/** Contact : email en grand + réseaux sociaux avec leur nom. */
export default function Contact() {
  const email = clean(site.email_contact)
  return (
    <>
      <PageHeader kicker={t.nav_contact} title={t.titre_contact} intro={clean(t.intro_contact)} />
      <div className="container-site">
        {email && (
          <Reveal>
            <a href={`mailto:${email}`} className="link-underline break-all font-serif text-[clamp(2rem,6.5vw,6rem)] leading-none hover:text-accent">
              {email}
            </a>
          </Reveal>
        )}
        <Reveal delay={120} className="mt-14 border-t border-line pt-8">
          <SocialLinks withLabels iconClass="h-7 w-8" className="-ml-2 gap-x-8 gap-y-3 text-lg" />
        </Reveal>
      </div>
    </>
  )
}
