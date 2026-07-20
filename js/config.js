/* =========================================================================
   BATHROOM SMART DASHBOARD — style.css
   -------------------------------------------------------------------------
   Direcció de disseny: "mirall d'aigua" — un panell de vidre flotant sobre
   ones ambientals molt lentes que canvien de to segons l'hora del dia i el
   clima exterior (nit/dia/pluja/sol). Inspirat en Nest Hub / Home
   Assistant, però amb una identitat pròpia lligada a l'aigua i al vapor
   d'un bany.
   ========================================================================= */

:root{
  /* --- Paleta ------------------------------------------------------- */
  --ink:        #0e1520;   /* fons base, gairebé negre blavós */
  --mist:       #182233;   /* superfícies / targetes */
  --mist-soft:  rgba(24, 34, 51, 0.55);
  --foam:       #f2f6f7;   /* text principal */
  --slate:      #8aa0ae;   /* text secundari */
  --aqua:       #5fd3c4;   /* accent fred / aigua */
  --amber:      #f2b75c;   /* accent càlid / sol */
  --rain:       #6f93b8;   /* accent pluja */

  /* --- Tipografia ------------------------------------------------------ */
  --font-display: 'Space Grotesk', 'Segoe UI', sans-serif;
  --font-body:    'Inter', 'Segoe UI', sans-serif;

  /* --- Forma ------------------------------------------------------- */
  --radius-lg: 28px;
  --radius-md: 20px;
  --gap: 22px;

  --ease-ambient: cubic-bezier(.37,0,.63,1);
}

*{ box-sizing: border-box; }

html, body{
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;               /* mai hi ha scroll: és una pantalla fixa */
  background: var(--ink);
  color: var(--foam);
  font-family: var(--font-body);
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Reduce motion: respectar l'accessibilitat encara que no hi hagi interacció */
@media (prefers-reduced-motion: reduce){
  *{ animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

/* =========================================================================
   FONS AMBIENTAL — l'element "signatura" del disseny.
   Tres taques de gradient, molt desenfocades, que es mouen a càmera
   lentíssima com ones a l'aigua. app.js canvia les variables de color
   segons l'hora / el clima; el CSS només s'encarrega del moviment.
   ========================================================================= */
#ambient-bg{
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--ink);
  transition: background 4s var(--ease-ambient);
}

.ripple{
  position: absolute;
  width: 70vmax;
  height: 70vmax;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  will-change: transform;
  transition: background 6s var(--ease-ambient), opacity 6s var(--ease-ambient);
}

.ripple-a{
  top: -20vmax;
  left: -10vmax;
  background: radial-gradient(circle at 30% 30%, var(--aqua), transparent 70%);
  animation: drift-a 90s var(--ease-ambient) infinite;
}
.ripple-b{
  bottom: -25vmax;
  right: -15vmax;
  background: radial-gradient(circle at 60% 60%, var(--rain), transparent 70%);
  animation: drift-b 110s var(--ease-ambient) infinite;
}
.ripple-c{
  top: 30vh;
  left: 40vw;
  width: 55vmax;
  height: 55vmax;
  background: radial-gradient(circle at 50% 50%, var(--amber), transparent 70%);
  opacity: 0.16;
  animation: drift-c 130s var(--ease-ambient) infinite;
}

@keyframes drift-a{
  0%,100%{ transform: translate(0,0) scale(1); }
  50%{ transform: translate(6vw, 4vh) scale(1.12); }
}
@keyframes drift-b{
  0%,100%{ transform: translate(0,0) scale(1); }
  50%{ transform: translate(-5vw, -6vh) scale(1.08); }
}
@keyframes drift-c{
  0%,100%{ transform: translate(-4vw, 0) scale(1); }
  50%{ transform: translate(4vw, 5vh) scale(1.15); }
}

.grain{
  position: absolute;
  inset: 0;
  background: repeating-radial-gradient(circle at center, rgba(255,255,255,0.015) 0, transparent 1px);
  background-size: 3px 3px;
  mix-blend-mode: overlay;
}

/* =========================================================================
   DISPOSICIÓ PRINCIPAL — graella estil panell de control
   ========================================================================= */
#dashboard{
  position: relative;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  padding: var(--gap);
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: var(--gap);
  grid-template-areas:
    "clock    weather    photosSide"
    "photos   calendar   photosSide"
    "news     news       news";
}

.widget{
  background: var(--mist-soft);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(242,246,247,0.06);
  border-radius: var(--radius-lg);
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  transition: opacity .6s ease;
}

.widget-header{ margin-bottom: 14px; }
.widget-eyebrow{
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: 500;
}

/* --- Rellotge ------------------------------------------------------------ */
.widget-clock{
  grid-area: clock;
  justify-content: center;
  border-radius: var(--radius-lg);
}
.clock-time{
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(64px, 9vw, 128px);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.clock-meta{
  margin-top: 10px;
  font-size: 20px;
  color: var(--slate);
  text-transform: capitalize;
}
.clock-meta .dot{ margin: 0 8px; opacity: .5; }

/* --- Temps exterior ---------------------------------------------------- */
.widget-weather{ grid-area: weather; }
.weather-main{
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 6px 0 18px;
}
.weather-icon{ font-size: 46px; line-height: 1; }
.weather-temp{
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
}
.weather-details{ display: flex; gap: 22px; margin-top: auto; }
.weather-stat{ display: flex; flex-direction: column; gap: 2px; }
.stat-label{ font-size: 12px; color: var(--slate); }
.stat-value{ font-size: 20px; font-weight: 600; font-family: var(--font-display); }

/* --- Calendari ------------------------------------------------------- */
.widget-calendar{ grid-area: calendar; }
.calendar-list{
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}
.calendar-item{
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(242,246,247,0.07);
}
.calendar-item:last-child{ border-bottom: none; padding-bottom: 0; }
.calendar-date{
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--aqua);
  font-size: 14px;
  white-space: nowrap;
}
.calendar-title{ font-size: 15px; color: var(--foam); }
.calendar-time{ margin-left: auto; font-size: 13px; color: var(--slate); }

/* --- Fotografies (comú als dos carrusels: principal i lateral) -------- */
.widget-photos,
.widget-photos-side{
  padding: 0;
  overflow: hidden;
  position: relative;
  min-height: 160px;
}
.widget-photos{ grid-area: photos; }
.widget-photos-side{ grid-area: photosSide; }

.photo-frame{ position: absolute; inset: 0; }
.photo-layer{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.5s ease;
}
.photo-layer.photo-visible{ opacity: 1; }

/* --- Notícies (tira) --------------------------------------------------- */
.widget-news{
  grid-area: news;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 16px 28px;
}
.news-eyebrow{
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--aqua);
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 600;
  flex-shrink: 0;
}
.news-track{ overflow: hidden; flex: 1; }
#news-headline{
  display: inline-block;
  font-size: 17px;
  color: var(--foam);
  animation: news-fade 0.6s ease;
}
@keyframes news-fade{
  from{ opacity: 0; transform: translateY(6px); }
  to{ opacity: 1; transform: translateY(0); }
}

/* Widget desactivat des de config.js: no ocupa espai ni memòria */
.widget-hidden{ display: none !important; }

/* =========================================================================
   RESPONSIVE — per si el dashboard es visualitza en tablets més petites
   ========================================================================= */
@media (max-width: 900px){
  #dashboard{
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "clock      clock"
      "weather    photosSide"
      "photos     calendar"
      "news       news";
  }
  .clock-time{ font-size: clamp(48px, 12vw, 80px); }
}
