/**
 * timer.js
 * -----------------------------------------------------------------------
 * Widget INTERACTIU (l'únic de tot el dashboard). Ocupa el lloc del
 * carrusel de la columna dreta i permet:
 *   - Botons ràpids (1 / 5 / 10 / 30 minuts) definits a config.js
 *   - Un temps personalitzat (l'usuari escriu els minuts)
 *   - Pausar / reprendre i reiniciar
 *   - Un so d'alarma concret en acabar (config.timer.soundFile)
 * -----------------------------------------------------------------------
 */

const TimerWidget = (() => {

  let intervalId = null;
  let remainingSeconds = 0;
  let isRunning = false;

  let displayEl, presetButtons, customInput, customStartBtn, pauseBtn, resetBtn, audioEl;

  function formatTime(totalSeconds){
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function render(){
    if (displayEl) displayEl.textContent = formatTime(Math.max(remainingSeconds, 0));
  }

  function stopAlarm(){
    if (audioEl){
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl.loop = false;
    }
    if (displayEl) displayEl.classList.remove('is-ringing');
  }

  function playAlarm(){
    if (!audioEl) return;
    audioEl.loop = true;
    audioEl.currentTime = 0;
    audioEl.play().catch(function(err){ console.warn('[TimerWidget] no s\'ha pogut reproduir el so', err); });
    if (displayEl) displayEl.classList.add('is-ringing');
  }

  function tick(){
    remainingSeconds -= 1;
    render();
    if (remainingSeconds <= 0){
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;
      if (pauseBtn) pauseBtn.textContent = 'Pausa';
      playAlarm();
    }
  }

  function start(){
    if (remainingSeconds <= 0) return;
    stopAlarm();
    if (intervalId) clearInterval(intervalId);
    isRunning = true;
    if (pauseBtn) pauseBtn.textContent = 'Pausa';
    intervalId = setInterval(tick, 1000);
  }

  function togglePause(){
    stopAlarm();
    if (isRunning){
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;
      if (pauseBtn) pauseBtn.textContent = 'Reprèn';
    } else if (remainingSeconds > 0){
      start();
    }
  }

  function reset(){
    stopAlarm();
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    remainingSeconds = 0;
    if (pauseBtn) pauseBtn.textContent = 'Pausa';
    render();
  }

  function unlockAudio(){
    if (!audioEl) return;
    // Reproduir i aturar l'àudio EN EL MATEIX GEST de l'usuari (el clic)
    // "desbloqueja" el so per a aquesta pàgina — així, quan el compte
    // enrere arribi a zero més endavant, el navegador ja permet
    // reproduir-lo sense bloquejar-lo per motius de seguretat.
    const p = audioEl.play();
    if (p && typeof p.then === 'function'){
      p.then(function(){
        audioEl.pause();
        audioEl.currentTime = 0;
      }).catch(function(err){
        console.warn('[TimerWidget] no s\'ha pogut desbloquejar l\'àudio', err);
      });
    }
  }

  function startWithMinutes(minutes){
    unlockAudio();
    const cfg = window.DASHBOARD_CONFIG.timer;
    const max = cfg.maxCustomMinutes || 180;
    const clamped = Math.min(Math.max(Math.round(minutes), 1), max);
    stopAlarm();
    remainingSeconds = clamped * 60;
    render();
    start();
  }

  function buildPresetButtons(){
    if (!presetButtons) return;
    presetButtons.forEach(function(btn){
      btn.addEventListener('click', function(){
        const minutes = parseInt(btn.dataset.minutes, 10);
        if (!isNaN(minutes)) startWithMinutes(minutes);
      });
    });
  }

  function handleCustomStart(){
    const value = parseInt(customInput.value, 10);
    if (!isNaN(value) && value > 0) startWithMinutes(value);
  }

  function init(){
    displayEl      = document.getElementById('timer-display');
    presetButtons  = document.querySelectorAll('.timer-presets .timer-btn');
    customInput    = document.getElementById('timer-custom-input');
    customStartBtn = document.getElementById('timer-custom-start');
    pauseBtn       = document.getElementById('timer-pause');
    resetBtn       = document.getElementById('timer-reset');
    audioEl        = document.getElementById('timer-alarm-audio');

    const cfg = window.DASHBOARD_CONFIG.timer;
    if (audioEl && cfg && cfg.soundFile) audioEl.src = cfg.soundFile;
    if (customInput && cfg) customInput.max = cfg.maxCustomMinutes || 180;

    buildPresetButtons();

    if (customStartBtn) customStartBtn.addEventListener('click', handleCustomStart);
    if (customInput){
      customInput.addEventListener('keydown', function(e){
        if (e.key === 'Enter') handleCustomStart();
      });
    }
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    render();
  }

  function destroy(){
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  return { init: init, destroy: destroy };
})();

window.TimerWidget = TimerWidget;
