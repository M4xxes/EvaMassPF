/**
 * Reconnaît un lien vidéo collé dans le CMS et renvoie l'URL d'intégration.
 * Fournisseurs gérés : YouTube, Vimeo et le lecteur Adobe (vidéos de l'ancien
 * site Adobe Portfolio).
 */
export function parseVideo(url = '') {
  const u = url.trim()
  let m
  // YouTube : watch?v=, youtu.be/, /embed/, /shorts/, youtube.com/ID
  if ((m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)?|youtu\.be\/)([\w-]{11})/)))
    return {
      provider: 'youtube',
      id: m[1],
      embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1`,
    }
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/)))
    return {
      provider: 'vimeo',
      id: m[1],
      embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1&dnt=1${m[2] ? `&h=${m[2]}` : ''}`,
    }
  if ((m = u.match(/adobe\.io\/v1\/player\/ccv\/([\w-]+)/)))
    return {
      provider: 'adobe',
      id: m[1],
      embed: `https://www-ccv.adobe.io/v1/player/ccv/${m[1]}/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View&autoplay=true`,
    }
  return null
}
