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
  });
}

// ============ 5. Süreç: kartlar kaydırdıkça kendiliğinden yana kayar (ekranı tutmaz) ============
export function horizontal(track: HTMLElement | null) {
  if (!track) return;
  track.classList.add('hscroll');
  const section = track.closest('section')!;
  section.classList.add('hscroll-section');
  const dist = () => Math.max(0, track.scrollWidth - track.clientWidth + 40);
  gsap.fromTo(track, { x: () => dist() * 0.15 }, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: track, start: 'top 100%', end: 'top 30%', scrub: 0.3, invalidateOnRefresh: true },
  });
  [...track.children].forEach((card, i) => {
    gsap.fromTo(card, { rotate: i % 2 ? 5 : -5, y: 60 }, {
      rotate: 0, y: 0, ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 100%', end: 'top 45%', scrub: 0.3 },
    });
  });
}

// ============ 6. Dijital "şifre çözme" başlıkları ============
const GLYPHS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789#%&*+=<>/';
export function scramble() {
  gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent?.trim() ?? '';
    el.setAttribute('aria-label', text);
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    out.textContent = text;
    el.textContent = '';
    el.appendChild(out);
    const run = () => {
      const o = { p: 0 };
      gsap.to(o, {
        p: 1, duration: 0.55, ease: 'power1.out',
        onUpdate: () => {
          const done = Math.floor(o.p * text.length);
          out.textContent = [...text].map((c, i) => (i < done || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
        },
        onComplete: () => { out.textContent = text; },
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

// ============ 8. Hizmet gezgini: üzerine gelince sağdaki panel değişir, kendiliğinden de döner ============
export function explorer(root: HTMLElement | null) {
  if (!root) return;
  root.classList.add('js');
  const items = [...root.querySelectorAll<HTMLElement>('.ex-list > li')];
  const slides = [...root.querySelectorAll<HTMLElement>('.ex-slide')];
  const panel = root.querySelector<HTMLElement>('.ex-panel');
  let active = 0, progress: gsap.core.Tween | null = null, hovering = false, inView = false;

  function show(i: number, instant = false) {
    if (i === active && !instant) return;
    const prev = slides[active], next = slides[i];
    items[active].classList.remove('active'); items[active].style.removeProperty('--p');
    items[i].classList.add('active');
    if (prev && next && prev !== next) {
      gsap.to(prev, { opacity: 0, duration: 0.4, onComplete: () => { prev.classList.remove('active'); gsap.set(prev, { clearProps: 'opacity,visibility' }); } });
      next.classList.add('active');
      gsap.fromTo(next.querySelector('.ex-img'), { clipPath: 'inset(0 0 100% 0 round 10px)' }, { clipPath: 'inset(0 0 0% 0 round 10px)', duration: 0.8, ease: 'expo.out' });
      gsap.fromTo(next.querySelector('img'), { scale: 1.3 }, { scale: 1.06, duration: 1.1, ease: 'expo.out' });
      gsap.fromTo(next.querySelectorAll('.ex-short, .ex-chips li'), { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.05, ease: EASE, delay: 0.1 });
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
    active = i;
  }
  function autoplay() {
    progress?.kill();
    if (hovering || !inView) return;
    const o = { p: 0 };
    progress = gsap.to(o, {
      p: 1, duration: 4.5, ease: 'none',
      onUpdate: () => items[active].style.setProperty('--p', o.p.toFixed(3)),
      onComplete: () => { show((active + 1) % items.length); autoplay(); },
    });
  }
  items.forEach((li, i) => {
    const a = li.querySelector('a')!;
    const go = () => { show(i); items[i].style.setProperty('--p', '1'); };
    a.addEventListener('pointerenter', go);
    a.addEventListener('focus', go);
  });
  root.addEventListener('pointerenter', () => { hovering = true; progress?.kill(); items[active].style.setProperty('--p', '1'); });
  root.addEventListener('pointerleave', () => { hovering = false; autoplay(); });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) autoplay(); else progress?.kill(); }, { threshold: 0.35 }).observe(root);
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
