/**
 * weather.js
 * -----------------------------------------------------------------------
 * Widget independiente: temperatura, sensación térmica, humedad y
 * probabilidad de lluvia. Usa Open-Meteo (gratuita, sin API key).
 * Expone WeatherWidget.init()/destroy() y WeatherWidget.getCondition()
 * para que app.js pueda adaptar el fondo dinámico (sol / lluvia).
 * -----------------------------------------------------------------------
 */

const WeatherWidget = (() => {

  let timerId = null;
  let lastCondition = 'clear'; // 'clear' | 'cloudy' | 'rain'

  // Códigos WMO simplificados -> icono + condición general
  const WMO_MAP = {
    0:  { icon: '☀️', label: 'Despejado',        cond: 'clear'  },
    1:  { icon: '🌤️', label: 'Poco nuboso',       cond: 'clear'  },
    2:  { icon: '⛅', label: 'Parcialmente nuboso', cond: 'cloudy' },
    3:  { icon: '☁️', label: 'Nublado',           cond: 'cloudy' },
    45: { icon: '🌫️', label: 'Niebla',            cond: 'cloudy' },
    48: { icon: '🌫️', label: 'Niebla',            cond: 'cloudy' },
    51: { icon: '🌦️', label: 'Llovizna',          cond: 'rain'   },
    61: { icon: '🌧️', label: 'Lluvia',            cond: 'rain'   },
    63: { icon: '🌧️', label: 'Lluvia',            cond: 'rain'   },
    65: { icon: '🌧️', label: 'Lluvia fuerte',     cond: 'rain'   },
    71: { icon: '🌨️', label: 'Nieve',             cond: 'rain'   },
    80: { icon: '🌦️', label: 'Chubascos',         cond: 'rain'   },
    95: { icon: '⛈️', label: 'Tormenta',          cond: 'rain'   }
  };

  function mapCode(code){
    return WMO_MAP[code] || { icon: '⛅', label: 'Variable', cond: 'cloudy' };
  }

  async function fetchWeather(){
    const cfg = window.DASHBOARD_CONFIG.weather;
    const tempUnit = cfg.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';

    const url = `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${cfg.latitude}&longitude=${cfg.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code` +
      `&hourly=precipitation_probability` +
      `&temperature_unit=${tempUnit}&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error: ' + res.status);
    return res.json();
  }

  function renderError(){
    const el = document.getElementById('weather-temp');
    if (el) el.textContent = '--°';
  }

  async function render(){
    try {
      const data = await fetchWeather();
      const current = data.current;
      const info = mapCode(current.weather_code);
      lastCondition = info.cond;

      // probabilidad de lluvia: usamos la hora actual del array horario
      let rainChance = 0;
      if (data.hourly && data.hourly.time && data.hourly.precipitation_probability){
        const nowIso = new Date().toISOString().slice(0, 13);
        const idx = data.hourly.time.findIndex(t => t.startsWith(nowIso));
        if (idx !== -1) rainChance = data.hourly.precipitation_probability[idx];
      }

      const unitSymbol = window.DASHBOARD_CONFIG.weather.units === 'fahrenheit' ? '°F' : '°C';

      document.getElementById('weather-icon').textContent = info.icon;
      document.getElementById('weather-temp').textContent = `${Math.round(current.temperature_2m)}${unitSymbol}`;
      document.getElementById('weather-feels').textContent = `${Math.round(current.apparent_temperature)}${unitSymbol}`;
      document.getElementById('weather-humidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
      document.getElementById('weather-rain').textContent = `${Math.round(rainChance)}%`;
    } catch (err){
      console.warn('[WeatherWidget]', err);
      renderError();
    }
  }

  function init(){
    render();
    const minutes
