/**
 * app.js
 * -----------------------------------------------------------------------
 * Orquestrador principal. No conté lògica de negoci de cap widget: només
 * decideix, segons config.js, quins widgets s'inicialitzen, i gestiona el
 * fons dinàmic ambiental (dia / nit / pluja / sol).
 *
 * Treure un widget de config.js fa que aquest fitxer simplement no
 * l'inicialitzi — la resta del sistema no se n'assabenta ni es trenca.
 * -----------------------------------------------------------------------
 */

let photoCarouselMain = null;

const WIDGET_MODULES = {
  clock:    { module: () => window.ClockWidget,    selector: '#widget-clock'    },
  weather:  { module: () => window.WeatherWidget,  selector: '#widget-weather'  },
  calendar: { module: () => window.CalendarWidget, selector: '#widget-calendar' },
  news:     { module: () => window.NewsWidget,     selector: '#widget-news'     },
  timer:    { module: () => window.TimerWidget,    selector: '#widget-timer'    },

  photos: {
    module: () => {
      if (!photoCarouselMain){
        photoCarouselMain = window.createPhotoCarousel({
          currentId: 'photo-current',
          nextId: 'photo-next',
          images: window.DASHBOARD_CONFIG.photos.images,
          intervalSeconds: window.DASHBOARD_CONFIG.photos.intervalSeconds
        });
      }
      return photoCarouselMain;
    },
    selector: '#widget-photos'
  }
};

function initWidgets(){
  const enabled = window.DASHBOARD_CONFIG.widgets;

  Object.keys(WIDGET_MODULES).forEach(key => {
    const { module, selector } = WIDGET_MODULES[key];
    const el = document.querySelector(selector);

    if (!enabled[key]){
      if (el) el.classList.add('widget-hidden');
      return; // no s'inicialitza: cap cost de CPU/memòria/xarxa
    }

    if (el) el.classList.remove('widget-hidden');
    const widgetModule = module();
    if (widgetModule && typeof widgetModule.init === 'function'){
      widgetModule.init();
    }
  });
}

/* =========================================================================
   FONS DINÀMIC
   Combina l'hora del dia (sempre disponible, sense xarxa) amb la
   condició meteorològica (quan el widget del temps està actiu) per tenyir
   les "ones" ambientals definides a style.css.
   ========================================================================= */

const AMBIENT_THEMES = {
  night: { a: '#5fd3c4', b: '#1c2a3f', c: '#2b3550', opacityBase: 0.10 },
  day:   { a: '#5fd3c4', b: '#6f93b8', c: '#f2b75c', opacityBase: 0.35 },
  rain:  { a: '#6f93b8', b: '#425a73', c: '#5fd3c4', opacityBase: 0.30 },
  sun:   { a: '#f2b75c', b: '#5fd3c4', c: '#f2d98c', opacityBase: 0.32 }
};

function resolveThemeKey(){
  const { nightStartHour, dayStartHour } = window.DASHBOARD_CONFIG.background;
  const hour = new Date().getHours();
  const isNight = hour >= nightStartHour || hour < dayStartHour;

  if (isNight) return 'night';

  if (window.DASHBOARD_CONFIG.widgets.weather && window.WeatherWidget){
    const condition = window.WeatherWidget.getCondition();
    if (condition === 'rain') return 'rain';
    if (condition === 'clear') return 'sun';
  }
  return 'day';
}

function applyAmbientTheme(){
  const key = resolveThemeKey();
  const theme = AMBIENT_THEMES[key];
  const root = document.documentElement;

  root.style.setProperty('--aqua', theme.a);
  root.style.setProperty('--rain', theme.b);
  root.style.setProperty('--amber', theme.c);

  document.querySelectorAll('.ripple').forEach(r => {
    r.style.opacity = theme.opacityBase;
  });
}

function initAmbientBackground(){
  applyAmbientTheme();
  setInterval(applyAmbientTheme, 5 * 60 * 1000);
}

/* =========================================================================
   ARRENCADA
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initWidgets();
  initAmbientBackground();
});
