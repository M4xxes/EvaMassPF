/**
 * Aperçus en direct dans le CMS : Eva voit le rendu (typographies, couleurs,
 * fiche technique, vidéos, galerie) pendant qu'elle remplit le formulaire.
 * Écrit sans build (h = React.createElement fourni par Decap).
 */
/* global CMS, h, createClass, marked */
CMS.registerPreviewStyle('/admin/preview.css')

const asset = (getAsset, path) => (path ? String(getAsset(path)) : '')
const ytId = (url = '') => (url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|youtube\.com\/)([\w-]{11})/) || [])[1]
const md = (s) => ({ __html: s && !s.startsWith('TODO:') ? marked.parse(s, { breaks: true }) : '' })
const todo = (s) => (s && String(s).trim().startsWith('TODO:') ? h('p', { className: 'todo' }, s) : null)

const ProjetPreview = createClass({
  render() {
    const { entry, getAsset } = this.props
    const d = entry.get('data').toJS()
    const videos = d.videos || []
    const galerie = d.galerie || []
    const v = videos[0]
    const thumb = v && (asset(getAsset, v.miniature) || (ytId(v.url) && `https://i.ytimg.com/vi/${ytId(v.url)}/hqdefault.jpg`))
    const fiche = [
      ['Catégorie', d.categorie],
      ['Rôle', (d.roles || []).join(' · ')],
      ['Année', d.date && String(d.date).slice(0, 4)],
      ['Durée', v && v.duree],
      ['Format', v && v.format],
    ].filter((r) => r[1])

    return h('article', { className: 'wrap' },
      h('p', { className: 'label' }, '← ', d.categorie || 'catégorie'),
      h('h1', null, d.titre || 'Titre du projet'),
      d.credit && h('p', { className: 'label' }, d.credit),
      todo(d.resume),
      h('div', { className: `media ${v && v.format === '9:16' ? 'vertical' : ''}` },
        thumb || d.couverture
          ? h('img', { src: thumb || asset(getAsset, d.couverture), alt: '' })
          : h('div', { className: 'empty' }, 'Image de couverture'),
        v && h('span', { className: 'play' }, '▶'),
      ),
      h('dl', { className: 'fiche' }, fiche.map(([k, val]) => h('div', { key: k }, h('dt', null, k), h('dd', null, val)))),
      h('div', { className: 'prose', dangerouslySetInnerHTML: md(d.description || d.resume) }),
      galerie.length > 0 && h('div', { className: 'galerie' },
        galerie.map((g, i) => g.image && h('figure', { key: i },
          h('img', { src: asset(getAsset, g.image), alt: g.legende || '' }),
          g.legende && h('figcaption', { className: 'label' }, g.legende)))),
      (d.liens || []).length > 0 && h('ul', { className: 'liens' },
        d.liens.map((l, i) => h('li', { key: i }, (l.titre || l.url) + ' ↗'))),
      h('p', { className: 'label note' }, d.mis_en_avant ? '★ Mis en avant sur l’accueil' : ''),
    )
  },
})

const CategoriePreview = createClass({
  render() {
    const { entry, getAsset } = this.props
    const d = entry.get('data').toJS()
    return h('div', { className: 'wrap' },
      h('div', { className: 'card' },
        d.couverture ? h('img', { src: asset(getAsset, d.couverture), alt: '' }) : h('div', { className: 'empty' }),
        h('div', { className: 'card-txt' }, h('h2', null, d.nom || 'Nom'), h('p', { className: 'label' }, d.roles_affiches || ''))),
      todo(d.description),
      d.description && !todo(d.description) && h('p', { className: 'prose' }, d.description),
    )
  },
})

const AProposPreview = createClass({
  render() {
    const { entry, getAsset } = this.props
    const d = entry.get('data').toJS()
    return h('div', { className: 'wrap apropos' },
      d.photo ? h('img', { src: asset(getAsset, d.photo), alt: d.photo_alt || '' }) : h('div', { className: 'empty' }, 'Photo d’Eva'),
      h('div', null, h('p', { className: 'label' }, 'À propos'), h('h1', null, d.titre), h('p', { className: 'bio' }, d.bio)),
    )
  },
})

const ExperiencePreview = createClass({
  render() {
    const d = this.props.entry.get('data').toJS()
    const f = (x) => (x ? new Date(x).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '')
    return h('div', { className: 'wrap timeline' },
      h('p', { className: 'label' }, f(d.debut), ' — ', d.en_cours ? "aujourd'hui" : f(d.fin)),
      h('h2', null, d.poste || 'Poste'),
      h('p', { className: 'muted' }, d.structure),
      h('div', { className: 'prose', dangerouslySetInnerHTML: md(d.description) }),
    )
  },
})

CMS.registerPreviewTemplate('projets', ProjetPreview)
CMS.registerPreviewTemplate('categories', CategoriePreview)
CMS.registerPreviewTemplate('a-propos', AProposPreview)
CMS.registerPreviewTemplate('experiences', ExperiencePreview)
