(() => {
  // ===================== CONFIG (mobile-optimized) =====================
  const PREFERS_REDUCED = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // Start in Eco on small screens (still gorgeous, just fewer particles)
  const startEco = (Math.min(window.innerWidth, window.innerHeight) < 520) || PREFERS_REDUCED;

  // One main FX canvas: stars + aurora wisps + click sparkles + subtle pulses
  const fx = document.getElementById("fx");
  const ctx = fx.getContext("2d", { alpha: true });

  const card = document.getElementById("card");
  const typeEl = document.getElementById("type");
  const subtitle = document.getElementById("subtitle");

  const heartField = document.getElementById("heartField");
  const burstBtn = document.getElementById("burstBtn");
  const toggleEco = document.getElementById("toggleEco");
  const toggleNeon = document.getElementById("toggleNeon");

  // CSS knobs
  let eco = startEco;
  let neon = false;

  // "speed" affects CSS only; canvas uses its own dt scaling.
  function setEco(v){
    eco = !!v;
    document.body.classList.toggle("eco", eco);
    toggleEco.textContent = eco ? "🔥 Full FX" : "📱 Mobile Eco";
  }
  setEco(eco);

  // ===================== TYPEWRITER (cheap, cute) =====================
  const message = "I Love You Hannah Banana 💘";
  let ti = 0;

  function typeLoop() {
    typeEl.textContent = message.slice(0, ti);
    ti++;
    if (ti <= message.length) {
      setTimeout(typeLoop, 52);
    } else {
      setTimeout(() => {
        subtitle.style.opacity = 0;
        setTimeout(() => {
          subtitle.textContent = "Tap the screen… I coded an infinite love machine for you. ♾️💗";
          subtitle.style.opacity = 1;
        }, 240);
      }, 900);
    }
  }
  typeLoop();

  // ===================== HEARTS (POOL + CAP) =====================
  // DOM hearts look crisp and are cheap IF capped and recycled.
  const COLORS = [
    "rgba(255,77,166,.95)",
    "rgba(255,45,85,.95)",
    "rgba(124,77,255,.92)",
    "rgba(45,252,255,.86)",
    "rgba(255,211,110,.80)"
  ];

  const HEART_CAP = () => eco ? 26 : 54;   // max DOM hearts alive
  const HEART_RATE = () => eco ? 420 : 240; // spawn interval ms

  const heartPool = [];
  let heartsAlive = 0;

  function newHeartEl(){
    const h = document.createElement("div");
    h.className = "heart";
    heartField.appendChild(h);
    return h;
  }

  function getHeartEl(){
    return heartPool.pop() || newHeartEl();
  }

  function releaseHeartEl(h){
    // Remove animation by resetting; keep in pool
    h.style.animation = "none";
    h.style.opacity = "0";
    // Force reflow so next animation restarts cleanly
    // eslint-disable-next-line no-unused-expressions
    h.offsetHeight;
    heartPool.push(h);
  }

  function spawnHeart({ xvw = Math.random() * 100, size = rand(0.65, 2.2), t = rand(6.5, 14.5), drift = rand(-12, 12) } = {}) {
    if (heartsAlive >= HEART_CAP()) return;

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

  // Seed a few hearts
  const seed = eco ? 14 : 28;
  for (let k = 0; k < seed; k++) {
    spawnHeart({ xvw: Math.random() * 100, size: rand(0.6, 2.0), t: rand(7, 15), drift: rand(-10, 10) });
  }

  let heartTimer = setInterval(() => spawnHeart(), HEART_RATE());

  function updateHeartTimer(){
    clearInterval(heartTimer);
    heartTimer = setInterval(() => spawnHeart(), HEART_RATE());
  }

  // ===================== LOVE BURST (DOM + CANVAS) =====================
  function loveBurst(n = eco ? 70 : 130, xvw = 50){
    for (let k = 0; k < n; k++) {
      spawnHeart({
        xvw: clamp(xvw + rand(-10, 10), 0, 100),
        size: rand(0.7, eco ? 2.6 : 3.2),
        t: rand(4.2, eco ? 8.8 : 9.5),
        drift: rand(-18, 18)
      });
    }
    // canvas sparkle burst too
    addSparks((xvw/100) * innerWidth, innerHeight * rand(0.35, 0.65), eco ? 42 : 70);
  }

  burstBtn.addEventListener("click", () => loveBurst());

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") loveBurst(eco ? 90 : 160, rand(20,80));
  });

  // ===================== INTERACTION: PARALLAX (mouse + touch) =====================
  // Use pointer events; on mobile, dragging creates a gentle tilt.
  let px = 0, py = 0;
  let tiltX = 0, tiltY = 0;
  let tilting = false;

  function applyTilt(){
    // smooth
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
    tilting = true;
    px = e.clientX; py = e.clientY;
    setTiltFromClient(px, py);
  }, { passive: true });

  window.addEventListener("pointermove", (e) => {
    if (!tilting && e.pointerType === "touch") return;
    px = e.clientX; py = e.clientY;
    setTiltFromClient(px, py);
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    tilting = false;
    // ease back
    tiltX *= 0.25; tiltY *= 0.25;
    applyTilt();
  }, { passive: true });

  // ===================== CANVAS FX (stars + aurora wisps + sparks) =====================
  let W=0, H=0, DPR=1;
  let stars = [];
  let wisps = [];
  let sparks = [];

  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    fx.width = W; fx.height = H;
    ctx.setTransform(1,0,0,1,0,0);

    const starCount = Math.floor((W*H) / (eco ? 90000 : 65000));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random()*W,
      y: Math.random()*H,
      z: rand(0.25, 1.0),
      r: rand(0.6, 1.7) * DPR,
      tw: rand(0, Math.PI*2),
      hue: rand(310, 360)
    }));

    const wispCount = eco ? 5 : 9;
    wisps = Array.from({ length: wispCount }, () => newWisp());
  }

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

  window.addEventListener("resize", resize, { passive: true });

  function addSparks(x, y, count=50){
    for (let k=0; k<count; k++){
      const ang = Math.random()*Math.PI*2;
      const spd = rand(1.2, eco ? 5.6 : 7.2) * DPR;
      sparks.push({
        x: x*DPR, y: y*DPR,
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd,
        life: rand(22, eco ? 48 : 62),
        r: rand(1.0, 2.2)*DPR,
        hue: rand(300, 360)
      });
    }
    // cap sparks
    const cap = eco ? 260 : 520;
    if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
  }

  // Tap/click makes sparkles + small heart burst at tap location
  window.addEventListener("pointerup", (e) => {
    addSparks(e.clientX, e.clientY, eco ? 44 : 72);
    const xvw = (e.clientX / innerWidth) * 100;
    loveBurst(eco ? 26 : 38, xvw);
  }, { passive: true });

  let lastT = performance.now();
  function frame(t){
    const dt = Math.min(34, t - lastT);
    lastT = t;

    // Clear
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = "source-over";

    // Subtle background fade (gives trails without heavy overdraw)
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#06040d";
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha = 1;

    // Parallax from pointer
    const parX = tiltX * 18 * DPR;
    const parY = tiltY * 12 * DPR;

    // ---- Wisps (aurora blobs) ----
    // Cheap: a few huge soft circles with additive blend.
    ctx.globalCompositeOperation = "lighter";
    for (const w of wisps){
      w.ph += 0.0016 * dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;

      // wrap
      if (w.x < -w.r) w.x = W + w.r;
      if (w.x > W + w.r) w.x = -w.r;
      if (w.y < -w.r) w.y = H + w.r;
      if (w.y > H + w.r) w.y = -w.r;

      const pulse = 0.6 + 0.4*Math.sin(w.ph);
      const rr = w.r * (0.82 + 0.18*pulse);

      const gx = w.x + parX * w.a * 1.2;
      const gy = w.y + parY * w.a * 1.1;

      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr);
      g.addColorStop(0, `hsla(${w.hue}, 95%, 70%, ${w.a * 0.55})`);
      g.addColorStop(0.45, `hsla(${w.hue+18}, 95%, 65%, ${w.a * 0.22})`);
      g.addColorStop(1, `hsla(${w.hue+40}, 95%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, rr, 0, Math.PI*2);
      ctx.fill();
    }

    // ---- Stars ----
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

    // ---- Sparks ----
    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--){
      const p = sparks[i];
      p.life -= 1;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02 * DPR;

      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, p.life / (eco ? 48 : 62));
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

  // ===================== BUTTONS =====================
  toggleEco.addEventListener("click", () => {
    setEco(!eco);
    updateHeartTimer();
    resize(); // adjust star/wisp density immediately
  });

  toggleNeon.addEventListener("click", () => {
    neon = !neon;
    document.body.classList.toggle("neon", neon);
    toggleNeon.textContent = neon ? "🌙 Soft Glow" : "✨ Neon";
  });

  // ===================== HELPERS =====================
  function rand(a,b){ return a + Math.random()*(b-a); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  // ===================== BOOT =====================
  resize();
  requestAnimationFrame(frame);

})();
