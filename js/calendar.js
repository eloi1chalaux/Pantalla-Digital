/**
 * calendar.js
 * -----------------------------------------------------------------------
 * Widget independent: pròxims esdeveniments / normes.
 *
 * Llegeix data/esdeveniments.json d'aquest mateix repositori mitjançant
 * repo.js — el mateix fitxer que pots editar en directe des de
 * admin.html, sense haver de tocar cap altre codi. Si per qualsevol motiu
 * no es pot llegir, es fa servir config.calendar.fallbackEvents.
 * -----------------------------------------------------------------------
 */

const CalendarWidget = (() => {

  let timerId = null;

  function formatDate(dateStr){
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' }).replace('.', '');
  }

  async function getEvents(){
    const cfg = window.DASHBOARD_CONFIG.calendar;
    try {
      const events = await window.RepoAccess.readJsonFile(cfg.dataFile);
      if (Array.isArray(events) && events.length > 0) return events;
      return cfg.fallbackEvents;
    } catch (err){
      console.warn('[CalendarWidget] fent servir fallback:', err);
      return cfg.fallbackEvents;
    }
  }

  async function render(){
    const list = document.getElementById('calendar-list');
    if (!list) return;

    const events = await getEvents();
    list.innerHTML = '';

    events.slice(0, 5).forEach(ev => {
      const li = document.createElement('li');
      li.className = 'calendar-item';
      li.innerHTML = `
        <span class="calendar-date">${formatDate(ev.date)}</span>
        <span class="calendar-title">${ev.title}</span>
        <span class="calendar-time">${ev.time || ''}</span>
      `;
      list.appendChild(li);
    });
  }

  function init(){
    render();
    const minutes = window.DASHBOARD_CONFIG.calendar.refreshMinutes || 5;
    timerId = setInterval(render, minutes * 60 * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.CalendarWidget = CalendarWidget;
