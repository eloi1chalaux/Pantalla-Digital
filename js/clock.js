/**
 * clock.js
 * -----------------------------------------------------------------------
 * Widget independiente: hora, fecha y día de la semana.
 * No depende de ningún otro módulo. Expone ClockWidget.init()/destroy().
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
    // Se sincroniza cada segundo pero solo repinta lo estrictamente
    // necesario (render() es barato: dos "toLocaleString").
    timerId = setInterval(render, 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.ClockWidget = ClockWidget;
