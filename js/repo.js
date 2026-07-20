/**
 * repo.js
 * -----------------------------------------------------------------------
 * Petita capa d'accés al repositori de GitHub que allotja aquest mateix
 * dashboard. S'utilitza per:
 *
 *   - Que news.js i calendar.js LLEGEIXIN data/noticies.json i
 *     data/esdeveniments.json en directe (sense haver de tornar a publicar
 *     tot el codi cada vegada que canvies un titular o un esdeveniment).
 *   - Que admin.html ESCRIGUI aquests mateixos fitxers, mitjançant un
 *     token personal de GitHub que tu introdueixes al navegador.
 *
 * No cal configurar res aquí: l'usuari (el teu compte) i el nom del
 * repositori es detecten automàticament a partir de la URL de
 * GitHub Pages (https://USUARI.github.io/REPOSITORI/...).
 * -----------------------------------------------------------------------
 */

const RepoAccess = (() => {

  function getRepoInfo(){
    // Exemple real: https://joan.github.io/bath-dashboard/admin.html
    //   hostname = "joan.github.io"      -> owner = "joan"
    //   pathname = "/bath-dashboard/..." -> repo  = "bath-dashboard"
    const host = window.location.hostname;         // "usuari.github.io"
    const owner = host.split('.')[0];

    const segments = window.location.pathname.split('/').filter(Boolean);
    const repo = segments[0] || '';

    return { owner, repo };
  }

  // Llegeix un fitxer JSON del repositori mitjançant l'API pública de
  // GitHub (no necessita token: és només lectura d'un repositori públic).
  async function readJsonFile(path){
    const { owner, repo } = getRepoInfo();
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error(`No s'ha pogut llegir ${path}: ${res.status}`);

    const data = await res.json();
    const decoded = decodeURIComponent(escape(atob(data.content)));
    return JSON.parse(decoded);
  }

  // Escriu (crea o actualitza) un fitxer JSON al repositori. Necessita un
  // token personal amb permís de lectura/escriptura sobre "Contents".
  // Només s'utilitza des de admin.html — mai des del dashboard públic.
  async function writeJsonFile(path, dataObject, token, commitMessage){
    const { owner, repo } = getRepoInfo();
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // Cal el "sha" del fitxer actual per poder-lo sobreescriure.
    // Si el fitxer encara no existeix, GitHub retorna 404 i simplement
    // el creem sense sha.
    let sha = undefined;
    const current = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (current.ok){
      const currentData = await current.json();
      sha = currentData.sha;
    }

    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataObject, null, 2))));

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage || `Actualitza ${path}`,
        content: contentEncoded,
        sha,
        branch: 'main'
      })
    });

    if (!res.ok){
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Error en desar ${path}: ${res.status}`);
    }
    return res.json();
  }

  return { getRepoInfo, readJsonFile, writeJsonFile };
})();

window.RepoAccess = RepoAccess;
