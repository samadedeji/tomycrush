const CONFIG = {
  HER_NAME: "Vami", YOUR_NAME: "Samuel",
  CARD_TEXT: "For Vami ♡", OPEN_TITLE: "I have something to tell you", OPEN_HINT: "tap the heart seal",
  WAIT_TITLE: "Wait ♥",
  WAIT_LINES: ["Dear Vami,", "I made something for you.", "It took me a while to get it right.", "But you deserve the effort.", "Go through it slowly."],
  HOLD_LABEL: "Hold my hand ♡", HOLD_HINT: "press and hold",
  REASONS_TITLE: "A few things I'd like to say first",
  REASONS: [
    "At first, you were just a voice among a thousand, indistinguishable from the many others that passed through my ears.",
    "Until I actually listened, and somewhere in the cadence of your voice, I found a melody. One that stirred the rusty strings of my heart back to life.",
    "The more I listened, the more I found myself falling in love with your words, and even more so, with the mind behind them.",
    "There is something remarkably bold about the way you think, a kind of audacity that commands admiration.",
    "Then I saw your face.",
    "And yes, you’re stunning. But that’s not why I’m writing this."
  ],
  LETTER_TITLE: "Before I ask",
  LETTER: ["Vami, I’m going to be honest with you.", "I like you, I really do.", "I’m serious about you, Vami, and I have one question."],
  QUESTION_TEXT: "Vami, I’d really like to take this seriously with you. Will you consider giving us a chance?",
  YES_LABEL: "Yes, let’s see where this goes", NO_LABEL: "No",
  NO_LABELS: ["Are you sure? 🥺", "Think again 🙈", "Really?? 😭"],
  BUDDY_FACES: ["🐱💐", "🥺", "😢", "😭"], LATER_FACE: "🤗", LATER_LABEL: "Maybe later",
  LATER_TITLE: "That’s okay.", LATER_MESSAGE: "It’s fine, Vami. Take all the time you need. I’m not going anywhere.",
  YAY_TITLE: "You said yes.",
  FINAL_TITLE: "Thank you, Vami.", FINAL_SUB: "I promise to take this as seriously as I said. Tell me when you’re ready to talk.",
  CTA_LABEL: "Text Samuel on WhatsApp",
  CTA_URL: "https://wa.me/2348161560444?text=Hi%20Samuel%2C%20I%20read%20it.%20I%27m%20open%20to%20seeing%20where%20this%20goes.",
  MUSIC_FILE: "assets/music.mp3"
};

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ids = ["s-open", "s-wait", "s-reasons", "s-letter", "s-ask", "s-yay", "s-final", "s-later"];
  const screens = document.querySelectorAll(".screen"), back = $("btn-back"), musicBtn = $("btn-music");
  let cur = 0;
  const buzz = (p) => navigator.vibrate && navigator.vibrate(p);

  const text = { "card-text": CONFIG.CARD_TEXT, "open-title": CONFIG.OPEN_TITLE, "open-hint": CONFIG.OPEN_HINT, "wait-title": CONFIG.WAIT_TITLE,
    "hold-label": CONFIG.HOLD_LABEL, "hold-hint": CONFIG.HOLD_HINT, "reasons-title": CONFIG.REASONS_TITLE, "letter-title": CONFIG.LETTER_TITLE,
    "question": CONFIG.QUESTION_TEXT, "btn-yes": CONFIG.YES_LABEL, "btn-no": CONFIG.NO_LABEL, "btn-later": CONFIG.LATER_LABEL,
    "yay-title": CONFIG.YAY_TITLE, "final-title": CONFIG.FINAL_TITLE, "final-sub": CONFIG.FINAL_SUB, "sign": CONFIG.YOUR_NAME,
    "later-title": CONFIG.LATER_TITLE, "later-message": CONFIG.LATER_MESSAGE };
  Object.entries(text).forEach(([id, t]) => { $(id).textContent = t; });
  $("buddy").textContent = CONFIG.BUDDY_FACES[0];
  const cta = $("btn-cta");
  if (CONFIG.CTA_URL && CONFIG.CTA_LABEL) { cta.textContent = CONFIG.CTA_LABEL; cta.href = CONFIG.CTA_URL; cta.hidden = false; }

  // Music (optional: drop assets/music.mp3 in and the mute button appears)
  const audio = new Audio(CONFIG.MUSIC_FILE); audio.loop = true; audio.volume = 0.4;
  audio.addEventListener("canplaythrough", () => { musicBtn.hidden = false; }, { once: true });
  audio.addEventListener("error", () => { musicBtn.hidden = true; });
  const setMusicLabel = () => { musicBtn.textContent = audio.paused ? "🔇" : "♪"; };
  musicBtn.addEventListener("click", () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); setMusicLabel(); });
  audio.addEventListener("play", setMusicLabel); audio.addEventListener("pause", setMusicLabel);
  setMusicLabel();

  function go(i) {
    cur = i;
    screens.forEach((s) => s.classList.toggle("is-active", s.id === ids[i]));
    back.hidden = !(i >= 2 && i <= 4);
    if (enter[i]) enter[i]();
  }
  back.addEventListener("click", () => go(Math.max(cur - 1, 1)));

  // Scene 0: envelope
  $("seal").addEventListener("click", () => {
    $("env").classList.add("open"); buzz(30);
    audio.play().catch(() => {});
    setTimeout(() => go(1), reduce ? 400 : 2600);
  });

  // Scene 1: lines, then hold-to-continue
  const wl = $("wait-lines");
  CONFIG.WAIT_LINES.forEach((t) => { const p = document.createElement("p"); p.textContent = t; wl.appendChild(p); });
  let waitDone = false;
  function enterWait() {
    if (waitDone) return; waitDone = true;
    [...wl.children].forEach((p, i) => setTimeout(() => p.classList.add("on"), 700 + i * 1100));
    setTimeout(() => { $("btn-hold").classList.add("ready"); $("hold-hint").classList.add("ready"); }, 700 + wl.children.length * 1100);
  }
  const hold = $("btn-hold"); let ht = null;
  hold.addEventListener("pointerdown", (e) => { e.preventDefault(); hold.classList.add("holding"); ht = setTimeout(() => { ht = null; hold.classList.remove("holding"); buzz([20, 40, 20]); go(2); }, 1400); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => hold.addEventListener(ev, () => { if (ht) { clearTimeout(ht); ht = null; hold.classList.remove("holding"); } }));
  hold.addEventListener("click", (e) => { if (e.detail === 0) go(2); });

  // Scene 2: scratch cards
  const cv = $("scratch"), ctx = cv.getContext("2d"), nextR = $("btn-next-reason");
  let ri = 0, scratching = false, revealed = false, moves = 0;
  function loadCard() {
    $("reason-text").textContent = CONFIG.REASONS[ri];
    const box = $("card"), w = box.clientWidth, h = box.clientHeight;
    cv.width = w; cv.height = h; cv.style.opacity = 1; cv.style.pointerEvents = "auto";
    revealed = false; nextR.hidden = true; moves = 0;
    $("reason-count").textContent = (ri + 1) + " of " + CONFIG.REASONS.length;
    nextR.textContent = ri === CONFIG.REASONS.length - 1 ? "Next surprise ✨" : "Next one ♡";
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#3b2146"); g.addColorStop(1, "#24132b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = "rgba(255,200,215," + (Math.random() * .35).toFixed(2) + ")"; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.fillStyle = "#f0b4be"; ctx.font = "600 17px Quicksand, sans-serif"; ctx.textAlign = "center"; ctx.fillText("SCRATCH TO REVEAL ♡", w / 2, h / 2 + 6);
  }
  function cleared() {
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0, t = 0;
    for (let i = 3; i < d.length; i += 64) { t++; if (d[i] === 0) n++; }
    return n / t;
  }
  function finishCard() { revealed = true; cv.style.opacity = 0; cv.style.pointerEvents = "none"; buzz(25); setTimeout(() => { nextR.hidden = false; }, 500); }
  function scratchAt(e) {
    const r = cv.getBoundingClientRect(); ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 28, 0, 7); ctx.fill();
    if (++moves % 6 === 0 && !revealed && cleared() > 0.4) finishCard();
  }
  cv.addEventListener("pointerdown", (e) => { scratching = true; cv.setPointerCapture(e.pointerId); scratchAt(e); });
  cv.addEventListener("pointermove", (e) => { if (scratching && !revealed) scratchAt(e); });
  ["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => { scratching = false; }));
  nextR.addEventListener("click", () => { if (ri < CONFIG.REASONS.length - 1) { ri++; loadCard(); } else go(3); });
  const enterReasons = () => { ri = 0; loadCard(); };

  // Scene 3: typewriter letter
  let tw = null; const typed = $("typed"), skip = $("btn-skip"), lnext = $("btn-letter-next");
  function enterLetter() {
    const full = CONFIG.LETTER.join("\n\n"); let i = 0;
    clearInterval(tw); typed.textContent = ""; skip.hidden = false; lnext.hidden = true;
    const finish = () => { clearInterval(tw); typed.textContent = full; skip.hidden = true; lnext.hidden = false; };
    tw = setInterval(() => { typed.textContent = full.slice(0, ++i); if (i >= full.length) finish(); }, 45);
    skip.onclick = finish;
  }
  lnext.addEventListener("click", () => go(4));

  // Scene 4: the ask
  const area = $("ask-area"), yes = $("btn-yes"), no = $("btn-no"), later = $("btn-later"), buddy = $("buddy");
  let noCount = 0, lastCountedAt = 0, laterShownAt = 0, noPos = null, laterOn = false;
  const yesBase = () => ({ w: yes.offsetWidth, h: yes.offsetHeight });
  const yesMax = () => Math.min(1.6, (area.offsetWidth - 24) / Math.max(yesBase().w, 1));
  function yesZone() { const { w, h } = yesBase(), m = yesMax(), cx = area.offsetWidth / 2; return { x1: cx - (w * m) / 2 - 12, x2: cx + (w * m) / 2 + 12, y1: 4, y2: 16 + h * m + 12 }; }
  function placeNo(first) {
    const W = area.offsetWidth, H = area.offsetHeight, s = parseFloat(no.style.getPropertyValue("--s")) || 1;
    const w = no.offsetWidth * s, h = no.offsetHeight * s, z = yesZone();
    const fits = (x, y) => x >= 8 && y >= 8 && x + w <= W - 8 && y + h <= H - 8;
    const hitsYes = (x, y) => x < z.x2 && x + w > z.x1 && y < z.y2 && y + h > z.y1;
    let pos = null;
    if (first) pos = { x: (W - w) / 2, y: z.y2 + 24 };
    else {
      for (let i = 0; i < 25 && !pos; i++) {
        const x = 8 + Math.random() * Math.max(W - w - 16, 0), y = 8 + Math.random() * Math.max(H - h - 16, 0);
        if (fits(x, y) && !hitsYes(x, y) && (!noPos || Math.abs(x - noPos.x) + Math.abs(y - noPos.y) > 24)) pos = { x, y };
      }
      if (!pos) pos = { x: 8, y: H - h - 8 };
    }
    if (first) no.style.transition = "none";
    noPos = pos; no.style.left = pos.x + "px"; no.style.top = pos.y + "px";
    if (first) requestAnimationFrame(() => { no.style.transition = ""; });
  }
  function revealLater() { laterOn = true; no.hidden = true; later.hidden = false; buddy.textContent = CONFIG.LATER_FACE; yes.style.setProperty("--s", Math.min(1.2, yesMax())); laterShownAt = performance.now(); later.focus({ preventScroll: true }); }
  function handleNo() {
    const now = performance.now();
    if (laterOn || now - lastCountedAt < 350) return;
    lastCountedAt = now; noCount++;
    if (noCount > CONFIG.NO_LABELS.length) { revealLater(); return; }
    no.textContent = CONFIG.NO_LABELS[noCount - 1];
    buddy.textContent = CONFIG.BUDDY_FACES[Math.min(noCount, CONFIG.BUDDY_FACES.length - 1)];
    [no, buddy].forEach((el) => { el.classList.remove("jolt"); void el.offsetWidth; el.classList.add("jolt"); });
    yes.style.setProperty("--s", Math.min(1 + noCount * 0.08, yesMax()));
    no.style.setProperty("--s", Math.max(1 - noCount * 0.08, 0.5));
    buzz(12); placeNo(false);
  }
  no.addEventListener("pointerdown", handleNo);
  no.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") handleNo(); });
  no.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleNo(); } });
  no.addEventListener("click", (e) => e.preventDefault());
  addEventListener("resize", () => { if (!laterOn && cur === 4) placeNo(noCount === 0); });
  const enterAsk = () => { if (!laterOn) requestAnimationFrame(() => placeNo(noCount === 0)); };
  yes.addEventListener("click", () => go(5));
  later.addEventListener("click", () => { if (performance.now() - laterShownAt < 400) return; go(7); audio.pause(); });

  // Scene 5: celebration
  function enterYay() {
    buzz([30, 50, 30, 50, 80]);
    const c = window.confetti;
    if (c) {
      const colors = ["#e8a5b0", "#a3162b", "#fff4e6", "#ffb3c1", "#8b1a2b"];
      const shapes = c.shapeFromText ? ["💗", "🌸", "✨"].map((t) => c.shapeFromText({ text: t, scalar: 2 })) : undefined;
      [0, 250, 500].forEach((t) => setTimeout(() => { c({ particleCount: 110, spread: 85, origin: { y: 0.65 }, colors }); if (shapes) c({ particleCount: 24, spread: 100, origin: { y: 0.65 }, shapes, scalar: 2 }); }, t));
    }
    setTimeout(() => { $("btn-yay-next").hidden = false; }, 2200);
  }
  $("btn-yay-next").addEventListener("click", () => go(6));

  // Scene 6: 3D low-poly heart
  let renderer, scene3, cam, heart, started = false;
  function initHeart() {
    if (started) return true;
    if (!window.THREE) return false;
    try {
      const T = THREE, canvas = $("heart-canvas");
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(340, 340, false);
      scene3 = new T.Scene(); cam = new T.PerspectiveCamera(40, 1, 0.1, 100); cam.position.z = 14;
      const pts = []; for (let i = 0; i <= 28; i++) { const t = (i / 28) * Math.PI * 2; pts.push(new T.Vector2(16 * Math.pow(Math.sin(t), 3) / 5, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 5)); }
      const geo = new T.ExtrudeGeometry(new T.Shape(pts), { depth: 1.6, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 1, curveSegments: 3 });
      geo.center();
      heart = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xc41e3a, flatShading: true, metalness: 0.25, roughness: 0.45 }));
      scene3.add(heart, new T.AmbientLight(0xffb0c0, 0.7));
      const l1 = new T.DirectionalLight(0xffffff, 1.1); l1.position.set(5, 6, 8); const l2 = new T.DirectionalLight(0xff6f91, 0.8); l2.position.set(-6, -3, 4);
      scene3.add(l1, l2); started = true; return true;
    } catch (e) { return false; }
  }
  function loop(t) {
    if (cur !== 6 || !started) return;
    heart.rotation.y += reduce ? 0.002 : 0.012; const s = 1 + Math.sin(t / 300) * 0.04; heart.scale.set(s, s, s);
    renderer.render(scene3, cam); requestAnimationFrame(loop);
  }
  function enterFinal() {
    if (initHeart()) requestAnimationFrame(loop);
    else { const c = $("heart-canvas"); c.outerHTML = '<div class="mascot big" aria-hidden="true">💗</div>'; }
    const c = window.confetti; if (c) c({ particleCount: 60, spread: 120, origin: { y: 0.4 }, colors: ["#e8a5b0", "#a3162b"] });
  }

  const enter = { 1: enterWait, 2: enterReasons, 3: enterLetter, 4: enterAsk, 5: enterYay, 6: enterFinal };

  if (!reduce) {
    const layer = $("hearts-layer");
    for (let i = 0; i < 14; i++) {
      const h = document.createElement("span"); h.className = "heart";
      h.textContent = ["♥", "♡", "✦", "💗"][Math.floor(Math.random() * 4)];
      h.style.left = Math.random() * 100 + "%"; h.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
      h.style.opacity = (0.1 + Math.random() * 0.2).toFixed(2); h.style.animationDuration = 16 + Math.random() * 14 + "s"; h.style.animationDelay = -Math.random() * 20 + "s";
      layer.appendChild(h);
    }
  }
});
