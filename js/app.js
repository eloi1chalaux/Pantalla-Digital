/**
 * app.js
 * -----------------------------------------------------------------------
 * Orquestador principal. No contiene lógica de negocio de ningún widget:
 * solo decide, según config.js, qué widgets se inicializan, y gestiona
 * el fondo dinámico ambiental (día / noche / lluvia / sol).
 *
 * Quitar un widget de config.js hace que este archivo simplemente no lo
 * inicialice — el resto del sistema no se entera ni se rompe.
 * -----------------------------------------------------------------------
 */

const WIDGET_MODULES = {
  clock:            { module: () => window.ClockWidget,    selector: '#widget-clock'    },
  weather:          { module: () => window.WeatherWidget,  selector: '#widget-weather'  },
  bathroomSensors:  { module: () => window.BathroomWidget, selector: '#widget-bathroom' },
  calendar:         { module: () => window.CalendarWidget, selector: '#widget-calendar' },
  photos:           { module: () => window.PhotosWidget,   selector: '#widget-photos'   },
  news:             { module: () => window.NewsWidget,     selector: '#widget-news'     }
};

function initWidgets(){
  const enabled = window.DASHBOARD_CONFIG.widgets;

  Object.keys(WIDGET_MODULES).forEach(key => {
    const { module, selector } = WIDGET_MODULES[key];
    const el = document.querySelector(selector);
    const widgetModule = module();

    if (!enabled[key]){
      if (el) el.classList.add('widget-hidden');
      return; // no se inicializa: cero coste de CPU/memoria/red
    }

    if (el) el.classList.remove('widget-hidden');
    if (widgetModule && typeof widgetModule.init === 'function'){
      widgetModule.init();
    }
  });
}

/* =========================================================================
   FONDO DINÁMICO
   Combina la hora del día (siempre disponible, sin red) con la condición
   meteorológica (cuando el widget de tiempo está activo) para tintar las
   "ondas" ambientales definidas en style.css.
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

  // Si el widget de tiempo está activo, afinamos con la condición real
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
  // Revisamos cada 5 minutos: suficiente para seguir la hora y el clima
  // sin sobrecargar el dispositivo.
  setInterval(applyAmbientTheme, 5 * 60 * 1000);
}

/* =========================================================================
   ARRANQUE
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initWidgets();
  initAmbientBackground();
});
