import { useState } from 'react'
import Picture from './Picture.jsx'
import Lightbox from './Lightbox.jsx'
import Reveal from '../ui/Reveal.jsx'

/** Galerie en colonnes (masonry CSS) ; chaque image ouvre la visionneuse. */
export default function MasonryGrid({ images, title }) {
  const [open, setOpen] = useState(null)
  return (
    <>
      <ul className="columns-1 gap-3 sm:columns-2 md:gap-4 lg:columns-3">
        {images.map((g, i) => (
          <Reveal as="li" key={g.image + i} delay={(i % 3) * 90} className="mb-3 break-inside-avoid md:mb-4">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden bg-surface"
              aria-label={g.legende || `${title} — ${i + 1}`}
            >
              <Picture
                src={g.image}
                alt={g.legende || `${title} — image ${i + 1}`}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                imgClassName="h-auto w-full transition duration-[1.2s] ease-cine group-hover:scale-[1.03]"
              />
            </button>
            {g.legende && <p className="label mt-2">{g.legende}</p>}
          </Reveal>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onChange={setOpen} onClose={() => setOpen(null)} title={title} />}
    </>
  )
}
