/**
 * photos.js
 * -----------------------------------------------------------------------
 * Fàbrica de carrusels de fotografies amb transició creuada (crossfade)
 * suau. Les fotos es mostren com a background-image (no com a <img>),
 * perquè aquesta tècnica es comporta de manera fiable fins i tot en
 * navegadors / WebViews de tauletes Android antigues, evitant que les
 * imatges es vegin deformades.
 * -----------------------------------------------------------------------
 */

function createPhotoCarousel({ currentId, nextId, images, intervalSeconds }){

  let timerId = null;
  let index = 0;
  let showingCurrent = true;

  function preload(src){
    return new Promise(function(resolve){
      const img = new Image();
      img.onload = function(){ resolve(true); };
      img.onerror = function(){ resolve(false); };
      img.src = src;
    });
  }

  function setBackground(el, src){
    el.style.backgroundImage = "url('" + src + "')";
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

    setBackground(hiddenEl, nextSrc);
    hiddenEl.classList.add('photo-visible');
    visibleEl.classList.remove('photo-visible');
    showingCurrent = !showingCurrent;
  }

  async function init(){
    if (!images || images.length === 0) return;

    const firstOk = await preload(images[0]);
    const currentEl = document.getElementById(currentId);
    if (firstOk && currentEl) setBackground(currentEl, images[0]);

    timerId = setInterval(advance, (intervalSeconds || 12) * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init: init, destroy: destroy };
}

window.createPhotoCarousel = createPhotoCarousel;
