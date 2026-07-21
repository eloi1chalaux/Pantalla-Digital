/**
 * config.js
 * -----------------------------------------------------------------------
 * Punt únic de configuració del dashboard.
 * Activa/desactiva widgets i ajusta paràmetres sense tocar la resta del codi.
 * Cada widget llegeix NOMÉS la seva pròpia secció d'aquí — mai s'acoblen
 * entre ells.
 * -----------------------------------------------------------------------
 */

const DASHBOARD_CONFIG = {

  // ------------------------------------------------------------
  // Widgets: true = visible / actiu · false = amagat i no inicialitzat
  // ------------------------------------------------------------
  widgets: {
    clock: true,
    weather: true,
    news: true,
    calendar: true,
    photos: true,       // carrusel principal (part inferior esquerra)
    photosSide: true     // carrusel de la columna dreta (abans: sensors del bany)
  },

  // ------------------------------------------------------------
  // Rellotge / data
  // ------------------------------------------------------------
  clock: {
    use24h: true,
    locale: 'ca-ES',
    showSeconds: false
  },

  // ------------------------------------------------------------
  // Temps meteorològic
  //
  // Ara mateix es fa servir Open-Meteo (gratuïta, sense clau, fiable des
  // d'una pàgina estàtica). Quan tinguis la teva clau de Meteocat
  // (apidocs.meteocat.gencat.cat), emplena "meteocatApiKey" i posa
  // "provider: 'meteocat'" — weather.js ja detecta el canvi automàticament.
  //
  // IMPORTANT sobre Meteocat: com que aquesta pàgina és estàtica (sense
  // servidor), la clau quedaria visible al codi font. Fes-ho només si ho
  // tens clar i assumeixes aquest risc (és un ús personal, no comercial).
  // ------------------------------------------------------------
  weather: {
    provider: 'open-meteo',   // 'open-meteo' | 'meteocat'
    placeName: 'Cassà de la Selva',
    latitude: 41.887,
    longitude: 2.877,
    units: 'celsius',         // 'celsius' | 'fahrenheit'
    refreshMinutes: 15,

    // Només necessari si provider = 'meteocat'
    meteocatApiKey: '',
    meteocatMunicipiCodi: '17044'   // codi INE de Cassà de la Selva
  },

  // ------------------------------------------------------------
  // Notícies — titulars rotatius
  //
  // Es llegeixen automàticament de data/noticies.json dins d'aquest
  // mateix repositori (editable en directe des de admin.html). Si per
  // qualsevol motiu no es pot llegir (sense connexió, error...), es fan
  // servir els titulars de "fallbackHeadlines" com a xarxa de seguretat.
  // ------------------------------------------------------------
  news: {
    dataFile: 'data/noticies.json',
    rotateSeconds: 8,
    refreshMinutes: 5,
    fallbackHeadlines: [
      'Edita les notícies des de admin.html per veure titulars propis aquí',
      'El dashboard funciona correctament en mode de demostració'
    ]
  },

  // ------------------------------------------------------------
  // Calendari — esdeveniments / normes
  //
  // Es llegeixen automàticament de data/esdeveniments.json (editable en
  // directe des de admin.html). fallbackEvents només s'utilitza si el
  // fitxer no es pot llegir.
  // ------------------------------------------------------------
  calendar: {
    dataFile: 'data/esdeveniments.json',
    refreshMinutes: 5,
    fallbackEvents: [
      { title: 'Edita els esdeveniments des de admin.html', date: '2026-07-20', time: '' }
    ]
  },

  // ------------------------------------------------------------
  // Fotografies familiars — carrusel principal (part inferior esquerra)
  // ------------------------------------------------------------
  photos: {
    intervalSeconds: 12,
    images: [
      'images/photo1.jpg',
      'images/photo2.jpg',
      'images/photo3.jpg',
      'images/photo4.jpg'
    ]
  },

  // ------------------------------------------------------------
  // Fotografies familiars — carrusel de la columna dreta
  // (abans ocupat pels sensors interiors del bany)
  // ------------------------------------------------------------
  photosSide: {
    intervalSeconds: 15,
    images: [
      'images/photo5.jpg',
      'images/photo6.jpg',
      'images/photo7.jpg',
      'images/photo8.jpg'
    ]
  },

  // ------------------------------------------------------------
  // Fons dinàmic (dia / nit / pluja / sol)
  // ------------------------------------------------------------
  background: {
    nightStartHour: 21,
    dayStartHour: 7
  }

};

// S'exposa a window perquè la resta de mòduls (carregats com scripts
// clàssics, sense bundler) el puguin llegir.
window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;
