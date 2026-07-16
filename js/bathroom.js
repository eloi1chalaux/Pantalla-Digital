/**
 * bathroom.js
 * -----------------------------------------------------------------------
 * Widget independiente: temperatura, humedad y calidad del aire interior.
 *
 * Hoy en día usa valores SIMULADOS con una pequeña deriva aleatoria para
 * que parezcan datos reales. El día que instales sensores físicos
 * (ESP32 + DHT22, Zigbee, MQTT, Home Assistant…), sustituye
 * `readSimulatedData()` por una llamada real dentro de `fetchRealSensorData()`
 * y cambia `simulated: false` en config.js. El resto del widget no
 * necesita cambiar.
 * -----------------------------------------------------------------------
 */

const BathroomWidget = (() => {

  let timerId = null;
  let state = null;

  function readSimulatedData(){
    const base = window.DASHBOARD_CONFIG.bathroomSensors.baseline;
    if (!state){
      state = { ...base };
    }
    // Pequeña deriva aleatoria para simular variaciones reales
    state.temperature += (Math.random() - 0.5) * 0.3;
    state.humidity += (Math.random() - 0.5) * 1.5;
    state.airQuality += (Math.random() - 0.5) * 2;

    // Límites razonables
    state.humidity = Math.min(95, Math.max(30, state.humidity));
    state.airQuality = Math.min(100, Math.max(40, state.airQuality));

    return { ...state };
  }

  // Placeholder para integración futura con sensores reales (MQTT / Home Assistant API)
  async function fetchRealSensorData(){
    throw new Error('fetchRealSensorData() no implementado todavía');
  }

  async function render(){
    const cfg = window.DASHBOARD_CONFIG.bathroomSensors;
    let data;
    try {
      data = cfg.simulated ? readSimulatedData() : await fetchRealSensorData();
    } catch (err){
      console.warn('[BathroomWidget]', err);
      data = readSimulatedData(); // fallback seguro
    }

    document.getElementById('bathroom-temp').textContent = `${data.temperature.toFixed(1)}°`;
    document.getElementById('bathroom-humidity').textContent = `${Math.round(data.humidity)}%`;
    document.getElementById('bathroom-air').textContent = `${Math.round(data.airQuality)}`;
  }

  function init(){
    render();
    const seconds = window.DASHBOARD_CONFIG.bathroomSensors.refreshSeconds || 30;
    timerId = setInterval(render, seconds * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.BathroomWidget = BathroomWidget;
