/**
 * news.js
 * -----------------------------------------------------------------------
 * Widget independiente: titulares rotativos. Nunca abre enlaces ni admite
 * interacción — solo muestra texto.
 *
 * Si `config.news.apiUrl` está vacío, se usan titulares de ejemplo
 * (fallbackHeadlines), por lo que el dashboard funciona sin conexión a
 * ninguna API de noticias. Para conectar una fuente real, apunta apiUrl a
 * un endpoint que devuelva JSON `[{ "title": "..." }, ...]`.
 * -----------------------------------------------------------------------
 */

const NewsWidget = (() => {

  let rotateTimerId = null;
  let refreshTimerId = null;
  let headlines = [];
  let index = 0;

  async function fetchHeadlines(){
    const { apiUrl, fallbackHeadlines } = window.DASHBOARD_CONFIG.news;
    if (!apiUrl) return fallbackHeadlines;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('News API error: ' + res.status);
      const data = await res.json();
      const titles = data.map(item => item.title).filter(Boolean);
      return titles.length ? titles : fallbackHeadlines;
    } catch (err){
      console.warn('[NewsWidget] usando fallback:', err);
      return fallbackHeadlines;
    }
  }

  function showCurrent(){
    const el = document.getElementById('news-headline');
    if (!el || headlines.length === 0) return;
    // Reinicia la animación de aparición en cada cambio
    el.style.animation = 'none';
    // Forzar reflow para poder relanzar la animación CSS
    void el.offsetWidth;
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
    rotateTimerId = setInterval(rotate, rotateSeconds * 1000);
    // Vuelve a pedir titulares nuevos cada 30 minutos
    refreshTimerId = setInterval(refresh, 30 * 60 * 1000);
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
