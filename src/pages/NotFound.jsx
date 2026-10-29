import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader.jsx'
import { t } from '../lib/content.js'

export default function NotFound() {
  return (
    <PageHeader kicker="404" title={t.introuvable_titre} intro={t.introuvable_texte}>
      <Link to="/" className="label link-underline mt-10 inline-block hover:text-accent">← {t.nav_accueil}</Link>
    </PageHeader>
  )
}
