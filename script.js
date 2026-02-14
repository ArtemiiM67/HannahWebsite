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

  // Game
  const gameCanvas = document.getElementById("game");
  const scoreEl = document.getElementById("score");
  const candyEl = document.getElementById("candy");
  const overlay = document.getElementById("gameOverlay");
  const startGameBtn = document.getElementById("startGameBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const megaCandyBtn = document.getElementById("megaCandyBtn");
  const gameMsg = document.getElementById("gameMsg");

  // Background FX
  const fx = document.getElementById("fx");
  const fxCtx = fx.getContext("2d", { alpha: true });

  // Hearts stream
  const heartField = document.getElementById("heartField");

  // ===================== STATE =====================
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const smallScreen = Math.min(innerWidth, innerHeight) < 520;

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

  // bind UI defaults
  tEco.checked = state.eco;
  tNeon.checked = state.neon;
  tHearts.checked = state.hearts;
  tMeteors.checked = state.meteors;
  tConst.checked = state.constellations;
  tMotionLock.checked = state.motionLock;
  sIntensity.value = String(state.intensity);
  sHearts.value = String(state.heartRate);

  function applyClasses(){
    document.body.classList.toggle("eco", state.eco);
    document.body.classList.toggle("neon", state.neon);
  }
  applyClasses();

  // ===================== INTRO =====================
  let introIdx = 0;
  const introTicker = setInterval(() => {
    introLine.textContent = LOVE_LINES[introIdx % LOVE_LINES.length];
    introIdx++;
  }, 900);

  function startExperience(){
    if (state.started) return;
    state.started = true;

    intro.classList.add("hidden");
    setTimeout(() => intro.remove(), 650);

    // show first message + burst
    setMessage(0, true);
    setTimeout(() => loveBurst(120, 50), 250);
  }

  intro.addEventListener("pointerup", startExperience, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (!state.started && (e.key === "Enter" || e.key === " ")) startExperience();
  });

  // ===================== NAVIGATION =====================
  function setActiveNav(){
    [toLove, toDraw, toGame].forEach(b => b.classList.remove("active"));
    if (state.screen === "love") toLove.classList.add("active");
    if (state.screen === "draw") toDraw.classList.add("active");
    if (state.screen === "game") toGame.classList.add("active");
  }

  function showScreen(name){
    if (!state.started) startExperience();
    state.screen = name;

    screenLove.classList.toggle("active", name === "love");
    screenDraw.classList.toggle("active", name === "draw");
    screenGame.classList.toggle("active", name === "game");

    screenLove.setAttribute("aria-hidden", name === "love" ? "false" : "true");
    screenDraw.setAttribute("aria-hidden", name === "draw" ? "false" : "true");
    screenGame.setAttribute("aria-hidden", name === "game" ? "false" : "true");

    setActiveNav();

    // friendly footer messages (only from list)
    if (name === "draw") drawMsg.textContent = LOVE_LINES[(msgIndex + 1) % LOVE_LINES.length];
    if (name === "game") gameMsg.textContent = LOVE_LINES[(msgIndex + 2) % LOVE_LINES.length];

    // resize canvases to correct layout
    resizeAllCanvases();
  }

  toLove.addEventListener("click", () => showScreen("love"));
  toDraw.addEventListener("click", () => showScreen("draw"));
  toGame.addEventListener("click", () => showScreen("game"));

  setActiveNav();

  // ===================== CONTROL PANEL =====================
  function openControls(){ panel.classList.add("open"); panel.setAttribute("aria-hidden","false"); }
  function closeControls(){ panel.classList.remove("open"); panel.setAttribute("aria-hidden","true"); }
  openPanel.addEventListener("click", openControls);
  closePanel.addEventListener("click", closeControls);

  window.addEventListener("pointerup", (e) => {
    if (!panel.classList.contains("open")) return;
    const within = panel.contains(e.target) || openPanel.contains(e.target);
    if (!within) closeControls();
  }, { passive: true });

  // toggles
  tEco.addEventListener("change", () => { state.eco = tEco.checked; applyClasses(); resizeFX(); refreshHearts(); });
  tNeon.addEventListener("change", () => { state.neon = tNeon.checked; applyClasses(); });
  tHearts.addEventListener("change", () => { state.hearts = tHearts.checked; refreshHearts(); });
  tMeteors.addEventListener("change", () => { state.meteors = tMeteors.checked; });
  tConst.addEventListener("change", () => { state.constellations = tConst.checked; });
  tMotionLock.addEventListener("change", () => {
    state.motionLock = tMotionLock.checked;
    if (state.motionLock) { tiltX = 0; tiltY = 0; applyTilt(); }
  });
  sIntensity.addEventListener("input", () => { state.intensity = parseFloat(sIntensity.value); });
  sHearts.addEventListener("input", () => { state.heartRate = parseInt(sHearts.value, 10); refreshHearts(); });

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
    applyClasses();
    resizeFX();
    refreshHearts();
    setMessage(0, true);
    loveBurst(110, 50);
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

    applyClasses();
    resizeFX();
    refreshHearts();
    loveBurst(190, 50);
    closeControls();
  });

  // ===================== LOVE SCREEN TEXT =====================
  // Typewriter main title is constant, subtitle cycles ONLY from LOVE_LINES.
  const titleText = "I Love You Hannah Banana 💘";
  let titleI = 0;

  function typeTitle(){
    typeEl.textContent = titleText.slice(0, titleI);
    titleI++;
    if (titleI <= titleText.length) setTimeout(typeTitle, 48);
  }
  typeTitle();

  let msgIndex = 0;

  function setMessage(idx, immediate = false){
    msgIndex = idx % LOVE_LINES.length;
    if (immediate){
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
    }, 220);
  }

  // start message (before intro ends)
  subtitle.textContent = LOVE_LINES[0];

  momentBtn.addEventListener("click", () => {
    setMessage(msgIndex + 1);
    loveBurst(state.eco ? 80 : 120, rand(38, 62));
    if (Math.random() < 0.6) spawnMeteor(true);
  });

  // ===================== LOVE BURST + TAP SPARKLES =====================
  burstBtn.addEventListener("click", () => loveBurst());

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") loveBurst(state.eco ? 90 : 160, rand(20, 80));
    if (e.key.toLowerCase() === "m") spawnMeteor(true);
  });

  // Tap anywhere: sparkles + mini burst (also starts experience)
  window.addEventListener("pointerup", (e) => {
    if (!state.started) startExperience();
    addSparks(e.clientX, e.clientY, state.eco ? 40 : 66);
    loveBurst(state.eco ? 18 : 26, (e.clientX / innerWidth) * 100);
  }, { passive: true });

  // ===================== PARALLAX / TILT =====================
  let tiltX = 0, tiltY = 0;
  let tilting = false;

  function applyTilt(){
    const rx = (tiltY * -8).toFixed(2);
    const ry = (tiltX * 10).toFixed(2);
    // only tilt love screen card (keeps draw/game stable)
    if (state.screen === "love") {
      cardLove.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    }
  }
  function setTiltFromClient(x, y){
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

  // ===================== BACKGROUND FX (stars + aurora + sparks + meteors + constellations) =====================
  let W=0, H=0, DPR=1;
  let stars = [];
  let wisps = [];
  let sparks = [];
  let meteors = [];

  function starCount(){
    const base = state.eco ? 95000 : 68000;
    return Math.floor((W*H) / base);
  }
  function wispCount(){ return state.eco ? 5 : 9; }

  function newWisp(){
    return {
      x: Math.random()*W,
      y: Math.random()*H,
      vx: rand(-0.12, 0.12) * DPR,
      vy: rand(-0.08, 0.08) * DPR,
      a: rand(0.08, 0.16),
      r: rand(220, 520) * DPR,
      hue: Math.random() < 0.5 ? rand(300, 335) : rand(190, 205),
      ph: rand(0, Math.PI*2)
    };
  }

  function resizeFX(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    fx.width = W; fx.height = H;

    stars = Array.from({ length: starCount() }, () => ({
      x: Math.random()*W,
      y: Math.random()*H,
      z: rand(0.25, 1.0),
      r: rand(0.6, 1.7) * DPR,
      tw: rand(0, Math.PI*2),
      hue: rand(310, 360)
    }));

    wisps = Array.from({ length: wispCount() }, () => newWisp());
  }

  function addSparks(x, y, count=50){
    for (let k=0; k<count; k++){
      const ang = Math.random()*Math.PI*2;
      const spd = rand(1.2, state.eco ? 5.6 : 7.2) * DPR;
      sparks.push({
        x: x*DPR, y: y*DPR,
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd,
        life: rand(22, state.eco ? 44 : 60),
        r: rand(1.0, 2.2)*DPR,
        hue: rand(300, 360)
      });
    }
    const cap = state.eco ? 240 : 520;
    if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
  }

  function spawnMeteor(force=false){
    if (!state.meteors && !force) return;
    if (!force && Math.random() > (state.eco ? 0.004 : 0.007)) return;

    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? rand(-0.2, 0.2)*W : rand(0.8, 1.2)*W;
    const y = rand(0.05, 0.35)*H;
    const vx = fromLeft ? rand(8, 12) : rand(-12, -8);
    const vy = rand(3, 6);

    meteors.push({
      x, y,
      vx: vx * DPR,
      vy: vy * DPR,
      life: 1.0,
      len: rand(160, 280)*DPR
    });

    const cap = state.eco ? 2 : 4;
    if (meteors.length > cap) meteors.splice(0, meteors.length - cap);
  }

  // perf heuristic
  let frameSamples = [];
  function updatePerf(ms){
    frameSamples.push(ms);
    if (frameSamples.length > 30) frameSamples.shift();
    const avg = frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length;
    perfPill.textContent = (avg > 20 && !state.eco) ? "🧊 try eco" : "⚡ smooth";
  }

  let lastT = performance.now();
  function fxFrame(t){
    const rawDt = Math.min(34, t - lastT);
    lastT = t;
    const dt = rawDt * state.intensity;

    updatePerf(rawDt);

    // trail fade
    fxCtx.globalCompositeOperation = "source-over";
    fxCtx.globalAlpha = 0.16;
    fxCtx.fillStyle = "#06040d";
    fxCtx.fillRect(0,0,W,H);
    fxCtx.globalAlpha = 1;

    const parX = tiltX * 18 * DPR;
    const parY = tiltY * 12 * DPR;

    // wisps
    fxCtx.globalCompositeOperation = "lighter";
    for (const w of wisps){
      w.ph += 0.0016 * dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;

      if (w.x < -w.r) w.x = W + w.r;
      if (w.x > W + w.r) w.x = -w.r;
      if (w.y < -w.r) w.y = H + w.r;
      if (w.y > H + w.r) w.y = -w.r;

      const pulse = 0.6 + 0.4*Math.sin(w.ph);
      const rr = w.r * (0.82 + 0.18*pulse);

      const gx = w.x + parX * w.a * 1.2;
      const gy = w.y + parY * w.a * 1.1;

      const g = fxCtx.createRadialGradient(gx, gy, 0, gx, gy, rr);
      const a = w.a * (state.eco ? 0.85 : 1.0);
      g.addColorStop(0, `hsla(${w.hue}, 95%, 70%, ${a * 0.55})`);
      g.addColorStop(0.45, `hsla(${w.hue+18}, 95%, 65%, ${a * 0.22})`);
      g.addColorStop(1, `hsla(${w.hue+40}, 95%, 60%, 0)`);
      fxCtx.fillStyle = g;
      fxCtx.beginPath();
      fxCtx.arc(gx, gy, rr, 0, Math.PI*2);
      fxCtx.fill();
    }

    // stars
    fxCtx.globalCompositeOperation = "lighter";
    for (const s of stars){
      s.tw += (0.002 + 0.006*s.z) * dt;
      const a = 0.25 + 0.75*(0.5 + 0.5*Math.sin(s.tw));
      fxCtx.globalAlpha = a * (0.35 + 0.65*s.z);

      fxCtx.beginPath();
      fxCtx.arc(s.x + parX*s.z, s.y + parY*s.z, s.r, 0, Math.PI*2);
      fxCtx.fillStyle = `hsla(${s.hue}, 100%, 85%, 1)`;
      fxCtx.fill();
    }
    fxCtx.globalAlpha = 1;

    // constellations
    if (state.constellations){
      const maxLinks = state.eco ? 60 : 140;
      let links = 0;
      fxCtx.lineWidth = 1 * DPR;
      for (let i=0; i<stars.length && links < maxLinks; i++){
        const a = stars[i];
        for (let j=i+1; j<i+10 && j<stars.length; j++){
          const b = stars[j];
          const dx = (a.x - b.x);
          const dy = (a.y - b.y);
          const d2 = dx*dx + dy*dy;
          const thresh = (state.eco ? 90 : 120) * DPR;
          if (d2 < thresh*thresh){
            const alpha = 0.14 * (1 - Math.sqrt(d2)/(thresh));
            fxCtx.globalAlpha = alpha;
            fxCtx.strokeStyle = "rgba(255,255,255,1)";
            fxCtx.beginPath();
            fxCtx.moveTo(a.x + parX*a.z, a.y + parY*a.z);
            fxCtx.lineTo(b.x + parX*b.z, b.y + parY*b.z);
            fxCtx.stroke();
            links++;
          }
        }
      }
      fxCtx.globalAlpha = 1;
    }

    // meteors
    spawnMeteor(false);
    for (let i=meteors.length - 1; i>=0; i--){
      const m = meteors[i];
      m.life -= 0.012 * (dt/16);
      m.x += m.vx * (dt/16);
      m.y += m.vy * (dt/16);

      const a = Math.max(0, m.life);
      fxCtx.globalAlpha = a;

      fxCtx.strokeStyle = "rgba(255,255,255,1)";
      fxCtx.lineWidth = 2 * DPR;
      fxCtx.beginPath();
      fxCtx.moveTo(m.x, m.y);
      fxCtx.lineTo(m.x - m.vx*0.8, m.y - m.vy*0.8);
      fxCtx.stroke();

      fxCtx.globalAlpha = a * 0.5;
      fxCtx.lineWidth = 4 * DPR;
      const mm = Math.max(0.0001, Math.hypot(m.vx, m.vy));
      fxCtx.beginPath();
      fxCtx.moveTo(m.x, m.y);
      fxCtx.lineTo(m.x - (m.vx/mm)*m.len, m.y - (m.vy/mm)*m.len);
      fxCtx.stroke();

      fxCtx.globalAlpha = 1;

      if (m.life <= 0 || m.x < -300 || m.x > W+300 || m.y > H+300) meteors.splice(i, 1);
    }

    // sparks
    fxCtx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--){
      const p = sparks[i];
      p.life -= 1;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02 * DPR;

      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, p.life / (state.eco ? 44 : 60));
      fxCtx.globalAlpha = a;

      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      fxCtx.fillStyle = `hsla(${p.hue}, 100%, 70%, 1)`;
      fxCtx.fill();

      if (p.life <= 0) sparks.splice(i, 1);
    }
    fxCtx.globalAlpha = 1;
    fxCtx.globalCompositeOperation = "source-over";

    requestAnimationFrame(fxFrame);
  }

  window.addEventListener("resize", () => {
    resizeFX();
    resizeAllCanvases();
  }, { passive: true });

  // ===================== HEARTS STREAM (pooled + capped) =====================
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

  function heartCap(){
    if (!state.hearts) return 0;
    if (state.eco) return 20 + Math.floor(state.heartRate * 0.18);
    return 34 + Math.floor(state.heartRate * 0.22);
  }

  function heartInterval(){
    if (!state.hearts) return 999999;
    const r = state.heartRate / 100;
    return state.eco ? lerp(900, 220, r) : lerp(650, 160, r);
  }

  function newHeartEl(){
    const h = document.createElement("div");
    h.className = "heart";
    heartField.appendChild(h);
    return h;
  }
  function getHeartEl(){ return heartPool.pop() || newHeartEl(); }
  function releaseHeartEl(h){
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

  function refreshHearts(){
    if (heartTimer) clearInterval(heartTimer);
    heartTimer = setInterval(() => spawnHeart(), heartInterval());
  }

  function seedHearts(){
    const n = state.eco ? 12 : 22;
    for (let k=0;k<n;k++){
      spawnHeart({ xvw: Math.random()*100, size: rand(0.6, 1.9), t: rand(7, 15), drift: rand(-10, 10) });
    }
  }

  function loveBurst(n = state.eco ? 80 : 130, xvw = 50){
    if (!state.started) startExperience();

    for (let k = 0; k < n; k++) {
      spawnHeart({
        xvw: clamp(xvw + rand(-10, 10), 0, 100),
        size: rand(0.7, state.eco ? 2.4 : 3.1),
        t: rand(4.2, state.eco ? 8.8 : 9.6),
        drift: rand(-18, 18)
      });
    }
    addSparks((xvw/100) * innerWidth, innerHeight * rand(0.35, 0.65), state.eco ? 44 : 74);
  }

  // ===================== DRAW SCREEN (phone-optimized) =====================
  const dctx = drawCanvas.getContext("2d", { alpha: true });
  let drawW=0, drawH=0, drawDPR=1;

  const palette = [
    "#ff4da6", "#ff2d55", "#7c4dff", "#2dfcff", "#ffd36e",
    "#ffffff", "#ff9bd6", "#b792ff", "#7cffd9", "#ff7b2d"
  ];
  let drawColor = palette[0];
  let drawMode = "brush";
  let brushSize = parseInt(brushSizeEl.value, 10);

  // undo stack (small, memory-safe)
  const undoStack = [];
  const UNDO_MAX = 12;

  function pushUndo(){
    try{
      const img = dctx.getImageData(0,0,drawW,drawH);
      undoStack.push(img);
      if (undoStack.length > UNDO_MAX) undoStack.shift();
    } catch { /* ignore */ }
  }

  function clearDraw(){
    dctx.clearRect(0,0,drawW,drawH);
    // soft background tint
    const g = dctx.createLinearGradient(0,0,drawW,drawH);
    g.addColorStop(0, "rgba(255,77,166,.06)");
    g.addColorStop(0.5, "rgba(124,77,255,.04)");
    g.addColorStop(1, "rgba(45,252,255,.05)");
    dctx.fillStyle = g;
    dctx.fillRect(0,0,drawW,drawH);
  }

  function setActiveMode(btn){
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    drawMode = btn.dataset.mode;
  }
  modeButtons.forEach(b => b.addEventListener("click", () => setActiveMode(b)));

  function buildPalette(){
    paletteEl.innerHTML = "";
    palette.forEach((c, idx) => {
      const s = document.createElement("div");
      s.className = "swatch" + (idx===0 ? " active":"");
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

  brushSizeEl.addEventListener("input", () => {
    brushSize = parseInt(brushSizeEl.value, 10);
  });

  undoBtn.addEventListener("click", () => {
    if (!undoStack.length) return;
    const img = undoStack.pop();
    dctx.putImageData(img, 0, 0);
  });

  clearBtn.addEventListener("click", () => {
    pushUndo();
    clearDraw();
  });

  saveBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "hannah_banana_love_art.png";
    a.href = drawCanvas.toDataURL("image/png");
    a.click();
  });

  // Drawing logic
  let drawing = false;
  let lastX=0, lastY=0;

  function normPos(e, canvas){
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    return {x,y};
  }

  function drawStroke(x1,y1,x2,y2){
    if (drawMode === "heart" || drawMode === "star"){
      // stamp along path
      const steps = Math.max(1, Math.floor(dist(x1,y1,x2,y2) / (brushSize*0.9)));
      for (let i=0;i<=steps;i++){
        const t = i/steps;
        const x = lerp(x1,x2,t);
        const y = lerp(y1,y2,t);
        if (drawMode === "heart") stampHeart(x,y);
        else stampStar(x,y);
      }
      return;
    }

    // brush/glow lines
    dctx.lineCap = "round";
    dctx.lineJoin = "round";
    dctx.lineWidth = brushSize * drawDPR;
    dctx.strokeStyle = drawColor;

    if (drawMode === "glow"){
      dctx.shadowBlur = 18 * drawDPR;
      dctx.shadowColor = drawColor;
      dctx.globalAlpha = 0.95;
    } else {
      dctx.shadowBlur = 0;
      dctx.globalAlpha = 0.95;
    }

    // gradient stroke for "beautfiul colors"
    const grad = dctx.createLinearGradient(x1,y1,x2,y2);
    grad.addColorStop(0, withAlpha(drawColor, 0.95));
    grad.addColorStop(1, withAlpha(palette[(Math.random()*palette.length)|0], 0.85));
    dctx.strokeStyle = grad;

    dctx.beginPath();
    dctx.moveTo(x1,y1);
    dctx.lineTo(x2,y2);
    dctx.stroke();

    // small sparkles (cheap)
    if (Math.random() < 0.12){
      dctx.globalAlpha = 0.9;
      dctx.fillStyle = "rgba(255,255,255,.75)";
      dctx.beginPath();
      dctx.arc(x2, y2, rand(1.2, 2.2)*drawDPR, 0, Math.PI*2);
      dctx.fill();
    }

    dctx.shadowBlur = 0;
    dctx.globalAlpha = 1;
  }

  function stampHeart(x,y){
    const s = (brushSize * rand(0.7, 1.3)) * drawDPR;
    dctx.save();
    dctx.translate(x,y);
    dctx.rotate(Math.PI/4);
    dctx.globalAlpha = 0.9;
    dctx.fillStyle = withAlpha(drawColor, 0.9);
    dctx.shadowBlur = 14 * drawDPR;
    dctx.shadowColor = drawColor;

    // heart via two circles + square (like CSS heart)
    dctx.beginPath();
    dctx.rect(-s/2, -s/2, s, s);
    dctx.arc(-s/2, 0, s/2, 0, Math.PI*2);
    dctx.arc(0, -s/2, s/2, 0, Math.PI*2);
    dctx.fill();

    dctx.restore();
  }

  function stampStar(x,y){
    const r = (brushSize * rand(0.9, 1.5)) * drawDPR;
    const spikes = 5;
    let rot = -Math.PI / 2;
    let step = Math.PI / spikes;

    dctx.save();
    dctx.translate(x,y);
    dctx.globalAlpha = 0.9;
    dctx.fillStyle = withAlpha(drawColor, 0.9);
    dctx.shadowBlur = 12 * drawDPR;
    dctx.shadowColor = drawColor;

    dctx.beginPath();
    dctx.moveTo(0, -r);
    for (let i=0; i<spikes; i++){
      dctx.lineTo(Math.cos(rot + step) * (r*0.45), Math.sin(rot + step) * (r*0.45));
      rot += step;
      dctx.lineTo(Math.cos(rot + step) * r, Math.sin(rot + step) * r);
      rot += step;
    }
    dctx.closePath();
    dctx.fill();
    dctx.restore();
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
    drawStroke(lastX,lastY,p.x,p.y);
    lastX = p.x; lastY = p.y;
  });

  function endDraw(){
    if (!drawing) return;
    drawing = false;
    dctx.shadowBlur = 0;
    dctx.globalAlpha = 1;
    drawMsg.textContent = LOVE_LINES[(msgIndex + 1) % LOVE_LINES.length];
  }
  drawCanvas.addEventListener("pointerup", endDraw);
  drawCanvas.addEventListener("pointercancel", endDraw);

  // ===================== FLAPPY VALENTINE (canvas) =====================
  const gctx = gameCanvas.getContext("2d", { alpha: true });
  let gW=0, gH=0, gDPR=1;

  const game = {
    running: false,
    paused: false,
    t: 0,

    score: 0,
    candy: 0,

    bird: { x: 0, y: 0, vy: 0, r: 16 },
    gravity: 0.55,
    flap: -8.4,

    pipes: [],
    pipeGap: 150,
    pipeW: 58,
    pipeSpeed: 2.6,

    candies: [],
    candySpeed: 2.6,

    msgCooldown: 0,
    candyRush: 0
  };

  function resetGame(){
    game.running = false;
    game.paused = false;
    game.t = 0;
    game.score = 0;
    game.candy = 0;
    scoreEl.textContent = "0";
    candyEl.textContent = "0";
    gameMsg.textContent = LOVE_LINES[(msgIndex + 2) % LOVE_LINES.length];

    game.bird.x = gW * 0.28;
    game.bird.y = gH * 0.48;
    game.bird.vy = 0;
    game.bird.r = 16 * gDPR;

    game.pipes = [];
    game.candies = [];
    game.pipeGap = (state.eco ? 160 : 150) * gDPR;
    game.pipeW = 58 * gDPR;
    game.pipeSpeed = (state.eco ? 2.2 : 2.6) * gDPR;
    game.candySpeed = game.pipeSpeed;
    game.candyRush = 0;

    overlay.classList.remove("hidden");
  }

  function startGame(){
    if (!state.started) startExperience();
    overlay.classList.add("hidden");
    game.running = true;
    game.paused = false;
  }

  function togglePause(){
    if (!game.running) return;
    game.paused = !game.paused;
    pauseBtn.textContent = game.paused ? "▶ Resume" : "⏸ Pause";
  }

  function spawnPipe(){
    const margin = 70 * gDPR;
    const gap = game.pipeGap;
    const topH = rand(margin, gH - margin - gap);

    game.pipes.push({
      x: gW + 40 * gDPR,
      topH,
      passed: false
    });

    // spawn candy sometimes (more during candy rush)
    const candyChance = game.candyRush > 0 ? 0.9 : 0.45;
    if (Math.random() < candyChance){
      game.candies.push({
        x: gW + 40 * gDPR + game.pipeW * 0.5,
        y: topH + gap * rand(0.25, 0.75),
        r: 10 * gDPR,
        taken: false
      });
    }
  }

  function birdCollidesPipe(px, topH){
    const r = game.bird.r;
    const bx = game.bird.x;
    const by = game.bird.y;
    const w = game.pipeW;
    const gap = game.pipeGap;

    // pipe rects
    const left = px;
    const right = px + w;

    // bird circle vs axis-aligned rect collision (approx)
    if (bx + r < left || bx - r > right) return false;

    // if bird is inside vertical gap it's safe
    if (by - r > topH && by + r < topH + gap) return false;

    return true;
  }

  function birdCollidesCandy(c){
    if (c.taken) return false;
    const dx = game.bird.x - c.x;
    const dy = game.bird.y - c.y;
    const rr = game.bird.r + c.r;
    return (dx*dx + dy*dy) <= rr*rr;
  }

  function flap(){
    if (!game.running) startGame();
    if (game.paused) return;
    game.bird.vy = game.flap * gDPR;
  }

  // controls
  gameCanvas.addEventListener("pointerup", (e) => {
    if (state.screen !== "game") return;
    e.preventDefault();
    flap();
  }, { passive: false });

  startGameBtn.addEventListener("click", () => { showScreen("game"); startGame(); });
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", () => { resetGame(); startGame(); });
  megaCandyBtn.addEventListener("click", () => {
    if (!game.running) startGame();
    game.candyRush = 900; // ~15s at 60fps
    gameMsg.textContent = LOVE_LINES[(msgIndex + 3) % LOVE_LINES.length];
  });

  // ===================== CANVAS RESIZE =====================
  function resizeCanvasToElement(canvas){
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    return dpr;
  }

  function resizeAllCanvases(){
    // draw
    drawDPR = resizeCanvasToElement(drawCanvas);
    drawW = drawCanvas.width;
    drawH = drawCanvas.height;
    clearDraw();

    // game
    gDPR = resizeCanvasToElement(gameCanvas);
    gW = gameCanvas.width;
    gH = gameCanvas.height;
    resetGame();
  }

  // ===================== GAME RENDER =====================
  function drawHeartBird(x,y,r){
    // heart using two arcs + triangle-ish bottom
    gctx.save();
    gctx.translate(x,y);
    gctx.scale(r/20, r/20);

    gctx.globalAlpha = 1;
    const grad = gctx.createLinearGradient(-20,-20,20,20);
    grad.addColorStop(0, "rgba(255,77,166,1)");
    grad.addColorStop(1, "rgba(124,77,255,0.95)");
    gctx.fillStyle = grad;

    gctx.beginPath();
    gctx.moveTo(0, 12);
    gctx.bezierCurveTo(18, -2, 16, -16, 0, -8);
    gctx.bezierCurveTo(-16, -16, -18, -2, 0, 12);
    gctx.closePath();
    gctx.shadowBlur = 18;
    gctx.shadowColor = "rgba(255,77,166,0.45)";
    gctx.fill();

    // tiny eye sparkle
    gctx.shadowBlur = 0;
    gctx.fillStyle = "rgba(255,255,255,0.9)";
    gctx.beginPath();
    gctx.arc(4, -3, 1.6, 0, Math.PI*2);
    gctx.fill();

    gctx.restore();
  }

  function drawCandy(c){
    gctx.save();
    gctx.translate(c.x, c.y);
    gctx.globalAlpha = 0.95;
    gctx.shadowBlur = 16 * gDPR;
    gctx.shadowColor = "rgba(255,211,110,0.35)";

    const grad = gctx.createLinearGradient(-c.r,-c.r,c.r,c.r);
    grad.addColorStop(0, "rgba(255,211,110,1)");
    grad.addColorStop(1, "rgba(255,77,166,0.9)");
    gctx.fillStyle = grad;

    // candy swirl circle
    gctx.beginPath();
    gctx.arc(0,0,c.r,0,Math.PI*2);
    gctx.fill();

    gctx.shadowBlur = 0;
    gctx.strokeStyle = "rgba(255,255,255,0.65)";
    gctx.lineWidth = 2 * gDPR;
    gctx.beginPath();
    gctx.arc(0,0,c.r*0.65,0,Math.PI*2);
    gctx.stroke();

    gctx.restore();
  }

  function drawPipes(p){
    const x = p.x;
    const w = game.pipeW;
    const gap = game.pipeGap;

    // pipe gradient
    const g = gctx.createLinearGradient(x,0,x+w,0);
    g.addColorStop(0, "rgba(45,252,255,0.22)");
    g.addColorStop(0.5, "rgba(255,77,166,0.18)");
    g.addColorStop(1, "rgba(124,77,255,0.18)");

    gctx.fillStyle = g;
    gctx.globalAlpha = 1;

    // top column
    gctx.fillRect(x, 0, w, p.topH);
    // bottom column
    const bottomY = p.topH + gap;
    gctx.fillRect(x, bottomY, w, gH - bottomY);

    // glowing edges
    gctx.strokeStyle = "rgba(255,255,255,0.22)";
    gctx.lineWidth = 2 * gDPR;
    gctx.strokeRect(x, 0, w, p.topH);
    gctx.strokeRect(x, bottomY, w, gH - bottomY);
  }

  function gameLoop(){
    if (!game.running) return;

    if (game.paused){
      requestAnimationFrame(gameLoop);
      return;
    }

    game.t++;

    // background fade (transparent; relies on card)
    gctx.clearRect(0,0,gW,gH);

    // subtle moving backdrop in game canvas
    const bg = gctx.createRadialGradient(gW*0.4,gH*0.3, 20, gW*0.5,gH*0.4, Math.max(gW,gH));
    bg.addColorStop(0, "rgba(255,77,166,0.10)");
    bg.addColorStop(0.5, "rgba(124,77,255,0.06)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    gctx.fillStyle = bg;
    gctx.fillRect(0,0,gW,gH);

    // physics
    game.bird.vy += game.gravity * gDPR;
    game.bird.y += game.bird.vy;

    // spawn pipes
    const interval = state.eco ? 110 : 95;
    if (game.t % interval === 0) spawnPipe();

    // move pipes + score
    for (let i=game.pipes.length-1; i>=0; i--){
      const p = game.pipes[i];
      p.x -= game.pipeSpeed;

      // passed
      if (!p.passed && p.x + game.pipeW < game.bird.x){
        p.passed = true;
        game.score += 1;
        scoreEl.textContent = String(game.score);

        // “not too extra” message, but ONLY from list:
        if (game.score % 6 === 0) {
          gameMsg.textContent = LOVE_LINES[(game.score/6 | 0) % LOVE_LINES.length];
        }
      }

      // collision
      if (birdCollidesPipe(p.x, p.topH)){
        endGame();
        return;
      }

      // cleanup
      if (p.x + game.pipeW < -120 * gDPR) game.pipes.splice(i, 1);
    }

    // candies
    for (let i=game.candies.length-1; i>=0; i--){
      const c = game.candies[i];
      c.x -= game.candySpeed;
      if (birdCollidesCandy(c)){
        c.taken = true;
        game.candy += 1;
        candyEl.textContent = String(game.candy);
        // mini sparkle
        addSparks((c.x / gDPR), (c.y / gDPR), state.eco ? 20 : 30);
      }
      if (c.x < -120 * gDPR || c.taken) game.candies.splice(i, 1);
    }

    // bounds
    if (game.bird.y - game.bird.r < 0 || game.bird.y + game.bird.r > gH){
      endGame();
      return;
    }

    // draw
    for (const p of game.pipes) drawPipes(p);
    for (const c of game.candies) drawCandy(c);
    drawHeartBird(game.bird.x, game.bird.y, game.bird.r);

    // candy rush timer
    if (game.candyRush > 0) game.candyRush--;

    requestAnimationFrame(gameLoop);
  }

  function endGame(){
    game.running = false;
    overlay.classList.remove("hidden");
    overlay.querySelector(".overlay-title").textContent = "Tap to Try Again 💘";
    overlay.querySelector(".overlay-sub").textContent = LOVE_LINES[(msgIndex + 4) % LOVE_LINES.length];
  }

  // ===================== DRAW / GAME SCREEN BUTTON HELPERS =====================
  function resizeAfterNav(){
    // ensure canvases match layout after switching
    setTimeout(resizeAllCanvases, 40);
  }

  // ===================== SCREEN SWITCH SIDE EFFECTS =====================
  // pause the game when leaving the game screen
  function onScreenChanged(){
    setActiveNav();
    if (state.screen !== "game" && game.running) {
      game.paused = true;
      pauseBtn.textContent = "▶ Resume";
    }
    resizeAfterNav();
  }

  // wrap showScreen to include side effects
  const _showScreen = showScreen;
  showScreen = function(name){
    _showScreen(name);
    onScreenChanged();
  };

  // ===================== GAME BUTTONS =====================
  pauseBtn.addEventListener("click", () => {
    togglePause();
    if (game.running && !game.paused) requestAnimationFrame(gameLoop);
  });

  restartBtn.addEventListener("click", () => {
    resetGame();
    startGame();
    requestAnimationFrame(gameLoop);
  });

  // Start on overlay tap too
  overlay.addEventListener("pointerup", () => {
    if (state.screen !== "game") showScreen("game");
    resetGame();
    startGame();
    requestAnimationFrame(gameLoop);
  }, { passive: true });

  // ===================== HELPERS =====================
  function rand(a,b){ return a + Math.random()*(b-a); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function dist(x1,y1,x2,y2){ return Math.hypot(x2-x1, y2-y1); }
  function withAlpha(hex, a){
    // hex like #rrggbb
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ===================== BOOT =====================
  resizeFX();
  requestAnimationFrame(fxFrame);

  refreshHearts();
  seedHearts();

  // initial canvases once visible
  resizeAllCanvases();

  // default draw footer message
  drawMsg.textContent = LOVE_LINES[1];
  gameMsg.textContent = LOVE_LINES[2];

  // Start experience if user clicks nav early
  [toLove,toDraw,toGame].forEach(btn => btn.addEventListener("click", startExperience, { once: true }));

  // Ensure nav shows Love at start
  showScreen("love");

})();
