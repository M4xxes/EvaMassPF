import { useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Picture from './Picture.jsx'
import { t } from '../../lib/content.js'

/**
 * Visionneuse plein écran : clavier (← → Échap), swipe mobile, focus piégé
 * dans la boîte de dialogue puis rendu à l'élément d'origine à la fermeture.
 */
export default function Lightbox({ images, index, onClose, onChange, title }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const touch = useRef(null)
  const n = images.length

  const go = useCallback((d) => onChange((index + d + n) % n), [index, n, onChange])

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // Piège à focus
        const f = dialogRef.current.querySelectorAll('button')
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const current = images[index]
  const btn = 'grid h-12 w-12 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white'

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 text-white backdrop-blur-sm page-enter"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <div className="flex items-center justify-between p-3 md:p-5">
        <p className="font-mono text-[12px] uppercase tracking-label text-white/70" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className={btn} aria-label={t.fermer}>
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Picture
          key={current.image}
          src={current.image}
          alt={current.legende || `${title} — ${index + 1}`}
          sizes="100vw"
          priority
          className="contents"
          imgClassName="max-h-full max-w-full object-contain page-enter"
        />
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${btn} absolute left-2 top-1/2 hidden -translate-y-1/2 md:grid`} aria-label={t.image_precedente}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} className={`${btn} absolute right-2 top-1/2 hidden -translate-y-1/2 md:grid`} aria-label={t.image_suivante}>
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <p className="min-h-[3.5rem] px-4 py-4 text-center text-sm text-white/75">{current.legende}</p>
    </div>
  )
}
