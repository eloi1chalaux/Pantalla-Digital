/**
 * weather.js
 * -----------------------------------------------------------------------
 * Widget independent: temperatura, sensació tèrmica, humitat i
 * probabilitat de pluja, per a Cassà de la Selva.
 *
 * Proveïdor actual: Open-Meteo (gratuïta, sense clau, funciona directament
 * des d'una pàgina estàtica com aquesta).
 *
 * Quan tinguis la teva clau de Meteocat, posa config.weather.provider =
 * 'meteocat' i omple meteocatApiKey — aquest fitxer ja detecta el canvi
 * automàticament i fa servir fetchFromMeteocat() en lloc de
 * fetchFromOpenMeteo(). Recorda: com que aquesta pàgina no té servidor,
 * la clau de Meteocat quedaria visible al codi font — assegura't que
 * n'ets conscient abans d'activar-ho.
 * -----------------------------------------------------------------------
 */

const WeatherWidget = (() => {

  let timerId = null;
  let lastCondition = 'clear'; // 'clear' | 'cloudy' | 'rain'

  // Codis WMO simplificats -> icona + condició general (Open-Meteo)
  const WMO_MAP = {
    0:  { icon: '☀️', label: 'Serè',              cond: 'clear'  },
    1:  { icon: '🌤️', label: 'Poc ennuvolat',      cond: 'clear'  },
    2:  { icon: '⛅', label: 'Parcialment ennuvolat', cond: 'cloudy' },
    3:  { icon: '☁️', label: 'Ennuvolat',          cond: 'cloudy' },
    45: { icon: '🌫️', label: 'Boira',              cond: 'cloudy' },
    48: { icon: '🌫️', label: 'Boira',              cond: 'cloudy' },
    51: { icon: '🌦️', label: 'Plovisqueig',        cond: 'rain'   },
    61: { icon: '🌧️', label: 'Pluja',              cond: 'rain'   },
    63: { icon: '🌧️', label: 'Pluja',              cond: 'rain'   },
    65: { icon: '🌧️', label: 'Pluja forta',        cond: 'rain'   },
    71: { icon: '🌨️', label: 'Neu',                cond: 'rain'   },
    80: { icon: '🌦️', label: 'Xàfecs',             cond: 'rain'   },
    95: { icon: '⛈️', label: 'Tempesta',           cond: 'rain'   }
  };

  function mapWmoCode(code){
    return WMO_MAP[code] || { icon: '⛅', label: 'Variable', cond: 'cloudy' };
  }

  async function fetchFromOpenMeteo(){
    const cfg = window.DASHBOARD_CONFIG.weather;
    const tempUnit = cfg.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';

    const url = `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${cfg.latitude}&longitude=${cfg.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code` +
      `&hourly=precipitation_probability` +
      `&temperature_unit=${tempUnit}&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Error API Open-Meteo: ' + res.status);
    const data = await res.json();
    const current = data.current;
    const info = mapWmoCode(current.weather_code);

    let rainChance = 0;
    if (data.hourly && data.hourly.time && data.hourly.precipitation_probability){
      const nowIso = new Date().toISOString().slice(0, 13);
      const idx = data.hourly.time.findIndex(t => t.startsWith(nowIso));
      if (idx !== -1) rainChance = data.hourly.precipitation_probability[idx];
    }

    return {
      icon: info.icon,
      condition: info.cond,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      rainChance
    };
  }

  // Placeholder per a la integració futura amb l'API de Meteocat.
  // Documentació: https://apidocs.meteocat.gencat.cat
  // Recorda: cal registre previ (fins a 7 dies) i la clau aniria al
  // codi font, visible per a qualsevol visitant de la pàgina.
  async function fetchFromMeteocat(){
    const cfg = window.DASHBOARD_CONFIG.weather;
    throw new Error(
      'Integració amb Meteocat encara no implementada. ' +
      'Omple meteocatApiKey i implementa aquesta funció quan
