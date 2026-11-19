/**
 * Connexion à l'administration (/admin) par code d'accès — sans compte GitHub.
 *
 * Decap CMS ouvre cette page dans une fenêtre (comme un « Se connecter avec… ») :
 *  - GET  : formulaire « Code d'accès » ;
 *  - POST : si le code est bon, la fenêtre transmet au CMS le jeton GitHub du site
 *           (protocole postMessage de Decap) puis se ferme.
 *
 * Variables d'environnement Netlify (Site configuration → Environment variables) :
 *  - ADMIN_CODE   : le code donné à Eva (au moins 10 caractères) ;
 *  - GITHUB_TOKEN : jeton GitHub « fine-grained » limité au dépôt du site (voir README).
 */
import crypto from 'node:crypto'

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest()
// Comparaison à temps constant (ne révèle pas, par la durée de réponse, combien de caractères sont justes)
const codeValide = (saisi, attendu) => crypto.timingSafeEqual(sha(saisi), sha(attendu))

const page = (contenu) =>
  new Response(
    `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Administration — connexion</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0b0c; color: #ede9e3;
         font: 15px/1.6 system-ui, -apple-system, sans-serif; }
  main { width: min(100% - 32px, 360px); }
  h1 { font: 400 40px/1 Georgia, serif; margin: 0 0 8px; }
  p { color: #9c978f; margin: 0 0 24px; }
  label { display: block; font: 12px ui-monospace, monospace; text-transform: uppercase; letter-spacing: .14em; color: #9c978f; margin-bottom: 8px; }
  input { box-sizing: border-box; width: 100%; padding: 14px 16px; font-size: 16px; color: #ede9e3; background: #151517;
          border: 1px solid #2a2a2e; border-radius: 8px; }
  input:focus { outline: 2px solid #e2a45a; outline-offset: 2px; }
  button { margin-top: 16px; width: 100%; padding: 14px; font-size: 15px; font-weight: 600; color: #0b0b0c; background: #e2a45a;
           border: 0; border-radius: 8px; cursor: pointer; }
  .erreur { color: #f0a08a; margin: 12px 0 0; }
</style>
</head>
<body><main>${contenu}</main></body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' } },
  )

const formulaire = (erreur = '') =>
  page(`
  <h1>Administration</h1>
  <p>Entrez votre code d'accès pour modifier le site.</p>
  <form method="post">
    <label for="code">Code d'accès</label>
    <input id="code" name="code" type="password" autocomplete="current-password" required autofocus />
    <button type="submit">Se connecter</button>
    ${erreur ? `<p class="erreur" role="alert">${erreur}</p>` : ''}
  </form>`)

/** Transmet le jeton à la fenêtre du CMS (uniquement si elle est sur le même site), puis se ferme. */
const succes = (token) => {
  const message = JSON.stringify(`authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`)
    .replace(/</g, '\\u003c')
  return page(`
  <h1>Connexion…</h1>
  <p>Vous pouvez fermer cette fenêtre si elle ne se ferme pas toute seule.</p>
  <script>
    (function () {
      function recevoir(e) {
        if (e.origin !== window.location.origin) return
        window.opener.postMessage(${message}, e.origin)
        window.removeEventListener('message', recevoir)
        setTimeout(function () { window.close() }, 300)
      }
      window.addEventListener('message', recevoir)
      window.opener && window.opener.postMessage('authorizing:github', window.location.origin)
    })()
  </script>`)
}

export default async (req) => {
  const { ADMIN_CODE, GITHUB_TOKEN } = process.env
  if (!ADMIN_CODE || !GITHUB_TOKEN)
    return formulaire("L'administration n'est pas encore configurée (variables ADMIN_CODE et GITHUB_TOKEN manquantes).")

  if (req.method !== 'POST') return formulaire()

  const code = (await req.formData()).get('code') || ''
  if (!codeValide(code, ADMIN_CODE)) {
    // Ralentit les tentatives au hasard
    await new Promise((r) => setTimeout(r, 1500))
    return formulaire('Code incorrect.')
  }
  return succes(GITHUB_TOKEN)
}
