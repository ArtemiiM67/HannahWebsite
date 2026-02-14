(() => {
  // ===================== SETTINGS / STATE =====================
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const smallScreen = Math.min(innerWidth, innerHeight) < 520;

  const fx = document.getElementById("fx");
  const ctx = fx.getContext("2d", { alpha: true });

  const intro = document.getElementById("intro");
  const introLine = document.getElementById("introLine");

  const card = document.getElementById("card");
  const typeEl = document.getElementById("type");
  const subtitle = document.getElementById("subtitle");
  const fpsPill = document.getElementById("fpsPill");

  const heartField = document.getElementById("heartField");

  // Buttons
  const burstBtn = document.getElementById("burstBtn");
  const momentBtn = document.getElementById("momentBtn");
  const openPanel = document.getElementById("openPanel");
  const closePanel = document.getElementById("closePanel");
  const panel = document.getElementById("panel");
  const resetBtn = document.getElementById("resetBtn");
  const megaBtn = document.getElementById("megaBtn");

  // Toggles
  const tEco = document.getElementById("tEco");
  const tNeon = document.getElementById("tNeon");
  const tHearts = document.getElementById("tHearts");
  const tMeteors = document.getElementById("tMeteors");
  const tConst = document.getElementById("tConstellations");
  const tMusic = document.getElementById("tMusic");
  const tMotionLock = document.getElementById("tMotionLock");

  // Sliders
  const sIntensity = document.getElementById("sIntensity");
  const sHearts = document.getElementById("sHearts");

  const state = {
    started: false,
    eco: smallScreen || prefersReduced,
    neon: false,
    hearts: true,
    meteors: true,
    constellations: true,
    music: false,
    motionLock: false,

    intensity: 1.0,      // affects canvas dt + alpha weights
    heartRate: 65,       // 0..100 (spawn rate)
  };

  // Apply defaults to UI
  tEco.checked = state.eco;
  tNeon.checked = state.neon;
  tHearts.checked = state.hearts;
  tMeteors.checked = state.meteors;
  tConst.checked = state.constellations;
  tMusic.checked = state.music;
  tMotionLock.checked = state.motionLock;
  sIntensity.value = String(state.intensity);
  sHearts.value = String(state.heartRate);

  function applyBodyClasses(){
    document.body.classList.toggle("eco", state.eco);
    document.body.classList.toggle("neon", state.neon);
  }
  applyBodyClasses();

  // ===================== INTRO SEQUENCE =====================
  const introLines = [
    "Initializing ♡",
    "Calibrating sparkles…",
    "Warming up the universe…",
    "Locking onto Hannah Banana 🍌",
    "READY 💘 Tap to enter"
  ];
  let introIdx = 0;
  const introTimer = setInterval(() => {
    introIdx = (introIdx + 1) % introLines.length;
    introLine.textContent = introLines[introIdx];
  }, 850);

  function startExperience(){
    if (state.started) return;
    state.started = true;
    intro.classList.add("hidden");
    setTimeout(() => intro.remove(), 700);
    // first moment
    setTimeout(() => loveBurst(110, 50), 300);
    // auto “moments” (longer show)
    scheduleMoments();
  }

  intro.addEventListener("pointerup", startExperience, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (!state.started && (e.key === "Enter" || e.key === " ")) startExperience();
  });

  // ===================== TYPEWRITER =====================
  const message = "I Love You Hannah Banana 💘";
  let ti = 0;

  function typeLoop() {
    typeEl.textContent = message.slice(0, ti);
    ti++;
    if (ti <= message.length) setTimeout(typeLoop, 52);
  }
  typeLoop();

  // ===================== MOMENTS (longer + fun) =====================
  const moments = [
    { sub: "If love had a soundtrack, you’d be the chorus. 🎶💗", burst: 80, meteor: true },
    { sub: "I choose you in every universe. 🌌💞", burst: 120, meteor: true },
    { sub: "Your smile? Basically a cheat code. 😌✨", burst: 90, meteor: false },
    { sub: "Hannah Banana, you’re my favorite forever. 🍌💘", burst: 140, meteor: true },
    { sub: "Infinity is still not enough. ♾️❤️", burst: 110, meteor: false },
  ];
  let momentIndex = 0;
  let momentTimeout = null;

  function runMoment(manual = false){
    const m = moments[momentIndex];
    momentIndex = (momentIndex + 1) % moments.length;

    subtitle.style.opacity = 0;
    subtitle.style.transform = "translateY(2px)";
    setTimeout(() => {
      subtitle.textContent = m.sub;
      subtitle.style.opacity = 1;
      subtitle.style.transform = "translateY(0)";
    }, 220);

    loveBurst(m.burst, rand(35, 65));
    if (m.meteor) spawnMeteor(true);

    if (manual) pulseCard();
  }

  function scheduleMoments(){
    clearTimeout(momentTimeout);
    // longer pacing; eco mode uses a bit slower to keep it calm
    const base = state.eco ? 9000 : 7500;
    momentTimeout = setTimeout(() => {
      runMoment(false);
      scheduleMoments();
    }, base + rand(0, 2600));
  }

  function pulseCard(){
    card.animate(
      [
        { transform: card.style.transform || "translateZ(0)", offset: 0 },
        { transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1.01)", offset: 0.5 },
        { transform: card.style.transform || "translateZ(0)", offset: 1 }
      ],
      { duration: 520, easing: "ease-out" }
    );
  }

  momentBtn.addEventListener("click", () => runMoment(true));

  // ===================== PANEL =====================
  function openControls(){ panel.classList.add("open"); panel.setAttribute("aria-hidden","false"); }
  function closeControls(){ panel.classList.remove("open"); panel.setAttribute("aria-hidden","true"); }
  openPanel.addEventListener("click", openControls);
  closePanel.addEventListener("click", closeControls);

  // Close panel if tapping outside on mobile
  window.addEventListener("pointerup", (e) => {
    if (!panel.classList.contains("open")) return;
    const within = panel.contains(e.target) || openPanel.contains(e.target);
    if (!within) closeControls();
  }, { passive: true });

  // ===================== TOGGLES / SLIDERS =====================
  tEco.addEventListener("change", () => {
    state.eco = tEco.checked;
    applyBodyClasses();
    resize(); // adjust counts immediately
    refreshHearts();
    scheduleMoments();
  });

  tNeon.addEventListener("change", () => {
    state.neon = tNeon.checked;
    applyBodyClasses();
  });

  tHearts.addEventListener("change", () => {
    state.hearts = tHearts.checked;
  });

  tMeteors.addEventListener("change", () => {
    state.meteors = tMeteors.checked;
  });

  tConst.addEventListener("change", () => {
    state.constellations = tConst.checked;
  });

  tMotionLock.addEventListener("change", () => {
    state.motionLock = tMotionLock.checked;
    if (state.motionLock) { tiltX = 0; tiltY = 0; applyTilt(); }
  });

  sIntensity.addEventListener("input", () => {
    state.intensity = parseFloat(sIntensity.value);
  });

  sHearts.addEventListener("input", () => {
    state.heartRate = parseInt(sHearts.value, 10);
    refreshHearts();
  });

  resetBtn.addEventListener("click", () => {
    Object.assign(state, {
      eco: smallScreen || prefersReduced,
      neon: false,
      hearts: true,
      meteors: true,
      constellations: true,
      music: false,
      motionLock: false,
      intensity: 1.0,
      heartRate: 65
    });
    // push state -> UI
    tEco.checked = state.eco;
    tNeon.checked = state.neon;
    tHearts.checked = state.hearts;
    tMeteors.checked = state.meteors;
    tConst.checked = state.constellations;
    tMusic.checked = state.music;
    tMotionLock.checked = state.motionLock;
    sIntensity.value = String(state.intensity);
    sHearts.value = String(state.heartRate);
    applyBodyClasses();
    resize();
    refreshHearts();
    scheduleMoments();
    subtitle.textContent = "Infinite hearts, infinite vibes, infinite us. ♾️💖";
    loveBurst(100, 50);
  });

  megaBtn.addEventListener("click", () => {
    // Still optimized: we boost but keep caps and eco-off.
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

    applyBodyClasses();
    resize();
    refreshHearts();
    loveBurst(180, 50);
    for (let k=0;k<2;k++) spawnMeteor(true);
    closeControls();
  });

  // ===================== OPTIONAL MUSIC (tiny synth, no file) =====================
  // Runs only after user interaction (required by browsers).
  let audio = null;
  function setMusic(on){
    if (on) {
      if (!audio) audio = makePad();
      audio.start();
    } else {
      audio?.stop();
    }
  }
  tMusic.addEventListener("change", () => {
    state.music = tMusic.checked;
    if (!state.started) startExperience();
    setMusic(state.music);
  });

  function makePad(){
    let ctxA = null, osc1=null, osc2=null, gain=null, lfo=null, lfoGain=null;
    let running = false;

    function start(){
      if (running) return;
      running = true;
      ctxA = new (window.AudioContext || window.webkitAudioContext)();

      gain = ctxA.createGain();
      gain.gain.value = 0.0001;
      gain.connect(ctxA.destination);

      // two detuned sines
      osc1 = ctxA.createOscillator();
      osc2 = ctxA.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = 196; // G3
      osc2.frequency.value = 196;

      osc2.detune.value = 7;

      // LFO for gentle wobble
      lfo = ctxA.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.18;

      lfoGain = ctxA.createGain();
      lfoGain.gain.value = 8;

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start();
      osc2.start();
      lfo.start();

      // fade in
      gain.gain.linearRampToValueAtTime(state.eco ? 0.035 : 0.045, ctxA.currentTime + 1.0);
    }

    function stop(){
      if (!running) return;
      running = false;
      const t = ctxA.currentTime;
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.6);
      setTimeout(() => {
        try { osc1.stop(); osc2.stop(); lfo.stop(); } catch {}
        ctxA.close();
      }, 700);
    }

    return { start, stop };
  }

  // ===================== HEARTS (DOM pooled + capped + adjustable) =====================
  const COLORS = [
    "rgba(255,77,166,.95)",
    "rgba(255,45,85,.95)",
    "rgba(124,77,255,.92)",
    "rgba(45,252,255,.86)",
    "rgba(255,211,110,.80)"
  ];

  // Cap hearts by mode
  const heartPool = [];
  let heartsAlive = 0;
  let heartTimer = null;

  function heartCap(){
    if (!state.hearts) return 0;
    if (state.eco) return 20 + Math.floor(state.heartRate * 0.18); // 20..38
    return 34 + Math.floor(state.heartRate * 0.22);               // 34..56
  }

  function heartInterval(){
    if (!state.hearts) return 999999;
    // heartRate 0..100 => interval ~ (eco: 900..220) (full: 650..160)
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
    // reset animation
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

  // Seed some hearts
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

  burstBtn.addEventListener("click", () => loveBurst());

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") loveBurst(state.eco ? 90 : 160, rand(20,80));
    if (e.key.toLowerCase() === "m") spawnMeteor(true);
  });

  // ===================== PARALLAX / TILT (pointer) =====================
  let tiltX = 0, tiltY = 0;
  let tilting = false;

  function applyTilt(){
    const rx = (tiltY * -8).toFixed(2);
    const ry = (tiltX * 10).toFixed(2);
    card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
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

  // Tap/click -> sparkles + mini burst
  window.addEventListener("pointerup", (e) => {
    if (!state.started) startExperience();
    addSparks(e.clientX, e.clientY, state.eco ? 44 : 72);
    loveBurst(state.eco ? 24 : 34, (e.clientX / innerWidth) * 100);
  }, { passive: true });

  // ===================== CANVAS FX (stars + aurora + sparks + meteors + constellations) =====================
  let W=0, H=0, DPR=1;
  let stars = [];
  let wisps = [];
  let sparks = [];
  let meteors = [];

  function starCount(){
    const base = state.eco ? 90000 : 65000;
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

  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    fx.width = W; fx.height = H;
    ctx.setTransform(1,0,0,1,0,0);

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

  window.addEventListener("resize", resize, { passive: true });

  function addSparks(x, y, count=50){
    for (let k=0; k<count; k++){
      const ang = Math.random()*Math.PI*2;
      const spd = rand(1.2, state.eco ? 5.6 : 7.2) * DPR;
      sparks.push({
        x: x*DPR, y: y*DPR,
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd,
        life: rand(22, state.eco ? 48 : 62),
        r: rand(1.0, 2.2)*DPR,
        hue: rand(300, 360)
      });
    }
    const cap = state.eco ? 260 : 520;
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

  // ===================== PERFORMANCE “FPS” HEURISTIC =====================
  let frameSamples = [];
  function updatePerf(ms){
    frameSamples.push(ms);
    if (frameSamples.length > 30) frameSamples.shift();
    const avg = frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length;
    // Very rough heuristic: if avg frame time is high, suggest eco.
    if (avg > 20 && !state.eco) {
      fpsPill.textContent = "🧊 try eco";
    } else {
      fpsPill.textContent = "⚡ smooth";
    }
  }

  // ===================== RENDER LOOP =====================
  let lastT = performance.now();
  function frame(t){
    const rawDt = Math.min(34, t - lastT);
    lastT = t;

    const dt = rawDt * state.intensity;

    updatePerf(rawDt);

    // trails fade
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#06040d";
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha = 1;

    const parX = tiltX * 18 * DPR;
    const parY = tiltY * 12 * DPR;

    // Wisps (aurora blobs)
    ctx.globalCompositeOperation = "lighter";
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

      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr);
      const a = w.a * (state.eco ? 0.85 : 1.0);
      g.addColorStop(0, `hsla(${w.hue}, 95%, 70%, ${a * 0.55})`);
      g.addColorStop(0.45, `hsla(${w.hue+18}, 95%, 65%, ${a * 0.22})`);
      g.addColorStop(1, `hsla(${w.hue+40}, 95%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, rr, 0, Math.PI*2);
      ctx.fill();
    }

    // Stars
    ctx.globalCompositeOperation = "lighter";
    for (const s of stars){
      s.tw += (0.002 + 0.006*s.z) * dt;
      const a = 0.25 + 0.75*(0.5 + 0.5*Math.sin(s.tw));
      ctx.globalAlpha = a * (0.35 + 0.65*s.z);

      ctx.beginPath();
      ctx.arc(s.x + parX*s.z, s.y + parY*s.z, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 85%, 1)`;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Constellations (cheap: connect near stars)
    if (state.constellations){
      const maxLinks = state.eco ? 70 : 140;
      let links = 0;
      ctx.lineWidth = 1 * DPR;
      for (let i=0; i<stars.length && links < maxLinks; i++){
        const a = stars[i];
        // connect a to a few neighbors only
        for (let j=i+1; j<i+10 && j<stars.length; j++){
          const b = stars[j];
          const dx = (a.x - b.x);
          const dy = (a.y - b.y);
          const d2 = dx*dx + dy*dy;
          const thresh = (state.eco ? 90 : 120) * DPR;
          if (d2 < thresh*thresh){
            const alpha = 0.14 * (1 - Math.sqrt(d2)/(thresh));
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "rgba(255,255,255,1)";
            ctx.beginPath();
            ctx.moveTo(a.x + parX*a.z, a.y + parY*a.z);
            ctx.lineTo(b.x + parX*b.z, b.y + parY*b.z);
            ctx.stroke();
            links++;
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Meteors
    spawnMeteor(false);
    for (let i=meteors.length - 1; i>=0; i--){
      const m = meteors[i];
      m.life -= 0.012 * (dt/16);
      m.x += m.vx * (dt/16);
      m.y += m.vy * (dt/16);

      const a = Math.max(0, m.life);
      ctx.globalAlpha = a;

      // draw streak
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = 2 * DPR;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx*0.8, m.y - m.vy*0.8);
      ctx.stroke();

      // glow tail
      ctx.globalAlpha = a * 0.5;
      ctx.lineWidth = 4 * DPR;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - (m.vx/mag(m.vx,m.vy))*m.len, m.y - (m.vy/mag(m.vx,m.vy))*m.len);
      ctx.stroke();

      ctx.globalAlpha = 1;

      if (m.life <= 0 || m.x < -300 || m.x > W+300 || m.y > H+300) meteors.splice(i, 1);
    }

    // Sparks
    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--){
      const p = sparks[i];
      p.life -= 1;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02 * DPR;

      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, p.life / (state.eco ? 48 : 62));
      ctx.globalAlpha = a;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, 1)`;
      ctx.fill();

      if (p.life <= 0) sparks.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(frame);
  }

  // ===================== HELPERS =====================
  function rand(a,b){ return a + Math.random()*(b-a); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function mag(x,y){ return Math.max(0.0001, Math.hypot(x,y)); }

  // ===================== BOOT =====================
  applyTilt(); // initial
  resize();
  refreshHearts();
  seedHearts();
  requestAnimationFrame(frame);

  // If user toggles music/eco before intro tap, start on first interaction:
  window.addEventListener("pointerdown", () => {
    if (state.music) setMusic(true);
  }, { once: true, passive: true });

})();
