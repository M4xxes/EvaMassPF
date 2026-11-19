import { ArrowUpRight, Download } from 'lucide-react'
import { cvUrl, t } from '../../lib/content.js'

/**
 * Bouton vers le CV d'Eva (Réglages → Accueil → « CV »).
 * N'affiche rien si aucun CV n'est renseigné.
 * @param {'voir'|'telecharger'} action  « Voir mon CV » (nouvel onglet) ou « Télécharger mon CV »
 */
export default function CvButton({ action = 'voir', className = '' }) {
  const url = cvUrl()
  if (!url) return null
  const externe = /^https?:\/\//.test(url)
  // L'attribut download ne fonctionne que pour un PDF hébergé sur le site
  const telecharger = action === 'telecharger' && !externe
  const Icon = telecharger ? Download : ArrowUpRight

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      {...(telecharger ? { download: '' } : {})}
      className={`group inline-flex min-h-11 items-center gap-3 rounded-full border border-line px-6 py-3 font-mono text-[12px] uppercase tracking-label transition hover:border-accent hover:text-accent ${className}`}
    >
      {action === 'telecharger' ? t.telecharger_cv : t.voir_cv}
      <Icon aria-hidden="true" className="h-4 w-4 transition group-hover:-translate-y-0.5" />
      <span className="sr-only">{t.nouvel_onglet}</span>
    </a>
  )
}
