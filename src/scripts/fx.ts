// Yaratıcı efektler (2. tur). motion.ts içinden, yalnızca hareket azaltma kapalıyken çağrılır.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EASE = 'power3.out';

// ============ 1. Su yüzeyi: imleç/dokunuş turkuaz zeminde dalga halkaları bırakır (WebGL) ============
export function water(host: HTMLElement | null) {
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-water';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }
  // Yazılım tabanlı WebGL'de (yavaş) hiç çalıştırma
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  if (/swiftshader|llvmpipe|software/i.test(renderer) && !location.search.includes('gl=1')) { canvas.remove(); return; }

  const MAX = 24;
  const vs = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;
  const fs = `precision highp float;
    varying vec2 vUv;
    uniform float uTime; uniform float uAspect; uniform vec4 uSrc[${MAX}];
    const float LIFE = 2.6; const float SPEED = 0.30; const float DAMP = 1.5; const float FREQ = 46.0;
    void main(){
      vec2 p = vec2(vUv.x * uAspect, vUv.y);
      float light = 0.0; float dark = 0.0;
      for (int i = 0; i < ${MAX}; i++) {
        vec4 s = uSrc[i];
        float age = uTime - s.z;
        if (s.w <= 0.0 || age < 0.0 || age > LIFE) continue;
        float d = length(p - vec2(s.x * uAspect, s.y));
        float r = age * SPEED;
        float w = mix(0.012, 0.04, s.w);
        float ring = exp(-pow((d - r) / w, 2.0));
        float decay = exp(-age * DAMP) * (1.0 - age / LIFE);
        float band = cos((d - r) * FREQ);
        light += ring * decay * max(band, 0.0) * s.w;
        dark  += ring * decay * max(-band, 0.0) * s.w;
      }
      float g = 0.5 + 0.5 * sin(p.x * 6.0 + uTime * 0.35) * cos(p.y * 5.0 - uTime * 0.3);
      float sheen = pow(g, 8.0) * 0.05;
      vec3 white = vec3(1.0); vec3 petrol = vec3(0.024, 0.165, 0.176);
      float a1 = clamp(light * 0.75 + sheen, 0.0, 0.7);
      float a2 = clamp(dark * 0.35, 0.0, 0.4);
      vec3 col = a1 > a2 ? white : petrol;
      gl_FragColor = vec4(col, max(a1, a2));
    }`;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uAspect = gl.getUniformLocation(prog, 'uAspect');
  const uSrc = gl.getUniformLocation(prog, 'uSrc');
  const src = new Float32Array(MAX * 4);
  let idx = 0, lastX = -1, lastY = -1, lastT = 0, visible = true;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const r = host!.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform1f(uAspect, r.width / r.height);
  }
  function add(clientX: number, clientY: number, amp: number) {
    const r = host!.getBoundingClientRect();
    const x = (clientX - r.left) / r.width, y = 1 - (clientY - r.top) / r.height;
    src.set([x, y, now(), amp], idx * 4);
    idx = (idx + 1) % MAX;
  }
  host.addEventListener('pointermove', (e) => {
    const t = performance.now();
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist < 18 || t - lastT < 40) return;
    const speed = dist / Math.max(t - lastT, 16);
    add(e.clientX, e.clientY, Math.min(Math.max(speed / 2.2, 0.18), 1));
    lastX = e.clientX; lastY = e.clientY; lastT = t;
  });
  host.addEventListener('pointerdown', (e) => add(e.clientX, e.clientY, 1));
  // İlk açılışta kendiliğinden birkaç damla: yüzeyin "su" olduğu anlaşılsın
  [[0.72, 0.45, 0.4], [0.84, 0.7, 1.4], [0.6, 0.25, 2.3]].forEach(([x, y, d]) => setTimeout(() => {
    const r = host.getBoundingClientRect();
    add(r.left + x * r.width, r.top + y * r.height, 0.9);
  }, d * 1000));

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  resize();
  gsap.ticker.add(() => {
    if (!visible || document.hidden) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, now());
    gl.uniform4fv(uSrc, src);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
}

