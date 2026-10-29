import { Moon, Sun } from 'lucide-react'
import { t } from '../../lib/content.js'

/** Bascule clair / sombre (préférence mémorisée). Les deux icônes sont rendues ; le CSS affiche la bonne. */
export default function ThemeToggle({ className = '' }) {
  const toggle = () => {
    const d = document.documentElement
    const next = d.dataset.theme === 'light' ? 'dark' : 'light'
    d.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f3f0ea' : '#0b0b0c')
    try { localStorage.setItem('theme', next) } catch (e) { /* stockage indisponible : préférence non mémorisée */ }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.theme}
      className={`grid h-11 w-11 place-items-center rounded-full text-current transition hover:text-accent ${className}`}
    >
      <Sun aria-hidden="true" className="theme-icon-sun h-[18px] w-[18px]" />
      <Moon aria-hidden="true" className="theme-icon-moon h-[18px] w-[18px]" />
    </button>
  )
}
