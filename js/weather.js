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
  let lastCondition = 'clear';

  const WMO_MAP = {
    0:  { icon: '☀️', label: 'Sere',              cond: 'clear'  },
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
    80: { icon: '🌦️', label: 'Xafecs',             cond: 'rain'   },
    95: { icon: '⛈️', label: 'Tempesta',           cond: 'rain'   }
  };

  function mapWmoCode(code){
    return WMO_MAP[code] || { icon: '⛅', label: 'Variable', cond: 'cloudy' };
  }

  async function fetchFromOpenMeteo(){
    const cfg = window.DASHBOARD_CONFIG.weather;
    const tempUnit = cfg.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';

    const url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + cfg.latitude + '&longitude=' + cfg.longitude +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code' +
      '&hourly=precipitation_probability' +
      '&temperature_unit=' + tempUnit + '&timezone=auto';

    const res = await fetch(url);
    if (!res.ok) throw new Error('Error API Open-Meteo: ' + res.status);
    const data = await res.json();
    const current = data.current;
    const info = mapWmoCode(current.weather_code);

    let rainChance = 0;
    if (data.hourly && data.hourly.time && data.hourly.precipitation_probability){
      const nowIso = new Date().toISOString().slice(0, 13);
      const idx = data.hourly.time.findIndex(function(t){ return t.startsWith(nowIso); });
      if (idx !== -1) rainChance = data.hourly.precipitation_probability[idx];
    }

    return {
      icon: info.icon,
      condition: info.cond,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      rainChance: rainChance
    };
  }

  async function fetchFromMeteocat(){
    const cfg = window.DASHBOARD_CONFIG.weather;
    throw new Error('Integracio amb Meteocat encara no implementada. Omple meteocatApiKey i implementa aquesta funcio quan tinguis la clau (municipi: ' + cfg.meteocatMunicipiCodi + ').');
  }

  function renderError(){
    const el = document.getElementById('weather-temp');
    if (el) el.textContent = '--°';
  }

  async function render(){
    const cfg = window.DASHBOARD_CONFIG.weather;

    const placeEl = document.getElementById('weather-place');
    if (placeEl) placeEl.textContent = cfg.placeName || 'Exterior';

    try {
      const result = cfg.provider === 'meteocat' ? await fetchFromMeteocat() : await fetchFromOpenMeteo();

      lastCondition = result.condition;
      const unitSymbol = cfg.units === 'fahrenheit' ? '°F' : '°C';

      document.getElementById('weather-icon').textContent = result.icon;
      document.getElementById('weather-temp').textContent = Math.round(result.temperature) + unitSymbol;
      document.getElementById('weather-feels').textContent = Math.round(result.feelsLike) + unitSymbol;
      document.getElementById('weather-humidity').textContent = Math.round(result.humidity) + '%';
      document.getElementById('weather-rain').textContent = Math.round(result.rainChance) + '%';
    } catch (err){
      console.warn('[WeatherWidget]', err);
      if (cfg.provider === 'meteocat'){
        try {
          const fallback = await fetchFromOpenMeteo();
          lastCondition = fallback.condition;
          const unitSymbol = cfg.units === 'fahrenheit' ? '°F' : '°C';
          document.getElementById('weather-icon').textContent = fallback.icon;
          document.getElementById('weather-temp').textContent = Math.round(fallback.temperature) + unitSymbol;
          document.getElementById('weather-feels').textContent = Math.round(fallback.feelsLike) + unitSymbol;
          document.getElementById('weather-humidity').textContent = Math.round(fallback.humidity) + '%';
          document.getElementById('weather-rain').textContent = Math.round(fallback.rainChance) + '%';
          return;
        } catch (fallbackErr){
          console.warn('[WeatherWidget] fallback Open-Meteo tambe ha fallat', fallbackErr);
        }
      }
      renderError();
    }
  }

  function init(){
    render();
    const minutes = window.DASHBOARD_CONFIG.weather.refreshMinutes || 15;
    timerId = setInterval(render, minutes * 60 * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function getCondition(){
    return lastCondition;
  }

  return { init: init, destroy: destroy, getCondition: getCondition };
})();

window.WeatherWidget = WeatherWidget;