// ============ 2. Harfler fareden kaçar (ana başlık) ============
export function repel(h: HTMLElement | null) {
  if (!h) return;
  h.querySelectorAll<HTMLElement>('.wi').forEach((wi) => {
    wi.innerHTML = [...(wi.textContent ?? '')].map((c) => `<span class="ch">${c}</span>`).join('');
  });
  const chars = [...h.querySelectorAll<HTMLElement>('.ch')].map((el) => ({
    el, cx: 0, cy: 0,
    x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
    y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
    r: gsap.quickTo(el, 'rotate', { duration: 0.6, ease: 'elastic.out(1, 0.45)' }),
  }));
  const measure = () => chars.forEach((c) => {
    const b = c.el.getBoundingClientRect();
    c.cx = b.left + b.width / 2; c.cy = b.top + b.height / 2 + window.scrollY;
  });
  const area = h.closest('section') ?? h;
  let ready = false;
  area.addEventListener('pointerenter', () => { measure(); ready = true; });
  window.addEventListener('resize', () => { ready = false; });
  area.addEventListener('pointermove', (e) => {
    if (!h.classList.contains('loose')) return;
    if (!ready) { measure(); ready = true; }
    const R = 150, my = e.clientY + window.scrollY;
    chars.forEach((c) => {
      const dx = c.cx - e.clientX, dy = c.cy - my, d = Math.hypot(dx, dy);
      if (d < R) {
        const f = Math.pow(1 - d / R, 2) * 46;
        c.x((dx / (d || 1)) * f); c.y((dy / (d || 1)) * f); c.r((dx / R) * 18);
      } else { c.x(0); c.y(0); c.r(0); }
    });
  });
  area.addEventListener('pointerleave', () => chars.forEach((c) => { c.x(0); c.y(0); c.r(0); }));
}

// ============ 3. Giriş görseli kaydırdıkça büyüyüp ekranı kaplar ============
export function grow() {
  gsap.utils.toArray<HTMLElement>('[data-grow]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 10%', scrub: 0.8 } });
    tl.fromTo(el, { clipPath: 'inset(0% 8% 0% 8% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0);
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
    // Fotoğraf üstü mesaj: büyük kelimeler alttan, alt satır kelime kelime belirir (kaydırmaya bağlı)
    const msg = el.querySelector<HTMLElement>('[data-hp-msg]');
    if (msg) {
      const big = msg.querySelectorAll('.hp-line > .hp-w');
      const sub = msg.querySelectorAll('.hp-sub .hp-w');
      gsap.set(big, { yPercent: 105, rotate: 4 });
      gsap.set(sub, { opacity: 0, y: 14, filter: 'blur(6px)' });
      const mt = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 45%', scrub: 0.6 } });
      mt.to(big, { yPercent: 0, rotate: 0, stagger: 0.35, duration: 1, ease: 'power3.out' })
        .to(sub, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.15, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    }
  });
}

// ============ 5. Süreç kartları: renkli kartlar, girişte yerine oturur (yana kayma yok) ============
export function horizontal(track: HTMLElement | null) {
  if (!track) return;
  track.classList.add('hscroll');
  const section = track.closest('section')!;
  section.classList.add('hscroll-section');
  // Mert: kaydırma hiçbir yerde "durmuş gibi" hissettirmesin. Kartlar yana kaymaz, yan yana sabit durur.
  // Giriş: kartlar iskambil dağıtır gibi soldan dönerek sırayla açılır.
  const cards = [...track.children] as HTMLElement[];
  // İkonların çizgileri başta gizli
  track.querySelectorAll<SVGGeometryElement>('.step-ic .d').forEach((p) => {
    const len = Math.ceil(p.getTotalLength?.() ?? 200);
    if (!p.classList.contains('dash')) gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    else gsap.set(p, { opacity: 0 });
  });
  gsap.set(track.querySelectorAll('.step-ic .dot, .step-ic .pop, .step-ic .bar, .step-ic .star'), { opacity: 0 });
  gsap.fromTo(cards, { rotateY: -75, y: 50, opacity: 0, transformOrigin: 'left center' }, {
    rotateY: 0, y: 0, opacity: 1, duration: 1, ease: 'back.out(1.3)', stagger: 0.14,
    scrollTrigger: { trigger: track, start: 'top 80%', once: true },
    onComplete: () => { signal(track); tilt(cards); },
  });
}

