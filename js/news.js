/**
 * news.js
 * -----------------------------------------------------------------------
 * Widget independent: titulars rotatius. Mai obre enllaços ni admet
 * interacció — només mostra text.
 *
 * Llegeix data/noticies.json d'aquest mateix repositori mitjançant
 * repo.js — el mateix fitxer que pots editar en directe des de
 * admin.html. Si no es pot llegir, es fa servir
 * config.news.fallbackHeadlines com a xarxa de seguretat.
 * -----------------------------------------------------------------------
 */

const NewsWidget = (() => {

  let rotateTimerId = null;
  let refreshTimerId = null;
  let headlines = [];
  let index = 0;

  async function fetchHeadlines(){
    const cfg = window.DASHBOARD_CONFIG.news;
    try {
      const items = await window.RepoAccess.readJsonFile(cfg.dataFile);
      const titles = Array.isArray(items) ? items.map(i => i.title).filter(Boolean) : [];
      return titles.length ? titles : cfg.fallbackHeadlines;
    } catch (err){
      console.warn('[NewsWidget] fent servir fallback:', err);
      return cfg.fallbackHeadlines;
    }
  }

  function showCurrent(){
    const el = document.getElementById('news-headline');
    if (!el || headlines.length === 0) return;
    // Reinicia l'animació d'aparició a cada canvi
    el.style.animation = 'none';
    void el.offsetWidth; // forçar reflow per poder relimitar l'animació CSS
    el.style.animation = '';
    el.textContent = headlines[index];
  }

  function rotate(){
    if (headlines.length === 0) return;
    index = (index + 1) % headlines.length;
    showCurrent();
  }

  async function refresh(){
    headlines = await fetchHeadlines();
    index = 0;
    showCurrent();
  }

  function init(){
    refresh();
    const rotateSeconds = window.DASHBOARD_CONFIG.news.rotateSeconds || 8;
    const refreshMinutes = window.DASHBOARD_CONFIG.news.refreshMinutes || 5;
    rotateTimerId = setInterval(rotate, rotateSeconds * 1000);
    refreshTimerId = setInterval(refresh, refreshMinutes * 60 * 1000);
  }

  function destroy(){
    if (rotateTimerId) clearInterval(rotateTimerId);
    if (refreshTimerId) clearInterval(refreshTimerId);
    rotateTimerId = null;
    refreshTimerId = null;
  }

  return { init, destroy };
})();

window.NewsWidget = NewsWidget;
