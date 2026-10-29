import { useEffect, useRef, useState } from 'react'

/**
 * Apparition douce au scroll (IntersectionObserver).
 * Sans JS ou avec prefers-reduced-motion, le contenu est visible immédiatement (cf. CSS .reveal).
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { '--delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