// Fareyle kartın üstünde gezinince kart hafifçe yöne doğru eğilir ve kalkar
function tilt(cards: HTMLElement[]) {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  cards.forEach((c) => {
    gsap.set(c, { transformPerspective: 900 });
    const rx = gsap.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3' });
    const ty = gsap.quickTo(c, 'y', { duration: 0.5, ease: 'power3' });
    const num = c.querySelector('.step-no');
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 10); rx(-py * 8); ty(-8);
      gsap.to(num, { x: px * 14, y: py * 10, duration: 0.5, overwrite: 'auto' });
    });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); ty(0); gsap.to(num, { x: 0, y: 0, duration: 0.6 }); });
    c.addEventListener('pointerenter', () => drawIcon(c, 0.6));
  });
}

// Bir kartın ikonunu çizerek canlandır
function drawIcon(card: HTMLElement, speed = 1) {
  const ic = card.querySelector('.step-ic');
  if (!ic) return;
  const tl = gsap.timeline();
  ic.querySelectorAll<SVGGeometryElement>('.d').forEach((p, j) => {
    if (p.classList.contains('dash')) tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.5 * speed }, j * 0.08);
    else { const len = Math.ceil(p.getTotalLength?.() ?? 200); tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7 * speed, ease: 'power2.out' }, j * 0.12 * speed); }
  });
  tl.fromTo(ic.querySelectorAll('.bar'), { opacity: 1, scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.6 * speed, ease: 'back.out(1.8)', stagger: 0.1 }, 0.05);
  tl.fromTo(ic.querySelectorAll('.pop'), { opacity: 1, scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45 * speed, ease: 'back.out(3)', stagger: 0.25 }, 0.1);
  tl.fromTo(ic.querySelectorAll('.star'), { opacity: 1, rotate: -120, scale: 0, transformOrigin: '50% 50%' }, { rotate: 0, scale: 1, duration: 0.7 * speed, ease: 'back.out(2)' }, 0.35 * speed);
  // Sohbet noktaları "yazıyor" gibi zıplar
  tl.fromTo(ic.querySelectorAll('.dot'), { opacity: 1, y: 0 }, { y: -4, duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut', stagger: 0.1 }, 0.4 * speed);
}

// Kartlar oturunca turkuaz bir sinyal 1'den 4'e akar; uğradığı kart parlar, numarası zıplar, ikonu çizilir. Bir kez oynar.
function signal(track: HTMLElement) {
  const line = track.parentElement?.querySelector<HTMLElement>('.steps-line');
  const cards = [...track.children] as HTMLElement[];
  const nums = cards.map((c) => c.querySelector('.step-no'));
  const D = 2.2;
  const tl = gsap.timeline();
  if (line && getComputedStyle(line).display !== 'none') {
    tl.fromTo(line, { '--draw': 0 }, { '--draw': 1, duration: D, ease: 'none' }, 0);
    tl.fromTo(line.querySelector('.steps-dot'), { left: '0%', opacity: 1 }, { left: '100%', duration: D, ease: 'none' }, 0);
    tl.to(line.querySelector('.steps-dot'), { scale: 2.2, opacity: 0, duration: 0.5 }, D);
  }
  cards.forEach((c, i) => {
    const t = D * (0.125 + 0.25 * i) - 0.1; // nokta kartın ortasına gelirken
    tl.fromTo(nums[i], { scale: 1 }, { scale: 1.2, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1, transformOrigin: 'left bottom' }, t);
    tl.fromTo(c, { '--glow': 0 }, { '--glow': 1, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
    tl.add(() => drawIcon(c), t);
  });
}

// ============ 6. Dijital "şifre çözme" başlıkları ============
const GLYPHS = 'ABCDEFGHKLMNOPRSTUVYZ';
// Mert: daha hızlı ve düzenli. Harfler soldan sağa çözülür; önde yalnızca 3 harflik dar bir "kod" penceresi,
// geri kalan harfler yerini tutar ama görünmez (genişlik zıplamaz). Glifler her karede değil, 45 ms'de bir değişir.
export function scramble() {
  gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent?.trim() ?? '';
    el.setAttribute('aria-label', text);
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    out.textContent = text;
    el.textContent = '';
    el.appendChild(out);
    const chars = [...text];
    const WIN = 3;
    let running = false;
    const esc = (c: string) => (c === '<' ? '&lt;' : c === '&' ? '&amp;' : c);
    const run = () => {
      if (running) return;
      running = true;
      const o = { p: 0 };
      let last = 0, glyphs: string[] = [];
      gsap.to(o, {
        p: 1, duration: 0.38, ease: 'none',
        onUpdate: () => {
          const now = performance.now();
          if (now - last > 45) { last = now; glyphs = chars.map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]); }
          const done = Math.floor(o.p * (chars.length + WIN)) - WIN;
          out.innerHTML = chars.map((c, i) => {
            if (i < done || c === ' ') return esc(c);
            if (i < done + WIN) return `<span class="sc">${c === c.toLocaleLowerCase("tr") ? glyphs[i].toLowerCase() : glyphs[i]}</span>`;
            return `<span class="sc-rest">${esc(c)}</span>`;
          }).join('');
        },
        onComplete: () => { out.textContent = text; running = false; },
      });
    };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: run });
    el.addEventListener('pointerenter', run);
  });
}

