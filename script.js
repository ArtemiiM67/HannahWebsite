(() => {
  const heartField = document.querySelector(".heart-field");
  const stage = document.getElementById("stage");
  const typeEl = document.getElementById("type");
  const subtitle = document.getElementById("subtitle");

  const burstBtn = document.getElementById("burstBtn");
  const toggleSlow = document.getElementById("toggleSlow");
  const toggleNeon = document.getElementById("toggleNeon");

  // ====== TYPEWRITER ======
  const message = "I Love You Hannah Banana 💘";
  let i = 0;

  function typeLoop() {
    typeEl.textContent = message.slice(0, i);
    i++;
    if (i <= message.length) {
      setTimeout(typeLoop, 55);
    } else {
      // little "afterglow" message shuffle
      setTimeout(() => {
        subtitle.style.opacity = 0;
        setTimeout(() => {
          subtitle.textContent = "You + me = infinite vibes, infinite love. ♾️💖";
          subtitle.style.opacity = 1;
        }, 260);
      }, 900);
    }
  }
  typeLoop();

  // ====== HEART SPAWNER ======
  const COLORS = [
    "rgba(255,77,166,.95)",
    "rgba(255,45,85,.95)",
    "rgba(124,77,255,.92)",
    "rgba(45,252,255,.86)",
    "rgba(255,211,110,.80)"
  ];

  function spawnHeart({ x = Math.random() * 100, size = rand(0.7, 2.4), t = rand(6, 14), drift = rand(-10, 10) } = {}) {
    const h = document.createElement("div");
    h.className = "heart";
    h.style.setProperty("--x", `${x}vw`);
    h.style.setProperty("--s", size);
    h.style.setProperty("--t", `${t}s`);
    h.style.setProperty("--drift", `${drift}vw`);
    h.style.setProperty("--c", COLORS[(Math.random() * COLORS.length) | 0]);
    heartField.appendChild(h);

    // cleanup
    setTimeout(() => h.remove(), (t * 1000 + 1500));
  }

  // Initial infinite-ish stream
  for (let k = 0; k < 42; k++) {
    spawnHeart({ x: Math.random() * 100, size: rand(0.6, 2.2), t: rand(7, 16), drift: rand(-12, 12) });
  }
  setInterval(() => spawnHeart(), 260);

  // Extra hearts shortcut
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      loveBurst(120);
    }
  });

  // ====== LOVE BURST ======
  function loveBurst(n = 80, xvw = 50) {
    for (let k = 0; k < n; k++) {
      spawnHeart({
        x: clamp(xvw + rand(-8, 8), 0, 100),
        size: rand(0.7, 3.4),
        t: rand(4.2, 9.5),
        drift: rand(-18, 18)
      });
    }
  }

  burstBtn.addEventListener("click", () => loveBurst(140));

  // ====== SLOW-MO TOGGLE ======
  let slow = false;
  toggleSlow.addEventListener("click", () => {
    slow = !slow;
    document.documentElement.style.setProperty("--speed", slow ? 1.8 : 1);
    toggleSlow.textContent = slow ? "⚡ Normal Speed" : "🌀 Slow-Mo";
  });

  // ====== NEON TOGGLE ======
  let neon = false;
  toggleNeon.addEventListener("click", () => {
    neon = !neon;
    document.body.classList.toggle("neon", neon);
    toggleNeon.textContent = neon ? "🌙 Soft Glow" : "✨ Neon";
  });

  // ====== PARALLAX TILT (mouse) ======
  const card = document.getElementById("card");
  let mx = 0, my = 0, raf = 0;

  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(tickTilt);
  });

  function tickTilt() {
    raf = 0;
    const rx = (my * -7).toFixed(2);
    const ry = (mx * 10).toFixed(2);
    card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }

  // ====== CANVAS: STARFIELD ======
  const stars = document.getElementById("stars");
  const sctx = stars.getContext("2d");

  let W = 0, H = 0, DPR = 1;
  let starParticles = [];

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(window.innerWidth * DPR);
    H = Math.floor(window.innerHeight * DPR);
    stars.width = W; stars.height = H;
    sparks.width = W; sparks.height = H;

    starParticles = Array.from({ length: Math.floor((W * H) / 65000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: rand(0.2, 1.0),
      r: rand(0.6, 1.8) * DPR,
      tw: rand(0, Math.PI * 2)
    }));
  }
  window.addEventListener("resize", resize);

  function drawStars(t) {
    sctx.clearRect(0, 0, W, H);
    sctx.globalCompositeOperation = "lighter";

    const px = mx * 18 * DPR;
    const py = my * 12 * DPR;

    for (const p of starParticles) {
      p.tw += 0.02 / p.z;
      const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(p.tw + t * 0.001));
      sctx.globalAlpha = a * (0.45 + 0.55 * p.z);
      sctx.beginPath();
      sctx.arc(p.x + px * p.z, p.y + py * p.z, p.r, 0, Math.PI * 2);
      sctx.fillStyle = "white";
      sctx.fill();
    }

    sctx.globalAlpha = 1;
    sctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(drawStars);
  }

  // ====== CANVAS: SPARKLES ON CLICK ======
  const sparks = document.getElementById("sparks");
  const pctx = sparks.getContext("2d");
  let sparkParticles = [];

  function addSpark(x, y, count = 34) {
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = rand(1.2, 6.2) * DPR;
      sparkParticles.push({
        x: x * DPR,
        y: y * DPR,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: rand(22, 55),
        r: rand(1.0, 2.3) * DPR,
        hue: rand(300, 360) // pink-ish to purple-ish
      });
    }
  }

  window.addEventListener("click", (e) => {
    addSpark(e.clientX, e.clientY, 42);
    // also do a mini heart burst around click
    const xvw = (e.clientX / window.innerWidth) * 100;
    loveBurst(32, xvw);
  });

  function drawSparks() {
    pctx.clearRect(0, 0, W, H);
    pctx.globalCompositeOperation = "lighter";

    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const p = sparkParticles[i];
      p.life -= 1;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02 * DPR;

      p.x += p.vx;
      p.y += p.vy;

      const a = Math.max(0, p.life / 55);
      pctx.globalAlpha = a;

      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fillStyle = `hsla(${p.hue}, 100%, 70%, 1)`;
      pctx.fill();

      if (p.life <= 0) sparkParticles.splice(i, 1);
    }

    pctx.globalAlpha = 1;
    pctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(drawSparks);
  }

  // ====== HELPERS ======
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Boot
  resize();
  requestAnimationFrame(drawStars);
  requestAnimationFrame(drawSparks);

})();
