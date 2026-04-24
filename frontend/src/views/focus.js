import { supabase } from '../lib/supabase.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function render() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <header style="display: flex; align-items: center; margin-bottom: 2rem;">
        <button class="btn" style="padding: 0; background: none; color: var(--color-primary-light); font-size: 1.5rem;" onclick="window.location.hash='#/dashboard'">←</button>
        <h2 style="flex: 1; text-align: center; margin-right: 1.5rem;">Sessão de Foco</h2>
      </header>

      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        
        <!-- Timer Circle -->
        <div style="position: relative; width: 260px; height: 260px; margin-bottom: 2.5rem;">
          <svg style="position: absolute; top: 0; left: 0; transform: rotate(-90deg);" width="260" height="260">
            <circle cx="130" cy="130" r="115" fill="none" stroke="var(--color-surface)" stroke-width="12"/>
            <circle id="timerRing" cx="130" cy="130" r="115" fill="none" stroke="var(--color-primary)" stroke-width="12"
              stroke-dasharray="722.6" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dashoffset 1s linear;"/>
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h1 id="timerDisplay" style="font-size: 4rem; font-variant-numeric: tabular-nums; margin: 0; color: var(--color-text-primary); font-weight: 700;">30:00</h1>
            <p style="color: var(--color-text-secondary); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px;">Foco Profundo</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 2.5rem;">
          <button id="btnStart" class="btn btn-primary" style="width: 130px; padding: 0.9rem;">▶ Iniciar</button>
          <button id="btnPause" class="btn btn-secondary" style="width: 130px; padding: 0.9rem; display: none;">⏸ Pausar</button>
          <button id="btnStop" class="btn btn-secondary" style="width: 130px; padding: 0.9rem;">⏹ Parar</button>
        </div>
        
        <!-- Sound Selector -->
        <div class="card" style="width: 100%; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">🎧</span>
              <div>
                <p style="font-weight: 600; font-size: 0.9rem;">Som de Foco</p>
                <p id="soundLabel" style="font-size: 0.8rem; color: var(--color-text-secondary);">Desligado</p>
              </div>
            </div>
            <button id="btnPlaySound" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">▶ Ativar</button>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="sound-btn btn btn-secondary" data-sound="rain" style="flex:1; font-size: 0.8rem; padding: 0.4rem 0.5rem;">🌧 Chuva</button>
            <button class="sound-btn btn btn-secondary" data-sound="brown" style="flex:1; font-size: 0.8rem; padding: 0.4rem 0.5rem;">🌊 Ondas</button>
            <button class="sound-btn btn btn-secondary" data-sound="white" style="flex:1; font-size: 0.8rem; padding: 0.4rem 0.5rem;">🌀 Branco</button>
            <button class="sound-btn btn btn-secondary" data-sound="binaural" style="flex:1; font-size: 0.8rem; padding: 0.4rem 0.5rem;">🎵 Binaural</button>
          </div>
        </div>

        <!-- Completion Message -->
        <div id="completionMsg" style="display: none;" class="card" style="border-left: 4px solid var(--color-primary); text-align: center;">
          <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎉</p>
          <p style="color: var(--color-primary-light); font-weight: 600;">Sessão concluída! +50 XP</p>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const DURATION = 30 * 60; // 30 minutes in seconds
  let timerInterval = null;
  let audioCtx = null;
  let currentSound = null;
  let selectedSound = 'rain';

  const display = document.getElementById('timerDisplay');
  const ring = document.getElementById('timerRing');
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnStop = document.getElementById('btnStop');
  const btnPlaySound = document.getElementById('btnPlaySound');
  const soundLabel = document.getElementById('soundLabel');
  const completionMsg = document.getElementById('completionMsg');
  const CIRCUMFERENCE = 722.6;

  // ─── Persistent Timer Logic ───────────────────────────────────────────────
  function getStoredTimer() {
    const stored = localStorage.getItem('kima_timer');
    return stored ? JSON.parse(stored) : null;
  }

  function saveTimer(startTime, pausedAt = null) {
    localStorage.setItem('kima_timer', JSON.stringify({ startTime, pausedAt, duration: DURATION }));
  }

  function clearTimer() {
    localStorage.removeItem('kima_timer');
  }

  function getTimeLeft() {
    const t = getStoredTimer();
    if (!t) return DURATION;
    if (t.pausedAt !== null) {
      // Timer was paused - return the saved time left
      return t.pausedAt;
    }
    const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
    return Math.max(0, DURATION - elapsed);
  }

  // ─── Display ──────────────────────────────────────────────────────────────
  function updateDisplay(timeLeft) {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
    const progress = timeLeft / DURATION;
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    if (progress < 0.25) ring.style.stroke = 'var(--color-error)';
    else if (progress < 0.5) ring.style.stroke = 'var(--color-warning)';
    else ring.style.stroke = 'var(--color-primary)';
  }

  async function onComplete() {
    clearInterval(timerInterval);
    clearTimer();
    stopSound();
    completionMsg.style.display = 'block';
    btnPause.style.display = 'none';
    btnStart.style.display = 'block';
    btnStart.disabled = true;

    // Save session to Supabase and award XP
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('focus_sessions').insert([{ user_id: user.id, duration_minutes: 30, completed: true }]);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        const newScore = (profile.score || 0) + 50;
        const newLevel = Math.floor(newScore / 500) + 1;
        await supabase.from('profiles').update({ score: newScore, level: newLevel }).eq('id', user.id);
      }
    }

    // AI message
    try {
      const aiStyle = localStorage.getItem('kima_ai_style') || 'mentor';
      const res = await fetch(`${API_URL}/api/ai/motivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'completou um Pomodoro de 30 minutos', streak: 0, level: 1, aiStyle })
      });
      const data = await res.json();
      completionMsg.innerHTML = `
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎉</p>
        <p style="color: var(--color-primary-light); font-weight: 600; margin-bottom: 0.75rem;">+50 XP Ganhos!</p>
        <p style="font-style: italic; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.5;">"${data.message || ''}"</p>
        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="window.location.hash='#/dashboard'">Voltar ao Dashboard</button>`;
    } catch {
      completionMsg.innerHTML += `<button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="window.location.hash='#/dashboard'">Voltar ao Dashboard</button>`;
    }
  }

  function startTicking() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const timeLeft = getTimeLeft();
      updateDisplay(timeLeft);
      if (timeLeft <= 0) onComplete();
    }, 500);
  }

  // ─── Restore state on load ────────────────────────────────────────────────
  const stored = getStoredTimer();
  if (stored) {
    if (stored.pausedAt !== null) {
      // Was paused — show paused state
      updateDisplay(stored.pausedAt);
      btnStart.style.display = 'block';
      btnPause.style.display = 'none';
    } else {
      // Was running — resume
      const timeLeft = getTimeLeft();
      if (timeLeft > 0) {
        updateDisplay(timeLeft);
        btnStart.style.display = 'none';
        btnPause.style.display = 'block';
        startTicking();
      } else {
        clearTimer();
        updateDisplay(DURATION);
      }
    }
  } else {
    updateDisplay(DURATION);
  }

  // ─── Controls ─────────────────────────────────────────────────────────────
  btnStart.addEventListener('click', () => {
    const t = getStoredTimer();
    if (t && t.pausedAt !== null) {
      // Resume from pause: recalculate startTime
      const newStart = Date.now() - (DURATION - t.pausedAt) * 1000;
      saveTimer(newStart, null);
    } else {
      // Fresh start
      saveTimer(Date.now(), null);
    }
    btnStart.style.display = 'none';
    btnPause.style.display = 'block';
    startTicking();
  });

  btnPause.addEventListener('click', () => {
    clearInterval(timerInterval);
    const timeLeft = getTimeLeft();
    const t = getStoredTimer();
    if (t) saveTimer(t.startTime, timeLeft);
    btnStart.style.display = 'block';
    btnPause.style.display = 'none';
  });

  btnStop.addEventListener('click', () => {
    clearInterval(timerInterval);
    clearTimer();
    stopSound();
    updateDisplay(DURATION);
    ring.style.strokeDashoffset = 0;
    ring.style.stroke = 'var(--color-primary)';
    btnStart.style.display = 'block';
    btnStart.disabled = false;
    btnPause.style.display = 'none';
    completionMsg.style.display = 'none';
  });

  // Web Audio Sounds
  function createAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function createRainSound(ctx) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.1;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    return { stop: () => { try { source.stop(); } catch(e) {} } };
  }

  function createBrownNoise(ctx) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.25;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    return { stop: () => { try { source.stop(); } catch(e) {} } };
  }

  function createWhiteNoise(ctx) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.08;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    return { stop: () => { try { source.stop(); } catch(e) {} } };
  }

  function createBinauralBeat(ctx) {
    // 40Hz binaural beat (gamma - focus)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const merger = ctx.createChannelMerger(2);
    osc1.frequency.value = 200;
    osc2.frequency.value = 240; // 40Hz difference
    gain1.gain.value = 0.08;
    gain2.gain.value = 0.08;
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(merger, 0, 0);
    gain2.connect(merger, 0, 1);
    merger.connect(ctx.destination);
    osc1.start();
    osc2.start();
    return { stop: () => { try { osc1.stop(); osc2.stop(); } catch(e) {} } };
  }

  function playSound(type) {
    if (currentSound) { currentSound.stop(); currentSound = null; }
    const ctx = createAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const labels = { rain: '🌧 Chuva', brown: '🌊 Ondas', white: '🌀 Ruído Branco', binaural: '🎵 Binaural 40Hz' };
    soundLabel.textContent = labels[type] || type;
    if (type === 'rain') currentSound = createRainSound(ctx);
    else if (type === 'brown') currentSound = createBrownNoise(ctx);
    else if (type === 'white') currentSound = createWhiteNoise(ctx);
    else if (type === 'binaural') currentSound = createBinauralBeat(ctx);
    btnPlaySound.textContent = '⏹ Parar som';
  }

  function stopSound() {
    if (currentSound) { currentSound.stop(); currentSound = null; }
    soundLabel.textContent = 'Desligado';
    btnPlaySound.textContent = '▶ Ativar';
  }

  // Sound button handlers
  document.querySelectorAll('.sound-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sound-btn').forEach(b => b.style.borderColor = '');
      btn.style.borderColor = 'var(--color-primary)';
      selectedSound = btn.dataset.sound;
      if (currentSound) playSound(selectedSound);
    });
  });

  btnPlaySound.addEventListener('click', () => {
    if (currentSound) stopSound();
    else playSound(selectedSound);
  });
}
