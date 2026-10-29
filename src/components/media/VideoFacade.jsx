import { useState } from 'react'
import { Play } from 'lucide-react'
import Picture from './Picture.jsx'
import { parseVideo } from './video.js'
import { t } from '../../lib/content.js'

/**
 * Façade vidéo : affiche une miniature + bouton lecture ; le lecteur (iframe
 * YouTube / Vimeo / Adobe) n'est chargé qu'au clic → page beaucoup plus légère.
 */
export default function VideoFacade({ video, fallbackImage, title, priority = false, sizes }) {
  const [playing, setPlaying] = useState(false)
  const info = parseVideo(video.url)
  const vertical = video.format === '9:16'
  const label = video.titre || title

  const frame = vertical
    ? 'aspect-[9/16] w-full max-w-[min(100%,26rem)] mx-auto'
    : 'aspect-video w-full'

  // Lien non reconnu : simple lien externe
  if (!info)
    return (
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="link-underline text-accent">
        {label} ↗
      </a>
    )

  return (
    <div className={`relative overflow-hidden bg-black ${frame}`}>
      {playing ? (
        <iframe
          src={info.embed}
          title={label}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full text-left"
          aria-label={`${t.lire_video} : ${label}`}
        >
          <Picture
            src={video.miniature || fallbackImage}
            alt=""
            priority={priority}
            sizes={sizes || (vertical ? '(min-width: 768px) 26rem, 100vw' : '(min-width: 1440px) 1300px, 100vw')}
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover opacity-85 transition duration-[1.2s] ease-cine group-hover:scale-[1.03] group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-sm transition duration-500 ease-cine group-hover:scale-110 group-hover:border-[rgb(226_164_90)] group-hover:text-[rgb(226_164_90)] md:h-20 md:w-20">
              <Play aria-hidden="true" className="ml-1 h-6 w-6 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-4 font-mono text-[12px] uppercase tracking-label text-white/85 md:p-6">
            <span>{t.lire_video}</span>
            {video.duree && <span>TC {video.duree}</span>}
          </span>
        </button>
      )}
    </div>
  )
}
