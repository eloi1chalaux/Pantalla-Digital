/**
 * photos.js
 * -----------------------------------------------------------------------
 * Fàbrica de carrusels de fotografies amb transició creuada (crossfade)
 * suau. Es fa servir dues vegades (veure app.js): un cop per al carrusel
 * principal i un altre per al de la columna dreta — cadascun amb la seva
 * pròpia llista d'imatges des de config.js, totalment independents entre
 * ells.
 * -----------------------------------------------------------------------
 */

function createPhotoCarousel({ currentId, nextId, images, intervalSeconds }){

  let timerId = null;
  let index = 0;
  let showingCurrent = true;

  function preload(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function advance(){
    if (!images || images.length === 0) return;

    index = (index + 1) % images.length;
    const nextSrc = images[index];

    const visibleId = showingCurrent ? currentId : nextId;
    const hiddenId  = showingCurrent ? nextId : currentId;
    const hiddenEl  = document.getElementById(hiddenId);
    const visibleEl = document.getElementById(visibleId);
    if (!hiddenEl || !visibleEl) return;

    const ok = await preload(nextSrc);
    if (!ok) return; // si falta la imatge, es manté l'actual (no trenca el disseny)

    hiddenEl.src = nextSrc;
    hiddenEl.classList.add('photo-visible');
    visibleEl.classList.remove('photo-visible');
    showingCurrent = !showingCurrent;
  }

  async function init(){
    if (!images || images.length === 0) return;

    const firstOk = await preload(images[0]);
    const currentEl = document.getElementById(currentId);
    if (firstOk && currentEl) currentEl.src = images[0];

    timerId = setInterval(advance, (intervalSeconds || 12) * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
}

window.createPhotoCarousel = createPhotoCarousel;
