/**
 * clock.js
 * -----------------------------------------------------------------------
 * Widget independent: hora, data i dia de la setmana.
 * No depèn de cap altre mòdul. Exposa ClockWidget.init()/destroy().
 * -----------------------------------------------------------------------
 */

const ClockWidget = (() => {

  let timerId = null;

  function render(){
    const cfg = window.DASHBOARD_CONFIG.clock;
    const now = new Date();

    const timeEl = document.getElementById('clock-time');
    const weekdayEl = document.getElementById('clock-weekday');
    const dateEl = document.getElementById('clock-date');
    if (!timeEl) return;

    const timeOpts = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !cfg.use24h
    };
    if (cfg.showSeconds) timeOpts.second = '2-digit';

    timeEl.textContent = now.toLocaleTimeString(cfg.locale, timeOpts);
    weekdayEl.textContent = now.toLocaleDateString(cfg.locale, { weekday: 'long' });
    dateEl.textContent = now.toLocaleDateString(cfg.locale, { day: 'numeric', month: 'long' });
  }

  function init(){
    render();
    // Es sincronitza cada segon però només repinta el que cal
    // (render() és barat: dues crides a "toLocaleString").
    timerId = setInterval(render, 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.ClockWidget = ClockWidget;