// ============ 7. İmleçten yayılan sinyal halkaları (logodaki yayın sinyali) ============
export function rings() {
  const layer = document.createElement('div');
  layer.className = 'fx-rings';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  let lx = 0, ly = 0, acc = 0, live = 0;
  window.addEventListener('pointermove', (e) => {
    acc += Math.hypot(e.clientX - lx, e.clientY - ly);
    lx = e.clientX; ly = e.clientY;
    if (acc < 90 || live > 6) return;
    acc = 0; live++;
    const r = document.createElement('span');
    r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
    layer.appendChild(r);
    gsap.fromTo(r, { scale: 0.2, opacity: 0.9 }, {
      scale: 1, opacity: 0, duration: 1.1, ease: 'power2.out',
      onComplete: () => { r.remove(); live--; },
    });
  }, { passive: true });
  // Tıklayınca daha büyük çift halka
  window.addEventListener('pointerdown', (e) => {
    [0, 0.12].forEach((d) => {
      const r = document.createElement('span');
      r.className = 'big';
      r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
      layer.appendChild(r);
      gsap.fromTo(r, { scale: 0.1, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.9, delay: d, ease: 'power3.out', onComplete: () => r.remove() });
    });
  });
}

// ============ 8. Hizmet gezgini: üzerine gelince ya da kaydırdıkça sağdaki panel değişir ============
export function explorer(root: HTMLElement | null) {
  if (!root) return;
  root.classList.add('js');
  const items = [...root.querySelectorAll<HTMLElement>('.ex-list > li')];
  const slides = [...root.querySelectorAll<HTMLElement>('.ex-slide')];
  const panel = root.querySelector<HTMLElement>('.ex-panel');
  let active = 0, hovering = false;

  function show(i: number, instant = false) {
    if (i === active && !instant) return;
    const prev = slides[active], next = slides[i];
    items[active].classList.remove('active'); items[active].style.removeProperty('--p');
    items[i].classList.add('active');
    if (prev && next && prev !== next) {
      gsap.killTweensOf(next);
      gsap.to(prev, { opacity: 0, duration: 0.3, onComplete: () => { if (slides[active] === prev) return; prev.classList.remove('active'); gsap.set(prev, { clearProps: 'opacity,visibility' }); } });
      next.classList.add('active');
      gsap.fromTo(next.querySelector('.ex-img'), { clipPath: 'inset(0 0 100% 0 round 10px)' }, { clipPath: 'inset(0 0 0% 0 round 10px)', duration: 0.6, ease: 'expo.out' });
      gsap.fromTo(next.querySelector('img'), { scale: 1.3 }, { scale: 1.06, duration: 1.1, ease: 'expo.out' });
      gsap.fromTo(next.querySelectorAll('.ex-short, .ex-chips li'), { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.04, ease: EASE, delay: 0.05 });
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
    active = i;
  }
  items.forEach((li, i) => {
    const a = li.querySelector('a')!;
    const go = () => { show(i); items[i].style.setProperty('--p', '1'); };
    a.addEventListener('pointerenter', go);
    a.addEventListener('focus', go);
  });
  // Kaydırınca sıradaki hizmete geçer (ekranı tutmaz) + bölüm görünürken kendiliğinden de sırayla değişir.
  // Alttaki çizgi bir sonraki geçişe kalan süreyi gösterir. Üzerine gelince/odakta bekler.
  const AUTO = 1.2; // sn
  let inView = false, scrollIdx = -1;
  const timer = { p: 0 };
  let tw: gsap.core.Tween | null = null;
  function run() {
    tw?.kill();
    if (!inView || hovering) return;
    timer.p = 0;
    tw = gsap.to(timer, {
      p: 1, duration: AUTO, ease: 'none',
      onUpdate: () => items[active].style.setProperty('--p', timer.p.toFixed(3)),
      onComplete: () => { show((active + 1) % items.length); run(); },
    });
  }
  ScrollTrigger.create({
    trigger: root, start: 'top 65%', end: 'bottom 15%',
    onToggle: (st) => { inView = st.isActive; if (inView) run(); else tw?.kill(); },
    onUpdate: (st) => {
      if (hovering) return;
      const i = Math.min(items.length - 1, Math.floor(st.progress * items.length));
      if (i === scrollIdx) return; // aynı dilimdeyken otomatik geçişi bozma
      scrollIdx = i;
      show(i); run();
    },
  });
  // Yalnızca listedeki bir hizmetin üzerindeyken bekler; bölümün geri kalanında geçiş devam eder
  const list = root.querySelector<HTMLElement>('.ex-list');
  list?.addEventListener('pointerover', (e) => { if (!(e.target as HTMLElement).closest('li')) return; hovering = true; tw?.kill(); items[active].style.setProperty('--p', '1'); });
  list?.addEventListener('pointerleave', () => { hovering = false; run(); });
  root.addEventListener('focusin', () => { hovering = true; tw?.kill(); });
  root.addEventListener('focusout', () => { hovering = false; run(); });
  // Panelde imlece göre hafif 3B eğim
  if (panel) {
    const rx = gsap.quickTo(panel, 'rotationY', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(panel, 'rotationX', { duration: 0.6, ease: 'power3' });
    gsap.set(panel, { transformPerspective: 900 });
    panel.parentElement!.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - 0.5) * 8);
      ry(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    root.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

// ============ 9. Kayan galeriler: açılış sütunları + iş şeridi ============
export function heroGallery(root: HTMLElement | null) {
  if (!root) return;
  new IntersectionObserver(([e]) => root.classList.toggle('offscreen', !e.isIntersecting)).observe(root);
}

export function workStrip(root: HTMLElement | null) {
  if (!root) return;
  const sc = root.querySelector<HTMLElement>('[data-ws-scroller]')!;
  const items = sc.querySelectorAll<HTMLElement>('.ws-item');
  const n = items.length / 2;
  let hover = false, inView = false, holdUntil = 0, last = 0, pos = 0;
  const half = () => items[n].offsetLeft - items[0].offsetLeft;
  sc.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
  sc.addEventListener('pointerleave', () => { hover = false; });
  sc.addEventListener('focusin', () => { hover = true; });
  sc.addEventListener('focusout', () => { hover = false; });
  // Elle kaydırınca bir süre bekle, sonra kaldığı yerden devam et
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) => sc.addEventListener(ev, () => { holdUntil = performance.now() + 2500; }, { passive: true }));
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.4 }).observe(root);
  function frame(now: number) {
    const dt = Math.min(now - (last || now), 50); last = now;
    if (!hover && inView && now > holdUntil) {
      if (Math.abs(sc.scrollLeft - pos) > 2) pos = sc.scrollLeft; // kullanıcı kaydırdıysa oradan devam
      pos += dt * 0.045;
      const h = half();
      if (pos >= h) pos -= h;
      sc.scrollLeft = pos;
    } else {
      pos = sc.scrollLeft;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
