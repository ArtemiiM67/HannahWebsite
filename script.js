// script.js
(() => {
  // ===================== MESSAGES (ONLY THIS LIST) =====================
  const LOVE_LINES = [
    "I love you to the moon and back 🌙💘",
    "You're my whole world 🌎💖",
    "I'm forever grateful for you 🥹💗",
    "I can't wait to marry you my sweet girl 💍💞",
    "My heart is forever yours ❤️‍🔥💘"
  ];

  // ===================== ELEMENTS =====================
  const intro = document.getElementById("intro");
  const introLine = document.getElementById("introLine");
  const perfPill = document.getElementById("perfPill");

  const toLove = document.getElementById("toLove");
  const toDraw = document.getElementById("toDraw");
  const toGame = document.getElementById("toGame");

  const screenLove = document.getElementById("screenLove");
  const screenDraw = document.getElementById("screenDraw");
  const screenGame = document.getElementById("screenGame");

  const cardLove = document.getElementById("cardLove");
  const typeEl = document.getElementById("type");
  const subtitle = document.getElementById("subtitle");
  const burstBtn = document.getElementById("burstBtn");
  const momentBtn = document.getElementById("momentBtn");

  const openPanel = document.getElementById("openPanel");
  const closePanel = document.getElementById("closePanel");
  const panel = document.getElementById("panel");

  const tEco = document.getElementById("tEco");
  const tNeon = document.getElementById("tNeon");
  const tHearts = document.getElementById("tHearts");
  const tMeteors = document.getElementById("tMeteors");
  const tConst = document.getElementById("tConstellations");
  const tMotionLock = document.getElementById("tMotionLock");
  const sIntensity = document.getElementById("sIntensity");
  const sHearts = document.getElementById("sHearts");
  const intensityVal = document.getElementById("intensityVal");
  const heartsVal = document.getElementById("heartsVal");
  const resetBtn = document.getElementById("resetBtn");
  const megaBtn = document.getElementById("megaBtn");

  // Draw
  const drawCanvas = document.getElementById("draw");
  const drawMsg = document.getElementById("drawMsg");
  const paletteEl = document.getElementById("palette");
  const brushSizeEl = document.getElementById("brushSize");
  const undoBtn = document.getElementById("undoBtn");
  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const modeButtons = Array.from(document.querySelectorAll(".chipbtn"));

  // Games UI
  const tabFlappy = document.getElementById("tabFlappy");
  const tabCatch = document.getElementById("tabCatch");
  const tabMemory = document.getElementById("tabMemory");
  const tabPop = document.getElementById("tabPop");
  const tabPong = document.getElementById("tabPong");

  const gameCanvas = document.getElementById("game");
  const labelA = document.getElementById("labelA");
  const labelB = document.getElementById("labelB");
  const scoreEl = document.getElementById("score");
  const candyEl = document.getElementById("candy");
  const highScoreEl = document.getElementById("highScore");
  const overlay = document.getElementById("gameOverlay");
  const startGameBtn = document.getElementById("startGameBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const megaCandyBtn = document.getElementById("megaCandyBtn");
  const gameMsg = document.getElementById("gameMsg");

  // Memory (DOM)
  const memoryWrap = document.getElementById("memoryWrap");
  const memoryGrid = document.getElementById("memoryGrid");
  const memoryNew = document.getElementById("memoryNew");
  const memoryHint = document.getElementById("memoryHint");

  // Background FX
  const fx = document.getElementById("fx");
  const fxCtx = fx.getContext("2d", { alpha: true });

  // Hearts stream
  const heartField = document.getElementById("heartField");

  // ===================== HELPERS =====================
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const smallScreen = Math.min(innerWidth, innerHeight) < 520;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  function withAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const val = JSON.parse(raw);
      return val ?? fallback;
    } catch { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }

  // ===================== STATE =====================
  const state = {
    started: false,
    screen: "love",

    eco: smallScreen || prefersReduced,
    neon: false,
    hearts: true,
    meteors: true,
    constellations: true,
    motionLock: false,

    intensity: 1.0,
    heartRate: 65
  };

  function applyClasses() {
    document.body.classList.toggle("eco", state.eco);
    document.body.classList.toggle("neon", state.neon);
  }

  // ===================== INTRO =====================
  let introIdx = 0;
  setInterval(() => {
    if (!introLine) return;
    introLine.textContent = LOVE_LINES[introIdx % LOVE_LINES.length];
    introIdx++;
  }, 900);

  function startExperience() {
    if (state.started) return;
    state.started = true;

    intro?.classList?.add("hidden");
    setTimeout(() => intro?.remove?.(), 650);

    setMessage(0, true);
    setTimeout(() => loveBurst(state.eco ? 90 : 130, 50), 220);
  }

  intro?.addEventListener?.("pointerup", startExperience, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (!state.started && (e.key === "Enter" || e.key === " ")) startExperience();
  });

  // ===================== NAVIGATION =====================
  function setActiveNav() {
    [toLove, toDraw, toGame].forEach(b => b.classList.remove("active"));
    if (state.screen === "love") toLove.classList.add("active");
    if (state.screen === "draw") toDraw.classList.add("active");
    if (state.screen === "game") toGame.classList.add("active");
  }

  function showScreen(name) {
    if (!state.started) startExperience();
    state.screen = name;

    screenLove.classList.toggle("active", name === "love");
    screenDraw.classList.toggle("active", name === "draw");
    screenGame.classList.toggle("active", name === "game");

    screenLove.setAttribute("aria-hidden", name === "love" ? "false" : "true");
    screenDraw.setAttribute("aria-hidden", name === "draw" ? "false" : "true");
    screenGame.setAttribute("aria-hidden", name === "game" ? "false" : "true");

    setActiveNav();

    if (name === "draw") drawMsg.textContent = LOVE_LINES[(msgIndex + 1) % LOVE_LINES.length];
    if (name === "game") gameMsg.textContent = LOVE_LINES[(msgIndex + 2) % LOVE_LINES.length];

    resizeAllCanvases();
  }

  toLove.addEventListener("click", () => showScreen("love"));
  toDraw.addEventListener("click", () => showScreen("draw"));
  toGame.addEventListener("click", () => showScreen("game"));

  // ===================== CONTROL PANEL =====================
  function openControls() { panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); }
  function closeControls() { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); }
  openPanel.addEventListener("click", openControls);
  closePanel.addEventListener("click", closeControls);

  window.addEventListener("pointerup", (e) => {
    if (!panel.classList.contains("open")) return;
    const within = panel.contains(e.target) || openPanel.contains(e.target);
    if (!within) closeControls();
  }, { passive: true });

  // bind UI defaults
  tEco.checked = state.eco;
  tNeon.checked = state.neon;
  tHearts.checked = state.hearts;
  tMeteors.checked = state.meteors;
  tConst.checked = state.constellations;
  tMotionLock.checked = state.motionLock;
  sIntensity.value = String(state.intensity);
  sHearts.value = String(state.heartRate);
  intensityVal.textContent = state.intensity.toFixed(2);
  heartsVal.textContent = String(state.heartRate);
  applyClasses();

  tEco.addEventListener("change", () => { state.eco = tEco.checked; applyClasses(); resizeFX(); refreshHearts(); syncDifficulty(); });
  tNeon.addEventListener("change", () => { state.neon = tNeon.checked; applyClasses(); });
  tHearts.addEventListener("change", () => { state.hearts = tHearts.checked; refreshHearts(); });
  tMeteors.addEventListener("change", () => { state.meteors = tMeteors.checked; });
  tConst.addEventListener("change", () => { state.constellations = tConst.checked; });
  tMotionLock.addEventListener("change", () => { state.motionLock = tMotionLock.checked; if (state.motionLock){ tiltX = 0; tiltY = 0; applyTilt(); } });
  sIntensity.addEventListener("input", () => { state.intensity = parseFloat(sIntensity.value); intensityVal.textContent = state.intensity.toFixed(2); });
  sHearts.addEventListener("input", () => { state.heartRate = parseInt(sHearts.value, 10); heartsVal.textContent = String(state.heartRate); refreshHearts(); });

  resetBtn.addEventListener("click", () => {
    Object.assign(state, {
      eco: smallScreen || prefersReduced,
      neon: false,
      hearts: true,
      meteors: true,
      constellations: true,
      motionLock: false,
      intensity: 1.0,
      heartRate: 65
    });

    tEco.checked = state.eco;
    tNeon.checked = state.neon;
    tHearts.checked = state.hearts;
    tMeteors.checked = state.meteors;
    tConst.checked = state.constellations;
    tMotionLock.checked = state.motionLock;
    sIntensity.value = String(state.intensity);
    sHearts.value = String(state.heartRate);
    intensityVal.textContent = state.intensity.toFixed(2);
    heartsVal.textContent = String(state.heartRate);

    applyClasses();
    resizeFX();
    refreshHearts();
    syncDifficulty();

    setMessage(0, true);
    loveBurst(state.eco ? 90 : 130, 50);
  });

  megaBtn.addEventListener("click", () => {
    state.eco = false;
    state.neon = true;
    state.hearts = true;
    state.meteors = true;
    state.constellations = true;
    state.intensity = 1.35;
    state.heartRate = 92;

    tEco.checked = state.eco;
    tNeon.checked = state.neon;
    tHearts.checked = state.hearts;
    tMeteors.checked = state.meteors;
    tConst.checked = state.constellations;
    sIntensity.value = String(state.intensity);
    sHearts.value = String(state.heartRate);
    intensityVal.textContent = state.intensity.toFixed(2);
    heartsVal.textContent = String(state.heartRate);

    applyClasses();
    resizeFX();
    refreshHearts();
    syncDifficulty();
    loveBurst(180, 50);
    closeControls();
  });

  // ===================== LOVE SCREEN TEXT =====================
  const titleText = "I Love You Hannah Banana 💘";
  let titleI = 0;
  function typeTitle() {
    typeEl.textContent = titleText.slice(0, titleI);
    titleI++;
    if (titleI <= titleText.length) setTimeout(typeTitle, 44);
  }
  typeTitle();

  let msgIndex = 0;
  function setMessage(idx, immediate = false) {
    msgIndex = idx % LOVE_LINES.length;
    if (immediate) {
      subtitle.textContent = LOVE_LINES[msgIndex];
      subtitle.style.opacity = 1;
      subtitle.style.transform = "translateY(0)";
      return;
    }
    subtitle.style.opacity = 0;
    subtitle.style.transform = "translateY(2px)";
    setTimeout(() => {
      subtitle.textContent = LOVE_LINES[msgIndex];
      subtitle.style.opacity = 1;
      subtitle.style.transform = "translateY(0)";
    }, 200);
  }
  subtitle.textContent = LOVE_LINES[0];

  momentBtn.addEventListener("click", () => {
    setMessage(msgIndex + 1);
    loveBurst(state.eco ? 70 : 120, rand(38, 62));
    if (Math.random() < 0.6) spawnMeteor(true);
  });

  burstBtn.addEventListener("click", () => loveBurst());

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") loveBurst(state.eco ? 90 : 160, rand(20, 80));
    if (e.key.toLowerCase() === "m") spawnMeteor(true);
  });

  window.addEventListener("pointerup", (e) => {
    if (!state.started) startExperience();
    addSparks(e.clientX, e.clientY, state.eco ? 40 : 66);
    if (Math.random() < 0.75) loveBurst(state.eco ? 10 : 18, (e.clientX / innerWidth) * 100);
  }, { passive: true });

  // ===================== TILT PARALLAX =====================
  let tiltX = 0, tiltY = 0;
  let tilting = false;

  function applyTilt() {
    if (state.screen !== "love") return;
    const rx = (tiltY * -8).toFixed(2);
    const ry = (tiltX * 10).toFixed(2);
    cardLove.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }
  function setTiltFromClient(x, y) {
    tiltX = (x / innerWidth) * 2 - 1;
    tiltY = (y / innerHeight) * 2 - 1;
    applyTilt();
  }

  window.addEventListener("pointerdown", (e) => {
    if (state.motionLock) return;
    tilting = true;
    setTiltFromClient(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    if (state.motionLock) return;
    if (!tilting && e.pointerType === "touch") return;
    setTiltFromClient(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    if (state.motionLock) return;
    tilting = false;
    tiltX *= 0.25; tiltY *= 0.25;
    applyTilt();
  }, { passive: true });

  // ===================== BACKGROUND FX =====================
  let W = 0, H = 0, DPR = 1;
  let stars = [];
  let wisps = [];
  let sparks = [];
  let meteors = [];

  function starCount() {
    const base = state.eco ? 98000 : 68000;
    return Math.floor((W * H) / base);
  }
  function wispCount() { return state.eco ? 5 : 9; }
  function newWisp() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: rand(-0.12, 0.12) * DPR, vy: rand(-0.08, 0.08) * DPR,
      a: rand(0.08, 0.16), r: rand(220, 520) * DPR,
      hue: Math.random() < 0.5 ? rand(300, 335) : rand(190, 205),
      ph: rand(0, Math.PI * 2)
    };
  }

  function resizeFX() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    fx.width = W; fx.height = H;

    stars = Array.from({ length: starCount() }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: rand(0.25, 1.0), r: rand(0.6, 1.7) * DPR,
      tw: rand(0, Math.PI * 2), hue: rand(310, 360)
    }));
    wisps = Array.from({ length: wispCount() }, () => newWisp());
  }

  function addSparks(x, y, count = 50) {
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = rand(1.2, state.eco ? 5.6 : 7.2) * DPR;
      sparks.push({
        x: x * DPR, y: y * DPR,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(18, state.eco ? 40 : 54),
        r: rand(1.0, 2.2) * DPR,
        hue: rand(300, 360)
      });
    }
    const cap = state.eco ? 220 : 480;
    if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
  }

  function spawnMeteor(force = false) {
    if (!state.meteors && !force) return;
    if (!force && Math.random() > (state.eco ? 0.004 : 0.007)) return;

    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? rand(-0.2, 0.2) * W : rand(0.8, 1.2) * W;
    const y = rand(0.05, 0.35) * H;
    const vx = fromLeft ? rand(8, 12) : rand(-12, -8);
    const vy = rand(3, 6);

    meteors.push({ x, y, vx: vx * DPR, vy: vy * DPR, life: 1.0, len: rand(160, 280) * DPR });

    const cap = state.eco ? 2 : 4;
    if (meteors.length > cap) meteors.splice(0, meteors.length - cap);
  }

  let frameSamples = [];
  function updatePerf(ms) {
    frameSamples.push(ms);
    if (frameSamples.length > 30) frameSamples.shift();
    const avg = frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length;
    perfPill.textContent = (avg > 20 && !state.eco) ? "🧊 try eco" : "⚡ smooth";
  }

  let lastT = performance.now();
  function fxFrame(t) {
    const rawDt = Math.min(34, t - lastT);
    lastT = t;
    const dt = rawDt * state.intensity;

    updatePerf(rawDt);

    fxCtx.globalCompositeOperation = "source-over";
    fxCtx.globalAlpha = 0.16;
    fxCtx.fillStyle = "#06040d";
    fxCtx.fillRect(0, 0, W, H);
    fxCtx.globalAlpha = 1;

    const parX = tiltX * 18 * DPR;
    const parY = tiltY * 12 * DPR;

    fxCtx.globalCompositeOperation = "lighter";
    for (const w of wisps) {
      w.ph += 0.0016 * dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;

      if (w.x < -w.r) w.x = W + w.r;
      if (w.x > W + w.r) w.x = -w.r;
      if (w.y < -w.r) w.y = H + w.r;
      if (w.y > H + w.r) w.y = -w.r;

      const pulse = 0.6 + 0.4 * Math.sin(w.ph);
      const rr = w.r * (0.82 + 0.18 * pulse);

      const gx = w.x + parX * w.a * 1.2;
      const gy = w.y + parY * w.a * 1.1;

      const g = fxCtx.createRadialGradient(gx, gy, 0, gx, gy, rr);
      const a = w.a * (state.eco ? 0.85 : 1.0);
      g.addColorStop(0, `hsla(${w.hue},95%,70%,${a * 0.55})`);
      g.addColorStop(0.45, `hsla(${w.hue + 18},95%,65%,${a * 0.22})`);
      g.addColorStop(1, `hsla(${w.hue + 40},95%,60%,0)`);
      fxCtx.fillStyle = g;
      fxCtx.beginPath();
      fxCtx.arc(gx, gy, rr, 0, Math.PI * 2);
      fxCtx.fill();
    }

    fxCtx.globalCompositeOperation = "lighter";
    for (const s of stars) {
      s.tw += (0.002 + 0.006 * s.z) * dt;
      const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.tw));
      fxCtx.globalAlpha = a * (0.35 + 0.65 * s.z);
      fxCtx.beginPath();
      fxCtx.arc(s.x + parX * s.z, s.y + parY * s.z, s.r, 0, Math.PI * 2);
      fxCtx.fillStyle = `hsla(${s.hue},100%,85%,1)`;
      fxCtx.fill();
    }
    fxCtx.globalAlpha = 1;

    if (state.constellations) {
      const maxLinks = state.eco ? 55 : 120;
      let links = 0;
      fxCtx.lineWidth = 1 * DPR;

      for (let i = 0; i < stars.length && links < maxLinks; i++) {
        const a = stars[i];
        for (let j = i + 1; j < i + 10 && j < stars.length; j++) {
          const b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const thresh = (state.eco ? 90 : 120) * DPR;
          if (d2 < thresh * thresh) {
            const alpha = 0.14 * (1 - Math.sqrt(d2) / thresh);
            fxCtx.globalAlpha = alpha;
            fxCtx.strokeStyle = "rgba(255,255,255,1)";
            fxCtx.beginPath();
            fxCtx.moveTo(a.x + parX * a.z, a.y + parY * a.z);
            fxCtx.lineTo(b.x + parX * b.z, b.y + parY * b.z);
            fxCtx.stroke();
            links++;
          }
        }
      }
      fxCtx.globalAlpha = 1;
    }

    spawnMeteor(false);
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life -= 0.012 * (dt / 16);
      m.x += m.vx * (dt / 16);
      m.y += m.vy * (dt / 16);

      const a = Math.max(0, m.life);
      fxCtx.globalAlpha = a;

      fxCtx.strokeStyle = "rgba(255,255,255,1)";
      fxCtx.lineWidth = 2 * DPR;
      fxCtx.beginPath();
      fxCtx.moveTo(m.x, m.y);
      fxCtx.lineTo(m.x - m.vx * 0.8, m.y - m.vy * 0.8);
      fxCtx.stroke();

      fxCtx.globalAlpha = a * 0.5;
      fxCtx.lineWidth = 4 * DPR;
      const mm = Math.max(0.0001, Math.hypot(m.vx, m.vy));
      fxCtx.beginPath();
      fxCtx.moveTo(m.x, m.y);
      fxCtx.lineTo(m.x - (m.vx / mm) * m.len, m.y - (m.vy / mm) * m.len);
      fxCtx.stroke();

      fxCtx.globalAlpha = 1;
      if (m.life <= 0 || m.x < -300 || m.x > W + 300 || m.y > H + 300) meteors.splice(i, 1);
    }

    fxCtx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life -= 1;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02 * DPR;
      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, p.life / (state.eco ? 40 : 54));
      fxCtx.globalAlpha = a;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fxCtx.fillStyle = `hsla(${p.hue},100%,70%,1)`;
      fxCtx.fill();

      if (p.life <= 0) sparks.splice(i, 1);
    }

    fxCtx.globalAlpha = 1;
    fxCtx.globalCompositeOperation = "source-over";
    requestAnimationFrame(fxFrame);
  }

  // ===================== HEARTS STREAM =====================
  const COLORS = [
    "rgba(255,77,166,.95)",
    "rgba(255,45,85,.95)",
    "rgba(124,77,255,.92)",
    "rgba(45,252,255,.86)",
    "rgba(255,211,110,.80)"
  ];

  const heartPool = [];
  let heartsAlive = 0;
  let heartTimer = null;

  function heartCap() {
    if (!state.hearts) return 0;
    if (state.eco) return 20 + Math.floor(state.heartRate * 0.18);
    return 34 + Math.floor(state.heartRate * 0.22);
  }
  function heartInterval() {
    if (!state.hearts) return 999999;
    const r = state.heartRate / 100;
    return state.eco ? lerp(900, 220, r) : lerp(650, 160, r);
  }

  function newHeartEl() {
    const h = document.createElement("div");
    h.className = "heart";
    heartField.appendChild(h);
    return h;
  }
  function getHeartEl() { return heartPool.pop() || newHeartEl(); }
  function releaseHeartEl(h) {
    h.style.animation = "none";
    h.style.opacity = "0";
    // eslint-disable-next-line no-unused-expressions
    h.offsetHeight;
    heartPool.push(h);
  }

  function spawnHeart({ xvw = Math.random() * 100, size = rand(0.65, 2.2), t = rand(6.5, 14.5), drift = rand(-12, 12) } = {}) {
    if (!state.hearts) return;
    if (heartsAlive >= heartCap()) return;

    const h = getHeartEl();
    heartsAlive++;

    h.style.setProperty("--x", `${xvw}vw`);
    h.style.setProperty("--s", size);
    h.style.setProperty("--drift", `${drift}vw`);
    h.style.setProperty("--c", COLORS[(Math.random() * COLORS.length) | 0]);
    h.style.animation = `rise ${t}s linear 1`;

    const done = () => {
      h.removeEventListener("animationend", done);
      heartsAlive--;
      releaseHeartEl(h);
    };
    h.addEventListener("animationend", done);
  }

  function refreshHearts() {
    if (heartTimer) clearInterval(heartTimer);
    heartTimer = setInterval(() => spawnHeart(), heartInterval());
  }

  function seedHearts() {
    const n = state.eco ? 12 : 22;
    for (let k = 0; k < n; k++) {
      spawnHeart({ xvw: Math.random() * 100, size: rand(0.6, 1.9), t: rand(7, 15), drift: rand(-10, 10) });
    }
  }

  function loveBurst(n = state.eco ? 70 : 120, xvw = 50) {
    if (!state.started) startExperience();
    for (let k = 0; k < n; k++) {
      spawnHeart({
        xvw: clamp(xvw + rand(-10, 10), 0, 100),
        size: rand(0.7, state.eco ? 2.4 : 3.1),
        t: rand(4.2, state.eco ? 8.8 : 9.6),
        drift: rand(-18, 18)
      });
    }
    addSparks((xvw / 100) * innerWidth, innerHeight * rand(0.35, 0.65), state.eco ? 36 : 60);
  }

  // ===================== DRAWING =====================
  const dctx = drawCanvas.getContext("2d", { alpha: true });
  let drawW = 0, drawH = 0, drawDPR = 1;

  const palette = [
    "#ff4da6", "#ff2d55", "#7c4dff", "#2dfcff", "#ffd36e",
    "#ffffff", "#ff9bd6", "#b792ff", "#7cffd9", "#ff7b2d"
  ];
  let drawColor = palette[0];
  let drawMode = "brush";
  let brushSize = parseInt(brushSizeEl.value, 10);

  const undoStack = [];
  const UNDO_MAX = 12;

  function pushUndo() {
    try {
      const img = dctx.getImageData(0, 0, drawW, drawH);
      undoStack.push(img);
      if (undoStack.length > UNDO_MAX) undoStack.shift();
    } catch { /* ignore */ }
  }

  function clearDraw() {
    dctx.clearRect(0, 0, drawW, drawH);
    const g = dctx.createLinearGradient(0, 0, drawW, drawH);
    g.addColorStop(0, "rgba(255,77,166,.06)");
    g.addColorStop(0.5, "rgba(124,77,255,.04)");
    g.addColorStop(1, "rgba(45,252,255,.05)");
    dctx.fillStyle = g;
    dctx.fillRect(0, 0, drawW, drawH);
  }

  function setActiveMode(btn) {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    drawMode = btn.dataset.mode;
  }
  modeButtons.forEach(b => b.addEventListener("click", () => setActiveMode(b)));

  function buildPalette() {
    paletteEl.innerHTML = "";
    palette.forEach((c, idx) => {
      const s = document.createElement("div");
      s.className = "swatch" + (idx === 0 ? " active" : "");
      s.style.background = c;
      s.addEventListener("click", () => {
        drawColor = c;
        Array.from(paletteEl.children).forEach(ch => ch.classList.remove("active"));
        s.classList.add("active");
      });
      paletteEl.appendChild(s);
    });
  }
  buildPalette();

  brushSizeEl.addEventListener("input", () => { brushSize = parseInt(brushSizeEl.value, 10); });
  undoBtn.addEventListener("click", () => {
    if (!undoStack.length) return;
    const img = undoStack.pop();
    dctx.putImageData(img, 0, 0);
  });
  clearBtn.addEventListener("click", () => { pushUndo(); clearDraw(); });
  saveBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "hannah_banana_love_art.png";
    a.href = drawCanvas.toDataURL("image/png");
    a.click();
  });

  let drawing = false;
  let lastX = 0, lastY = 0;

  function normPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    return { x, y };
  }

  function stampHeart(x, y) {
    const s = (brushSize * rand(0.7, 1.3)) * drawDPR;
    dctx.save();
    dctx.translate(x, y);
    dctx.rotate(Math.PI / 4);
    dctx.globalAlpha = 0.9;
    dctx.fillStyle = withAlpha(drawColor, 0.9);
    dctx.shadowBlur = 14 * drawDPR;
    dctx.shadowColor = drawColor;
    dctx.beginPath();
    dctx.rect(-s / 2, -s / 2, s, s);
    dctx.arc(-s / 2, 0, s / 2, 0, Math.PI * 2);
    dctx.arc(0, -s / 2, s / 2, 0, Math.PI * 2);
    dctx.fill();
    dctx.restore();
  }

  function stampStar(x, y) {
    const r = (brushSize * rand(0.9, 1.5)) * drawDPR;
    const spikes = 5;
    let rot = -Math.PI / 2;
    let step = Math.PI / spikes;

    dctx.save();
    dctx.translate(x, y);
    dctx.globalAlpha = 0.9;
    dctx.fillStyle = withAlpha(drawColor, 0.9);
    dctx.shadowBlur = 12 * drawDPR;
    dctx.shadowColor = drawColor;

    dctx.beginPath();
    dctx.moveTo(0, -r);
    for (let i = 0; i < spikes; i++) {
      dctx.lineTo(Math.cos(rot + step) * (r * 0.45), Math.sin(rot + step) * (r * 0.45));
      rot += step;
      dctx.lineTo(Math.cos(rot + step) * r, Math.sin(rot + step) * r);
      rot += step;
    }
    dctx.closePath();
    dctx.fill();
    dctx.restore();
  }

  function drawStroke(x1, y1, x2, y2) {
    if (drawMode === "heart" || drawMode === "star") {
      const steps = Math.max(1, Math.floor(dist(x1, y1, x2, y2) / (brushSize * 0.9)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = lerp(x1, x2, t);
        const y = lerp(y1, y2, t);
        if (drawMode === "heart") stampHeart(x, y);
        else stampStar(x, y);
      }
      return;
    }

    dctx.lineCap = "round";
    dctx.lineJoin = "round";
    dctx.lineWidth = brushSize * drawDPR;

    if (drawMode === "glow") {
      dctx.shadowBlur = 18 * drawDPR;
      dctx.shadowColor = drawColor;
      dctx.globalAlpha = 0.95;
    } else {
      dctx.shadowBlur = 0;
      dctx.globalAlpha = 0.95;
    }

    const grad = dctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, withAlpha(drawColor, 0.95));
    grad.addColorStop(1, withAlpha(palette[(Math.random() * palette.length) | 0], 0.85));
    dctx.strokeStyle = grad;

    dctx.beginPath();
    dctx.moveTo(x1, y1);
    dctx.lineTo(x2, y2);
    dctx.stroke();

    if (Math.random() < 0.10) {
      dctx.globalAlpha = 0.85;
      dctx.fillStyle = "rgba(255,255,255,.75)";
      dctx.beginPath();
      dctx.arc(x2, y2, rand(1.1, 2.0) * drawDPR, 0, Math.PI * 2);
      dctx.fill();
    }

    dctx.shadowBlur = 0;
    dctx.globalAlpha = 1;
  }

  drawCanvas.addEventListener("pointerdown", (e) => {
    if (state.screen !== "draw") return;
    drawCanvas.setPointerCapture(e.pointerId);
    if (!state.started) startExperience();
    drawing = true;
    pushUndo();
    const p = normPos(e, drawCanvas);
    lastX = p.x; lastY = p.y;
  });
  drawCanvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = normPos(e, drawCanvas);
    drawStroke(lastX, lastY, p.x, p.y);
    lastX = p.x; lastY = p.y;
  });
  function endDraw() {
    if (!drawing) return;
    drawing = false;
    dctx.shadowBlur = 0;
    dctx.globalAlpha = 1;
    drawMsg.textContent = LOVE_LINES[(msgIndex + 1) % LOVE_LINES.length];
  }
  drawCanvas.addEventListener("pointerup", endDraw);
  drawCanvas.addEventListener("pointercancel", endDraw);

  // ===================== GAME ENGINE =====================
  const gctx = gameCanvas.getContext("2d", { alpha: true });
  let gW = 0, gH = 0, gDPR = 1;

  const GAME = { FLAPPY:"flappy", CATCH:"catch", MEMORY:"memory", POP:"pop", PONG:"pong" };
  let activeGame = GAME.FLAPPY;

  const HIGH_KEYS = {
    [GAME.FLAPPY]: "valentine_high_flappy_v3",
    [GAME.CATCH]: "valentine_high_catch_v3",
    [GAME.MEMORY]: "valentine_best_memory_v3",
    [GAME.POP]: "valentine_high_pop_v3",
    [GAME.PONG]: "valentine_high_pong_v3"
  };

  function loadHigh() {
    if (activeGame === GAME.MEMORY) {
      const bestMoves = safeGet(HIGH_KEYS[GAME.MEMORY], null);
      highScoreEl.textContent = (bestMoves == null) ? "—" : String(bestMoves);
    } else {
      highScoreEl.textContent = String(safeGet(HIGH_KEYS[activeGame], 0));
    }
  }
  function saveHigh(val) { safeSet(HIGH_KEYS[activeGame], val); }

  function setTabs() {
    const all = [tabFlappy, tabCatch, tabMemory, tabPop, tabPong];
    all.forEach(b => b.classList.remove("active"));
    const map = { [GAME.FLAPPY]:tabFlappy,[GAME.CATCH]:tabCatch,[GAME.MEMORY]:tabMemory,[GAME.POP]:tabPop,[GAME.PONG]:tabPong };
    map[activeGame].classList.add("active");
    all.forEach(b => b.setAttribute("aria-selected", b.classList.contains("active") ? "true" : "false"));

    memoryWrap.classList.toggle("hidden", activeGame !== GAME.MEMORY);
    gameCanvas.style.visibility = (activeGame === GAME.MEMORY) ? "hidden" : "visible";
    megaCandyBtn.style.display = (activeGame === GAME.FLAPPY) ? "inline-flex" : "none";

    if (activeGame === GAME.FLAPPY) { labelA.textContent="Hearts:"; labelB.textContent="Candy:"; }
    if (activeGame === GAME.CATCH)  { labelA.textContent="Caught:"; labelB.textContent="Miss:"; }
    if (activeGame === GAME.MEMORY) { labelA.textContent="Pairs:";  labelB.textContent="Moves:"; }
    if (activeGame === GAME.POP)    { labelA.textContent="Pops:";   labelB.textContent="Time:"; }
    if (activeGame === GAME.PONG)   { labelA.textContent="Rally:";  labelB.textContent="Lives:"; }

    const tEl = overlay.querySelector(".overlay-title");
    const sEl = overlay.querySelector(".overlay-sub");
    if (tEl) tEl.textContent = "Tap to Start 💘";
    if (sEl) {
      if (activeGame === GAME.FLAPPY) sEl.textContent = "Tap to flap • Now floatier + slower 💘";
      if (activeGame === GAME.CATCH)  sEl.textContent = "Drag the basket • Catch hearts • Avoid 💔";
      if (activeGame === GAME.MEMORY) sEl.textContent = "Tap cards • Match pairs • Fewer moves = better 💘";
      if (activeGame === GAME.POP)    sEl.textContent = "Tap hearts to pop • 30 seconds • Beat your high 💘";
      if (activeGame === GAME.PONG)   sEl.textContent = "Drag paddle • Bounce the heart • Keep it alive 💘";
    }

    loadHigh();
  }

  // ===================== GAME STATES =====================
  // ✅ IMPORTANT: Flappy now uses delta-time so 120Hz/144Hz doesn't make it fall instantly.
  const flappy = {
    running:false, paused:false,
    score:0, candy:0,

    bird:{ x:0, y:0, vy:0, r:16 },

    // floatier + slower (base units are "per 60fps frame" but we apply dt scaling)
    gravity: 0.12,        // weaker gravity
    flap: -5.4,           // gentler flap
    termV: 5.9,           // terminal velocity cap

    pipes: [],
    pipeGap: 170,
    pipeW: 58,
    pipeSpeed: 1.55,      // slower scroll

    candies: [],
    candySpeed: 1.55,

    candyRush: 0,

    // dt timers
    pipeTimer: 0,
    pipeEvery: 1320,      // ms between pipes (slower)
  };

  const catchGame = {
    running:false, paused:false,
    score:0, misses:0,
    basket:{ x:0, y:0, w:110, h:28 },
    fall:[],
    spawnTimer:0
  };

  const popGame = {
    running:false, paused:false,
    score:0,
    timeLeft:30.0,
    hearts:[],
    spawnTimer:0
  };

  const pongGame = {
    running:false, paused:false,
    rally:0, lives:3,
    paddle:{ x:0, y:0, w:130, h:18 },
    ball:{ x:0, y:0, vx:0, vy:0, r:14 }
  };

  // ===================== DIFFICULTY SYNC =====================
  function syncDifficulty() {
    // Flappy scales with DPR, dt handles refresh rate
    flappy.pipeGap = (state.eco ? 190 : 175) * gDPR;
    flappy.pipeW = 58 * gDPR;
    flappy.pipeSpeed = (state.eco ? 1.45 : 1.55) * gDPR;
    flappy.candySpeed = flappy.pipeSpeed;
    flappy.bird.r = 16 * gDPR;

    // “per 60fps frame” units scaled by DPR; dt factor later
    flappy._g = flappy.gravity * gDPR;
    flappy._flap = flappy.flap * gDPR;
    flappy._term = flappy.termV * gDPR;

    // pipe spacing (ms)
    flappy.pipeEvery = state.eco ? 1400 : 1320;

    catchGame.basket.w = (state.eco ? 128 : 118) * gDPR;
    catchGame.basket.h = 28 * gDPR;

    pongGame.paddle.w = (state.eco ? 140 : 130) * gDPR;
    pongGame.paddle.h = 18 * gDPR;
    pongGame.ball.r = 14 * gDPR;
  }

  // ===================== RESET / START / END =====================
  function resetFlappy() {
    flappy.running=false; flappy.paused=false;
    flappy.score=0; flappy.candy=0;
    scoreEl.textContent="0"; candyEl.textContent="0";

    flappy.bird.x = gW * 0.28;
    flappy.bird.y = gH * 0.48;
    flappy.bird.vy = 0;

    flappy.pipes=[]; flappy.candies=[];
    flappy.candyRush=0;
    flappy.pipeTimer=0;

    overlay.classList.remove("hidden");
    pauseBtn.textContent="⏸ Pause";
  }

  function resetCatch(){
    catchGame.running=false; catchGame.paused=false;
    catchGame.score=0; catchGame.misses=0;
    scoreEl.textContent="0"; candyEl.textContent="0";
    catchGame.basket.x=gW*0.5; catchGame.basket.y=gH*0.86;
    catchGame.fall=[]; catchGame.spawnTimer=0;
    overlay.classList.remove("hidden");
    pauseBtn.textContent="⏸ Pause";
  }

  function resetPop(){
    popGame.running=false; popGame.paused=false;
    popGame.score=0; popGame.timeLeft=30.0;
    scoreEl.textContent="0"; candyEl.textContent=popGame.timeLeft.toFixed(1);
    popGame.hearts=[]; popGame.spawnTimer=0;
    overlay.classList.remove("hidden");
    pauseBtn.textContent="⏸ Pause";
  }

  function resetPong(){
    pongGame.running=false; pongGame.paused=false;
    pongGame.rally=0; pongGame.lives=3;
    scoreEl.textContent="0"; candyEl.textContent="3";
    pongGame.paddle.x=gW*0.5; pongGame.paddle.y=gH*0.86;
    pongResetBall();
    overlay.classList.remove("hidden");
    pauseBtn.textContent="⏸ Pause";
  }

  function resetMemory() {
    memoryState = makeMemoryRound();
    renderMemory();
    overlay.classList.add("hidden"); // memory is always “running”
  }

  function resetActiveGame() {
    stopLoop();
    overlay.classList.remove("hidden");
    pauseBtn.textContent = "⏸ Pause";

    if (activeGame === GAME.FLAPPY) resetFlappy();
    if (activeGame === GAME.CATCH)  resetCatch();
    if (activeGame === GAME.POP)    resetPop();
    if (activeGame === GAME.PONG)   resetPong();
    if (activeGame === GAME.MEMORY) resetMemory();

    loadHigh();
  }

  function startActiveGame() {
    if (!state.started) startExperience();
    overlay.classList.add("hidden");

    if (activeGame === GAME.FLAPPY) flappy.running = true;
    if (activeGame === GAME.CATCH)  catchGame.running = true;
    if (activeGame === GAME.POP)    popGame.running = true;
    if (activeGame === GAME.PONG)   pongGame.running = true;

    if (activeGame !== GAME.MEMORY) ensureLoop();
  }

  function togglePause() {
    if (activeGame === GAME.MEMORY) return;

    const isRunning =
      (activeGame === GAME.FLAPPY && flappy.running) ||
      (activeGame === GAME.CATCH && catchGame.running) ||
      (activeGame === GAME.POP && popGame.running) ||
      (activeGame === GAME.PONG && pongGame.running);

    if (!isRunning) return;

    let paused =
      (activeGame === GAME.FLAPPY && flappy.paused) ||
      (activeGame === GAME.CATCH && catchGame.paused) ||
      (activeGame === GAME.POP && popGame.paused) ||
      (activeGame === GAME.PONG && pongGame.paused);

    paused = !paused;

    if (activeGame === GAME.FLAPPY) flappy.paused = paused;
    if (activeGame === GAME.CATCH)  catchGame.paused = paused;
    if (activeGame === GAME.POP)    popGame.paused = paused;
    if (activeGame === GAME.PONG)   pongGame.paused = paused;

    pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
    if (!paused) ensureLoop();
  }

  function endActiveGame(lineIdx = 4) {
    if (activeGame === GAME.FLAPPY) {
      const high = safeGet(HIGH_KEYS[GAME.FLAPPY], 0);
      if (flappy.score > high) safeSet(HIGH_KEYS[GAME.FLAPPY], flappy.score);
      flappy.running = false;
    }
    if (activeGame === GAME.CATCH) {
      const high = safeGet(HIGH_KEYS[GAME.CATCH], 0);
      if (catchGame.score > high) safeSet(HIGH_KEYS[GAME.CATCH], catchGame.score);
      catchGame.running = false;
    }
    if (activeGame === GAME.POP) {
      const high = safeGet(HIGH_KEYS[GAME.POP], 0);
      if (popGame.score > high) safeSet(HIGH_KEYS[GAME.POP], popGame.score);
      popGame.running = false;
    }
    if (activeGame === GAME.PONG) {
      const high = safeGet(HIGH_KEYS[GAME.PONG], 0);
      if (pongGame.rally > high) safeSet(HIGH_KEYS[GAME.PONG], pongGame.rally);
      pongGame.running = false;
    }

    overlay.classList.remove("hidden");
    overlay.querySelector(".overlay-title").textContent = "Tap to Try Again 💘";
    overlay.querySelector(".overlay-sub").textContent = LOVE_LINES[lineIdx % LOVE_LINES.length];
    loadHigh();
    stopLoop();
  }

  // ===================== GAME SWITCH =====================
  function switchGame(name) { activeGame = name; setTabs(); resetActiveGame(); }
  tabFlappy.addEventListener("click", () => switchGame(GAME.FLAPPY));
  tabCatch.addEventListener("click", () => switchGame(GAME.CATCH));
  tabMemory.addEventListener("click", () => switchGame(GAME.MEMORY));
  tabPop.addEventListener("click", () => switchGame(GAME.POP));
  tabPong.addEventListener("click", () => switchGame(GAME.PONG));

  // ===================== FLAPPY HELPERS =====================
  function spawnPipe() {
    const margin = 86 * gDPR;
    const gap = flappy.pipeGap;
    const topH = rand(margin, gH - margin - gap);

    flappy.pipes.push({ x: gW + 40 * gDPR, topH, passed: false });

    const candyChance = flappy.candyRush > 0 ? 0.9 : 0.45;
    if (Math.random() < candyChance) {
      flappy.candies.push({
        x: gW + 40 * gDPR + flappy.pipeW * 0.5,
        y: topH + gap * rand(0.25, 0.75),
        r: 10 * gDPR,
        taken: false
      });
    }
  }

  function birdCollidesPipe(px, topH) {
    const r = flappy.bird.r;
    const bx = flappy.bird.x;
    const by = flappy.bird.y;
    const w = flappy.pipeW;
    const gap = flappy.pipeGap;

    const left = px;
    const right = px + w;
    if (bx + r < left || bx - r > right) return false;
    if (by - r > topH && by + r < topH + gap) return false;
    return true;
  }

  function birdCollidesCandy(c) {
    if (c.taken) return false;
    const dx = flappy.bird.x - c.x;
    const dy = flappy.bird.y - c.y;
    const rr = flappy.bird.r + c.r;
    return (dx * dx + dy * dy) <= rr * rr;
  }

  function flappyFlap() {
    if (!flappy.running) startActiveGame();
    if (flappy.paused) return;
    flappy.bird.vy = flappy._flap;
  }

  // ===================== OTHER GAME HELPERS =====================
  function spawnFalling() {
    const isBad = Math.random() < (state.eco ? 0.18 : 0.22);
    const r = (isBad ? 16 : 15) * gDPR;
    const x = rand(r + 8 * gDPR, gW - r - 8 * gDPR);
    const y = -30 * gDPR;
    const vy = rand(state.eco ? 2.4 : 2.8, state.eco ? 3.8 : 4.4) * gDPR;
    catchGame.fall.push({ x, y, vy, r, type: isBad ? "bad" : "heart" });
    const cap = state.eco ? 14 : 22;
    if (catchGame.fall.length > cap) catchGame.fall.shift();
  }

  function catchHit(f, bx, by, bw, bh) {
    const cx = clamp(f.x, bx - bw / 2, bx + bw / 2);
    const cy = clamp(f.y, by - bh / 2, by + bh / 2);
    const dx = f.x - cx, dy = f.y - cy;
    return dx * dx + dy * dy <= f.r * f.r;
  }

  function spawnPopHeart() {
    const r = rand(16, 28) * gDPR;
    const x = rand(r + 8 * gDPR, gW - r - 8 * gDPR);
    const y = rand(r + 8 * gDPR, gH - r - 8 * gDPR);
    const vx = rand(-1.2, 1.2) * gDPR;
    const vy = rand(-1.1, 1.1) * gDPR;
    const life = rand(1.0, 2.0);
    popGame.hearts.push({ x, y, r, vx, vy, life });
    const cap = state.eco ? 10 : 16;
    if (popGame.hearts.length > cap) popGame.hearts.shift();
  }

  function popHit(px, py, h) {
    const dx = px - h.x;
    const dy = py - h.y;
    return (dx * dx + dy * dy) <= (h.r * h.r);
  }

  function pongResetBall() {
    pongGame.ball.x = gW * 0.5;
    pongGame.ball.y = gH * 0.45;
    const sp = (state.eco ? 4.3 : 4.9) * gDPR;
    pongGame.ball.vx = (Math.random() < 0.5 ? -1 : 1) * sp;
    pongGame.ball.vy = sp * 0.9;
  }

  // ===================== RENDER PRIMITIVES =====================
  function drawGameBackground() {
    gctx.clearRect(0, 0, gW, gH);
    const bg = gctx.createRadialGradient(gW * 0.4, gH * 0.3, 20, gW * 0.5, gH * 0.4, Math.max(gW, gH));
    bg.addColorStop(0, "rgba(255,77,166,0.10)");
    bg.addColorStop(0.5, "rgba(124,77,255,0.06)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    gctx.fillStyle = bg;
    gctx.fillRect(0, 0, gW, gH);
  }

  function drawHeartIcon(x, y, r, alpha = 1) {
    gctx.save();
    gctx.translate(x, y);
    gctx.globalAlpha = alpha;
    gctx.scale(r / 20, r / 20);

    const grad = gctx.createLinearGradient(-20, -20, 20, 20);
    grad.addColorStop(0, "rgba(255,77,166,1)");
    grad.addColorStop(1, "rgba(124,77,255,0.95)");
    gctx.fillStyle = grad;

    gctx.beginPath();
    gctx.moveTo(0, 12);
    gctx.bezierCurveTo(18, -2, 16, -16, 0, -8);
    gctx.bezierCurveTo(-16, -16, -18, -2, 0, 12);
    gctx.closePath();
    gctx.shadowBlur = 18;
    gctx.shadowColor = "rgba(255,77,166,0.35)";
    gctx.fill();

    gctx.shadowBlur = 0;
    gctx.fillStyle = "rgba(255,255,255,0.9)";
    gctx.beginPath();
    gctx.arc(4, -3, 1.6, 0, Math.PI * 2);
    gctx.fill();

    gctx.restore();
  }

  function drawBrokenHeart(x, y, r) {
    gctx.save();
    gctx.translate(x, y);
    gctx.scale(r / 20, r / 20);
    gctx.globalAlpha = 0.95;
    gctx.fillStyle = "rgba(255,45,85,0.95)";
    gctx.shadowBlur = 18;
    gctx.shadowColor = "rgba(255,45,85,0.25)";

    gctx.beginPath();
    gctx.moveTo(0, 12);
    gctx.bezierCurveTo(18, -2, 16, -16, 0, -8);
    gctx.bezierCurveTo(-16, -16, -18, -2, 0, 12);
    gctx.closePath();
    gctx.fill();

    gctx.shadowBlur = 0;
    gctx.strokeStyle = "rgba(255,255,255,0.55)";
    gctx.lineWidth = 2.2;
    gctx.beginPath();
    gctx.moveTo(-2, -10);
    gctx.lineTo(3, -2);
    gctx.lineTo(-1, 3);
    gctx.lineTo(4, 12);
    gctx.stroke();

    gctx.restore();
  }

  function drawCandy(c) {
    gctx.save();
    gctx.translate(c.x, c.y);
    gctx.globalAlpha = 0.95;
    gctx.shadowBlur = 16 * gDPR;
    gctx.shadowColor = "rgba(255,211,110,0.35)";

    const grad = gctx.createLinearGradient(-c.r, -c.r, c.r, c.r);
    grad.addColorStop(0, "rgba(255,211,110,1)");
    grad.addColorStop(1, "rgba(255,77,166,0.9)");
    gctx.fillStyle = grad;

    gctx.beginPath();
    gctx.arc(0, 0, c.r, 0, Math.PI * 2);
    gctx.fill();

    gctx.shadowBlur = 0;
    gctx.strokeStyle = "rgba(255,255,255,0.65)";
    gctx.lineWidth = 2 * gDPR;
    gctx.beginPath();
    gctx.arc(0, 0, c.r * 0.65, 0, Math.PI * 2);
    gctx.stroke();
    gctx.restore();
  }

  function drawPipes(p) {
    const x = p.x;
    const w = flappy.pipeW;
    const gap = flappy.pipeGap;

    const g = gctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "rgba(45,252,255,0.22)");
    g.addColorStop(0.5, "rgba(255,77,166,0.18)");
    g.addColorStop(1, "rgba(124,77,255,0.18)");

    gctx.fillStyle = g;
    gctx.globalAlpha = 1;

    gctx.fillRect(x, 0, w, p.topH);
    const bottomY = p.topH + gap;
    gctx.fillRect(x, bottomY, w, gH - bottomY);

    gctx.strokeStyle = "rgba(255,255,255,0.22)";
    gctx.lineWidth = 2 * gDPR;
    gctx.strokeRect(x, 0, w, p.topH);
    gctx.strokeRect(x, bottomY, w, gH - bottomY);
  }

  function drawBasket() {
    const b = catchGame.basket;
    const x = b.x, y = b.y;
    gctx.save();
    gctx.translate(x, y);
    gctx.globalAlpha = 0.95;

    const grad = gctx.createLinearGradient(-b.w/2, 0, b.w/2, 0);
    grad.addColorStop(0, "rgba(255,77,166,0.22)");
    grad.addColorStop(1, "rgba(45,252,255,0.16)");
    gctx.fillStyle = grad;

    gctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
    gctx.strokeStyle = "rgba(255,255,255,0.28)";
    gctx.lineWidth = 2*gDPR;
    gctx.strokeRect(-b.w/2, -b.h/2, b.w, b.h);

    gctx.restore();
  }

  // ===================== MEMORY (DOM GAME) =====================
  const MEMORY_EMOJIS = ["💘","💖","💗","💞","❤️‍🔥","🌙","🌎","💍","✨","🍬","🎀","🌹"];
  let memoryState = null;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function makeMemoryRound() {
    const cols = (innerWidth < 420) ? 3 : 4;
    const total = cols === 3 ? 12 : 16;
    const pairs = total / 2;
    const pool = shuffle(MEMORY_EMOJIS.slice()).slice(0, pairs);
    const deck = shuffle([...pool, ...pool].map((v, i) => ({ id: i, v })));

    return {
      deck,
      revealed: new Set(),
      matched: new Set(),
      first: null,
      lock: false,
      moves: 0,
      pairsFound: 0
    };
  }

  function renderMemory() {
    memoryGrid.innerHTML = "";
    memoryHint.textContent = LOVE_LINES[(msgIndex + 2) % LOVE_LINES.length];

    memoryState.deck.forEach((card) => {
      const btn = document.createElement("button");
      btn.className = "mcard";
      btn.type = "button";
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", "memory card");
      btn.dataset.id = String(card.id);

      const span = document.createElement("span");
      btn.appendChild(span);

      if (memoryState.matched.has(card.id)) btn.classList.add("matched");
      if (memoryState.revealed.has(card.id)) btn.classList.add("revealed");

      span.textContent = (memoryState.revealed.has(card.id) || memoryState.matched.has(card.id)) ? card.v : "💟";

      btn.addEventListener("click", () => onMemoryPick(card.id));
      memoryGrid.appendChild(btn);
    });

    scoreEl.textContent = String(memoryState.pairsFound);
    candyEl.textContent = String(memoryState.moves);

    const best = safeGet(HIGH_KEYS[GAME.MEMORY], null);
    highScoreEl.textContent = (best == null) ? "—" : String(best);
  }

  function onMemoryPick(id) {
    if (activeGame !== GAME.MEMORY) return;
    if (memoryState.lock) return;
    if (memoryState.matched.has(id)) return;
    if (memoryState.revealed.has(id)) return;

    memoryState.revealed.add(id);

    if (memoryState.first == null) {
      memoryState.first = id;
      renderMemory();
      return;
    }

    memoryState.moves += 1;

    const firstId = memoryState.first;
    const a = memoryState.deck.find(c => c.id === firstId);
    const b = memoryState.deck.find(c => c.id === id);

    if (a && b && a.v === b.v) {
      memoryState.matched.add(firstId);
      memoryState.matched.add(id);
      memoryState.pairsFound += 1;
      memoryState.first = null;

      renderMemory();

      if (memoryState.pairsFound * 2 === memoryState.deck.length) {
        const best = safeGet(HIGH_KEYS[GAME.MEMORY], null);
        if (best == null || memoryState.moves < best) safeSet(HIGH_KEYS[GAME.MEMORY], memoryState.moves);
        loveBurst(state.eco ? 90 : 150, 50);
        overlay.classList.remove("hidden");
        overlay.querySelector(".overlay-title").textContent = "Perfect Match 💘";
        overlay.querySelector(".overlay-sub").textContent = LOVE_LINES[(msgIndex + 3) % LOVE_LINES.length];
        loadHigh();
      }
      return;
    }

    memoryState.lock = true;
    renderMemory();
    setTimeout(() => {
      memoryState.revealed.delete(firstId);
      memoryState.revealed.delete(id);
      memoryState.first = null;
      memoryState.lock = false;
      renderMemory();
    }, state.eco ? 520 : 620);
  }

  memoryNew.addEventListener("click", () => {
    if (activeGame !== GAME.MEMORY) switchGame(GAME.MEMORY);
    resetMemory();
    overlay.classList.add("hidden");
  });

  // ===================== CANVAS RESIZE =====================
  function resizeCanvasToElement(canvas) {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    return dpr;
  }

  function resizeAllCanvases() {
    drawDPR = resizeCanvasToElement(drawCanvas);
    drawW = drawCanvas.width;
    drawH = drawCanvas.height;
    clearDraw();

    gDPR = resizeCanvasToElement(gameCanvas);
    gW = gameCanvas.width;
    gH = gameCanvas.height;

    syncDifficulty();
    resetActiveGame();
  }

  window.addEventListener("resize", () => {
    resizeFX();
    resizeAllCanvases();
  }, { passive: true });

  // ===================== GAME INPUTS =====================
  function getCanvasPointer(e) {
    const r = gameCanvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (gameCanvas.width / r.width);
    const y = (e.clientY - r.top) * (gameCanvas.height / r.height);
    return { x, y };
  }

  let dragging = false;

  gameCanvas.addEventListener("pointerdown", (e) => {
    if (state.screen !== "game") return;
    if (activeGame === GAME.MEMORY) return;
    dragging = true;
    gameCanvas.setPointerCapture(e.pointerId);

    const p = getCanvasPointer(e);
    if (activeGame === GAME.CATCH) catchGame.basket.x = p.x;
    else if (activeGame === GAME.PONG) pongGame.paddle.x = p.x;
  });

  gameCanvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = getCanvasPointer(e);
    if (activeGame === GAME.CATCH) {
      catchGame.basket.x = clamp(p.x, catchGame.basket.w / 2, gW - catchGame.basket.w / 2);
    } else if (activeGame === GAME.PONG) {
      pongGame.paddle.x = clamp(p.x, pongGame.paddle.w / 2, gW - pongGame.paddle.w / 2);
    }
  });

  gameCanvas.addEventListener("pointerup", (e) => {
    dragging = false;
    if (state.screen !== "game") return;

    if (activeGame === GAME.FLAPPY) {
      e.preventDefault();
      flappyFlap();
      return;
    }

    const p = getCanvasPointer(e);

    if (activeGame === GAME.POP) {
      if (!popGame.running) startActiveGame();
      if (popGame.paused) return;

      for (let i = popGame.hearts.length - 1; i >= 0; i--) {
        const h = popGame.hearts[i];
        if (popHit(p.x, p.y, h)) {
          popGame.score += 1;
          scoreEl.textContent = String(popGame.score);
          addSparks(p.x / gDPR, p.y / gDPR, state.eco ? 18 : 26);
          popGame.hearts.splice(i, 1);
          break;
        }
      }
      return;
    }

    if ((activeGame === GAME.CATCH && !catchGame.running) || (activeGame === GAME.PONG && !pongGame.running)) {
      startActiveGame();
    }
  }, { passive: false });

  gameCanvas.addEventListener("pointercancel", () => { dragging = false; });

  // Buttons
  startGameBtn.addEventListener("click", () => { showScreen("game"); startActiveGame(); });
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", () => { resetActiveGame(); startActiveGame(); });
  megaCandyBtn.addEventListener("click", () => {
    if (activeGame !== GAME.FLAPPY) return;
    if (!flappy.running) startActiveGame();
    flappy.candyRush = 900;
    gameMsg.textContent = LOVE_LINES[(msgIndex + 3) % LOVE_LINES.length];
  });

  overlay.addEventListener("pointerup", () => {
    if (state.screen !== "game") showScreen("game");
    resetActiveGame();
    startActiveGame();
  }, { passive: true });

  // ===================== GAME LOOP (delta time) =====================
  let loopRunning = false;
  let lastGameT = performance.now();

  function ensureLoop() {
    if (loopRunning) return;
    loopRunning = true;
    lastGameT = performance.now();
    requestAnimationFrame(gameLoop);
  }
  function stopLoop() { loopRunning = false; }

  function dtFactor(now) {
    // factor relative to 60fps frames; clamped to avoid huge jumps
    const ms = clamp(now - lastGameT, 0, 40);
    lastGameT = now;
    return ms / 16.6667;
  }

  function gameLoop(now) {
    if (!loopRunning) return;
    const f = dtFactor(now);

    drawGameBackground();

    // ----------------- FLAPPY -----------------
    if (activeGame === GAME.FLAPPY) {
      if (!flappy.running) { stopLoop(); return; }
      if (flappy.paused) { requestAnimationFrame(gameLoop); return; }

      // pipe spawn by timer (ms) => consistent across refresh rates
      flappy.pipeTimer += (now - (now - f*16.6667)); // effectively ms step
      // (more simply, add actual ms each loop)
      // We can safely add (f*16.6667) here:
      flappy.pipeTimer += f * 16.6667;

      while (flappy.pipeTimer >= flappy.pipeEvery) {
        flappy.pipeTimer -= flappy.pipeEvery;
        spawnPipe();
      }

      // physics (scaled by f)
      flappy.bird.vy += flappy._g * f;
      flappy.bird.vy = clamp(flappy.bird.vy, -999, flappy._term);
      flappy.bird.y += flappy.bird.vy * f;

      // move pipes/candy (scaled by f)
      const pxStep = flappy.pipeSpeed * f;
      for (let i = flappy.pipes.length - 1; i >= 0; i--) {
        const p = flappy.pipes[i];
        p.x -= pxStep;

        if (!p.passed && p.x + flappy.pipeW < flappy.bird.x) {
          p.passed = true;
          flappy.score += 1;
          scoreEl.textContent = String(flappy.score);
          if (flappy.score % 6 === 0) gameMsg.textContent = LOVE_LINES[((flappy.score / 6) | 0) % LOVE_LINES.length];
        }

        if (birdCollidesPipe(p.x, p.topH)) { endActiveGame(4); return; }
        if (p.x + flappy.pipeW < -140 * gDPR) flappy.pipes.splice(i, 1);
      }

      for (let i = flappy.candies.length - 1; i >= 0; i--) {
        const c = flappy.candies[i];
        c.x -= (flappy.candySpeed * f);
        if (birdCollidesCandy(c)) {
          c.taken = true;
          flappy.candy += 1;
          candyEl.textContent = String(flappy.candy);
          addSparks((c.x / gDPR), (c.y / gDPR), state.eco ? 18 : 26);
        }
        if (c.x < -140 * gDPR || c.taken) flappy.candies.splice(i, 1);
      }

      if (flappy.bird.y - flappy.bird.r < 0 || flappy.bird.y + flappy.bird.r > gH) { endActiveGame(4); return; }

      for (const p of flappy.pipes) drawPipes(p);
      for (const c of flappy.candies) drawCandy(c);
      drawHeartIcon(flappy.bird.x, flappy.bird.y, flappy.bird.r, 1);

      if (flappy.candyRush > 0) flappy.candyRush--;

      requestAnimationFrame(gameLoop);
      return;
    }

    // ----------------- CATCH -----------------
    if (activeGame === GAME.CATCH) {
      if (!catchGame.running) { stopLoop(); return; }
      if (catchGame.paused) { requestAnimationFrame(gameLoop); return; }

      catchGame.spawnTimer += f * 16.6667;
      const spawnEvery = state.eco ? 420 : 360;
      while (catchGame.spawnTimer >= spawnEvery) {
        catchGame.spawnTimer -= spawnEvery;
        spawnFalling();
      }

      catchGame.basket.x = clamp(catchGame.basket.x, catchGame.basket.w / 2, gW - catchGame.basket.w / 2);

      for (let i = catchGame.fall.length - 1; i >= 0; i--) {
        const obj = catchGame.fall[i];
        obj.y += obj.vy * f;

        if (catchHit(obj, catchGame.basket.x, catchGame.basket.y, catchGame.basket.w, catchGame.basket.h)) {
          if (obj.type === "heart") {
            catchGame.score += 1;
            scoreEl.textContent = String(catchGame.score);
            addSparks(obj.x / gDPR, obj.y / gDPR, state.eco ? 14 : 20);
          } else {
            catchGame.misses += 1;
            candyEl.textContent = String(catchGame.misses);
          }
          catchGame.fall.splice(i, 1);
          continue;
        }

        if (obj.y > gH + 50 * gDPR) {
          if (obj.type === "heart") {
            catchGame.misses += 1;
            candyEl.textContent = String(catchGame.misses);
            if (catchGame.misses >= 10) { endActiveGame(4); return; }
          }
          catchGame.fall.splice(i, 1);
        }
      }

      // draw falling objects + basket
      for (const obj of catchGame.fall) {
        if (obj.type === "heart") drawHeartIcon(obj.x, obj.y, obj.r, 0.95);
        else drawBrokenHeart(obj.x, obj.y, obj.r);
      }
      drawBasket();

      requestAnimationFrame(gameLoop);
      return;
    }

    // ----------------- POP -----------------
    if (activeGame === GAME.POP) {
      if (!popGame.running) { stopLoop(); return; }
      if (popGame.paused) { requestAnimationFrame(gameLoop); return; }

      popGame.timeLeft = Math.max(0, popGame.timeLeft - (f * 16.6667) / 1000);
      candyEl.textContent = popGame.timeLeft.toFixed(1);

      popGame.spawnTimer += f * 16.6667;
      const spawnEvery = state.eco ? 460 : 380;
      while (popGame.spawnTimer >= spawnEvery) {
        popGame.spawnTimer -= spawnEvery;
        spawnPopHeart();
      }

      for (let i = popGame.hearts.length - 1; i >= 0; i--) {
        const h = popGame.hearts[i];
        h.life -= (f * 16.6667) / 1000;
        h.x += h.vx * f;
        h.y += h.vy * f;

        if (h.x < h.r || h.x > gW - h.r) h.vx *= -1;
        if (h.y < h.r || h.y > gH - h.r) h.vy *= -1;

        if (h.life <= 0) popGame.hearts.splice(i, 1);
      }

      for (const h of popGame.hearts) drawHeartIcon(h.x, h.y, h.r, 0.85);

      if (popGame.timeLeft <= 0) { endActiveGame(4); return; }

      requestAnimationFrame(gameLoop);
      return;
    }

    // ----------------- PONG -----------------
    if (activeGame === GAME.PONG) {
      if (!pongGame.running) { stopLoop(); return; }
      if (pongGame.paused) { requestAnimationFrame(gameLoop); return; }

      pongGame.paddle.x = clamp(pongGame.paddle.x, pongGame.paddle.w / 2, gW - pongGame.paddle.w / 2);

      // ball move
      pongGame.ball.x += pongGame.ball.vx * f;
      pongGame.ball.y += pongGame.ball.vy * f;

      // walls
      if (pongGame.ball.x < pongGame.ball.r) { pongGame.ball.x = pongGame.ball.r; pongGame.ball.vx *= -1; }
      if (pongGame.ball.x > gW - pongGame.ball.r) { pongGame.ball.x = gW - pongGame.ball.r; pongGame.ball.vx *= -1; }
      if (pongGame.ball.y < pongGame.ball.r) { pongGame.ball.y = pongGame.ball.r; pongGame.ball.vy *= -1; }

      // paddle collision
      const p = pongGame.paddle;
      const b = pongGame.ball;
      const top = p.y - p.h/2;

      if (b.y + b.r >= top && b.y + b.r <= p.y + p.h/2 + b.r) {
        if (b.x >= p.x - p.w/2 - b.r && b.x <= p.x + p.w/2 + b.r && b.vy > 0) {
          b.y = top - b.r;
          b.vy *= -1;

          // angle based on hit position
          const dx = (b.x - p.x) / (p.w/2);
          b.vx += dx * (state.eco ? 0.6 : 0.75) * gDPR;

          pongGame.rally += 1;
          scoreEl.textContent = String(pongGame.rally);

          addSparks(b.x / gDPR, b.y / gDPR, state.eco ? 10 : 16);
        }
      }

      // missed
      if (b.y > gH + 40 * gDPR) {
        pongGame.lives -= 1;
        candyEl.textContent = String(pongGame.lives);
        if (pongGame.lives <= 0) { endActiveGame(4); return; }
        pongResetBall();
      }

      // draw paddle
      gctx.save();
      gctx.translate(p.x, p.y);
      const grad = gctx.createLinearGradient(-p.w/2, 0, p.w/2, 0);
      grad.addColorStop(0, "rgba(255,77,166,0.22)");
      grad.addColorStop(1, "rgba(45,252,255,0.16)");
      gctx.fillStyle = grad;
      gctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      gctx.strokeStyle = "rgba(255,255,255,0.28)";
      gctx.lineWidth = 2*gDPR;
      gctx.strokeRect(-p.w/2, -p.h/2, p.w, p.h);
      gctx.restore();

      // draw ball
      drawHeartIcon(b.x, b.y, b.r, 0.95);

      requestAnimationFrame(gameLoop);
      return;
    }

    stopLoop();
  }

  // ===================== MEMORY STARTER =====================
  function resetMemoryRoundOnly() {
    memoryState = makeMemoryRound();
    renderMemory();
  }

  // ===================== GAME TAB DEFAULTS =====================
  function switchToGameDefault() {
    activeGame = GAME.FLAPPY;
    setTabs();
    resetActiveGame();
  }

  // ===================== SWITCH SIDE EFFECTS =====================
  function onScreenChanged() {
    setActiveNav();
    if (state.screen !== "game") {
      // pause any running canvas game
      if (flappy.running) flappy.paused = true;
      if (catchGame.running) catchGame.paused = true;
      if (popGame.running) popGame.paused = true;
      if (pongGame.running) pongGame.paused = true;
      pauseBtn.textContent = "▶ Resume";
    }
    setTimeout(resizeAllCanvases, 40);
  }

  const _showScreen = showScreen;
  showScreen = function(name) {
    _showScreen(name);
    onScreenChanged();
  };

  // ===================== GAME BUTTONS =====================
  pauseBtn.addEventListener("click", () => {
    togglePause();
    if (!loopRunning && (activeGame !== GAME.MEMORY)) ensureLoop();
  });

  restartBtn.addEventListener("click", () => {
    resetActiveGame();
    startActiveGame();
  });

  // ===================== CONTROLLED OVERLAY TAP =====================
  overlay.addEventListener("pointerup", () => {
    resetActiveGame();
    startActiveGame();
  }, { passive: true });

  // ===================== HEARTS STREAM BOOT =====================
  refreshHearts();
  seedHearts();

  // ===================== FX BOOT =====================
  resizeFX();
  requestAnimationFrame(fxFrame);

  // ===================== CANVASES BOOT =====================
  function resizeCanvasToElement(canvas) {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    return dpr;
  }

  function resizeAllCanvases() {
    drawDPR = resizeCanvasToElement(drawCanvas);
    drawW = drawCanvas.width;
    drawH = drawCanvas.height;
    clearDraw();

    gDPR = resizeCanvasToElement(gameCanvas);
    gW = gameCanvas.width;
    gH = gameCanvas.height;

    syncDifficulty();

    // reset by game
    if (activeGame === GAME.FLAPPY) resetFlappy();
    if (activeGame === GAME.CATCH) resetCatch();
    if (activeGame === GAME.POP) resetPop();
    if (activeGame === GAME.PONG) resetPong();
    if (activeGame === GAME.MEMORY) resetMemoryRoundOnly();

    loadHigh();
  }

  // ===================== CONTROL PANEL DEFAULT MSGS =====================
  drawMsg.textContent = LOVE_LINES[1];
  gameMsg.textContent = LOVE_LINES[2];

  // ===================== GAME START / RESTART =====================
  startGameBtn.addEventListener("click", () => { showScreen("game"); startActiveGame(); });

  // Memory button
  memoryNew.addEventListener("click", () => {
    if (activeGame !== GAME.MEMORY) switchGame(GAME.MEMORY);
    resetMemoryRoundOnly();
    overlay.classList.add("hidden");
  });

  // ===================== INITIALIZE =====================
  resizeAllCanvases();
  switchToGameDefault();
  showScreen("love");

  // Start experience if user taps nav early
  [toLove, toDraw, toGame].forEach(btn => btn.addEventListener("click", startExperience, { once: true }));

  // ===================== MISSING PIECE: SPARKLES HELPERS =====================
  // (kept last so it can use fx DPR sizes)
  function addSparks(x, y, count = 50) {
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = rand(1.2, state.eco ? 5.6 : 7.2) * DPR;
      sparks.push({
        x: x * DPR, y: y * DPR,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(18, state.eco ? 40 : 54),
        r: rand(1.0, 2.2) * DPR,
        hue: rand(300, 360)
      });
    }
    const cap = state.eco ? 220 : 480;
    if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
  }
})();
