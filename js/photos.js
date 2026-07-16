/**
 * photos.js
 * -----------------------------------------------------------------------
 * Widget independiente: carrusel de fotografías familiares con
 * transición cruzada (crossfade) suave. Usa dos capas <img> superpuestas
 * y alterna cuál está visible — evita parpadeos y no exige recargar el
 * documento.
 * -----------------------------------------------------------------------
 */

const PhotosWidget = (() => {

  let timerId = null;
  let index = 0;
  let showingCurrent = true; // qué capa está activa

  function preload(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function advance(){
    const cfg = window.DASHBOARD_CONFIG.photos;
    const images = cfg.images;
    if (!images || images.length === 0) return;

    index = (index + 1) % images.length;
    const nextSrc = images[index];

    const visibleId  = showingCurrent ? 'photo-current' : 'photo-next';
    const hiddenId   = showingCurrent ? 'photo-next' : 'photo-current';
    const hiddenEl   = document.getElementById(hiddenId);
    const visibleEl  = document.getElementById(visibleId);
    if (!hiddenEl || !visibleEl) return;

    const ok = await preload(nextSrc);
    if (!ok) return; // si falta la imagen, se mantiene la actual (no rompe el layout)

    hiddenEl.src = nextSrc;
    hiddenEl.classList.add('photo-visible');
    visibleEl.classList.remove('photo-visible');
    showingCurrent = !showingCurrent;
  }

  async function init(){
    const cfg = window.DASHBOARD_CONFIG.photos;
    if (!cfg.images || cfg.images.length === 0) return;

    // Carga la primera imagen directamente en la capa visible
    const firstOk = await preload(cfg.images[0]);
    const currentEl = document.getElementById('photo-current');
    if (firstOk && currentEl) currentEl.src = cfg.images[0];

    const seconds = cfg.intervalSeconds || 12;
    timerId = setInterval(advance, seconds * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.PhotosWidget = PhotosWidget;
