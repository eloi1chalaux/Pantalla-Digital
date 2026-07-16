/**
 * config.js
 * -----------------------------------------------------------------------
 * Punto único de configuración del dashboard.
 * Activa/desactiva widgets y ajusta parámetros sin tocar el resto del código.
 * Cada widget lee SOLO su propia sección de aquí — nunca se acoplan entre sí.
 * -----------------------------------------------------------------------
 */

const DASHBOARD_CONFIG = {

  // ------------------------------------------------------------
  // Widgets: true = visible / activo · false = oculto y no inicializado
  // ------------------------------------------------------------
  widgets: {
    clock: true,
    weather: true,
    bathroomSensors: true,
    news: true,
    calendar: true,
    photos: true
  },

  // ------------------------------------------------------------
  // Reloj / fecha
  // ------------------------------------------------------------
  clock: {
    use24h: true,
    locale: 'es-ES',
    showSeconds: false
  },

  // ------------------------------------------------------------
  // Tiempo meteorológico (Open-Meteo — gratuita, sin API key)
  // Cambia lat/lon por tu ubicación.
  // ------------------------------------------------------------
  weather: {
    latitude: 41.5,       // Igualada, Catalunya (ejemplo)
    longitude: 1.6,
    units: 'celsius',     // 'celsius' | 'fahrenheit'
    refreshMinutes: 15
  },

  // ------------------------------------------------------------
  // Sensores del baño
  // Si algún día conectas sensores reales (MQTT, ESPHome, Home
  // Assistant…), sustituye `simulated: true` por `simulated: false`
  // e implementa `fetchRealSensorData()` en bathroom.js.
  // ------------------------------------------------------------
  bathroomSensors: {
    simulated: true,
    refreshSeconds: 30,
    baseline: {
      temperature: 23,   // ºC
      humidity: 55,      // %
      airQuality: 92     // índice 0-100 (100 = excelente)
    }
  },

  // ------------------------------------------------------------
  // Noticias — titulares rotativos
  // apiUrl vacío => se usan titulares de ejemplo (offline-safe).
  // Para conectar una fuente real, indica un endpoint que devuelva
  // JSON con la forma: [{ "title": "..." }, { "title": "..." }]
  // ------------------------------------------------------------
  news: {
    apiUrl: '',
    rotateSeconds: 8,
    fallbackHeadlines: [
      'Configura una fuente de noticias en config.js para ver titulares reales',
      'El dashboard funciona correctamente en modo de demostración',
      'Añade tu API de noticias favorita en news.js cuando quieras'
    ]
  },

  // ------------------------------------------------------------
  // Calendario — preparado para Google Calendar en el futuro.
  // Mientras tanto, usa una lista estática de eventos de ejemplo.
  // ------------------------------------------------------------
  calendar: {
    googleCalendar: {
      enabled: false,
      calendarId: '',
      apiKey: ''
    },
    fallbackEvents: [
      { title: 'Revisión caldera', date: '2026-07-18', time: '10:00' },
      { title: 'Cena familiar', date: '2026-07-20', time: '21:00' },
      { title: 'Cita médica', date: '2026-07-23', time: '09:30' }
    ]
  },

  // ------------------------------------------------------------
  // Fotografías familiares
  // Coloca las imágenes dentro de /images y lístalas aquí.
  // ------------------------------------------------------------
  photos: {
    intervalSeconds: 12,
    transitionMs: 1500,
    images: [
      'images/photo1.jpg',
      'images/photo2.jpg',
      'images/photo3.jpg'
    ]
  },

  // ------------------------------------------------------------
  // Fondo dinámico (día / noche / lluvia / sol)
  // ------------------------------------------------------------
  background: {
    nightStartHour: 21,
    dayStartHour: 7
  }

};

// Se expone en window para que el resto de módulos (cargados como
// scripts clásicos, sin bundler) puedan leerlo.
window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;
