/**
 * calendar.js
 * -----------------------------------------------------------------------
 * Widget independiente: próximos eventos.
 *
 * Por ahora usa `config.calendar.fallbackEvents`. La estructura ya está
 * preparada para Google Calendar: activa `googleCalendar.enabled` y
 * rellena `calendarId` + `apiKey` en config.js, e implementa
 * `fetchGoogleCalendarEvents()` con la llamada real a la API pública de
 * Google Calendar (events.list). El renderizado no necesita cambios.
 * -----------------------------------------------------------------------
 */

const CalendarWidget = (() => {

  let timerId = null;

  function formatDate(dateStr){
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
  }

  // Placeholder para integración futura con Google Calendar API
  async function fetchGoogleCalendarEvents(){
    const { calendarId, apiKey } = window.DASHBOARD_CONFIG.calendar.googleCalendar;
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
      `?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}&maxResults=5`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Google Calendar API error: ' + res.status);
    const data = await res.json();

    return data.items.map(item => ({
      title: item.summary,
      date: (item.start.date || item.start.dateTime).slice(0, 10),
      time: item.start.dateTime ? item.start.dateTime.slice(11, 16) : ''
    }));
  }

  async function getEvents(){
    const cfg = window.DASHBOARD_CONFIG.calendar;
    if (cfg.googleCalendar.enabled){
      try {
        return await fetchGoogleCalendarEvents();
      } catch (err){
        console.warn('[CalendarWidget] usando fallback:', err);
      }
    }
    return cfg.fallbackEvents;
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
    // Los eventos cambian poco: refrescar cada 10 minutos es suficiente
    timerId = setInterval(render, 10 * 60 * 1000);
  }

  function destroy(){
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  return { init, destroy };
})();

window.CalendarWidget = CalendarWidget;
