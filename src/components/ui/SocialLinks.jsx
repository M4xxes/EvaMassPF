import SocialIcon from './SocialIcon.jsx'
import { reseaux, t } from '../../lib/content.js'

/** Liens réseaux sociaux (gérés dans le CMS → Réglages → Réseaux sociaux). */
export default function SocialLinks({ className = '', iconClass = 'h-6 w-7', withLabels = false }) {
  return (
    <ul className={`flex flex-wrap items-center gap-1 ${className}`}>
      {reseaux.map((r) => {
        const isMail = r.url.startsWith('mailto:')
        return (
          <li key={r.nom}>
            <a
              href={r.url}
              // Les liens web s'ouvrent dans un nouvel onglet ; un mailto ouvre directement la messagerie.
              {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              aria-label={withLabels ? undefined : `${r.nom}${isMail ? '' : ` ${t.nouvel_onglet}`}`}
              className="group inline-flex min-h-11 min-w-11 items-center gap-3 rounded-full px-2 text-muted transition hover:text-accent"
            >
              <SocialIcon name={r.icone} className={iconClass} />
              {withLabels && <span className="link-underline text-fg group-hover:text-accent">{r.nom}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
