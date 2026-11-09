// Site geneli hareket sistemi.
// Kural: içerik JS olmadan da tam görünür (SEO/GEO). Gizleme sadece <html class="anim"> varken yapılır,
// bu sınıf da yalnızca hareket azaltma kapalıyken eklenir. Sadece transform / opacity / filter canlandırılır.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as fx from './fx';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
// Hareket tercihi <head> içindeki küçük betikle belirlenir (varsayılan: açık)
const reduce = root.classList.contains('no-motion');
const fine = window.matchMedia('(pointer: fine)').matches;
const EASE = 'power3.out';

// Mert: animasyonlar biraz geç gelsin, öğe ekranın ortasına yaklaşınca başlasın.
const REVEAL_START = 'top 72%';
if (reduce) {
  root.classList.remove('anim');
} else {
  init();
}

function init() {
  // ---------- Yumuşak kaydırma (Lenis, ScrollTrigger ile senkron) ----------
  const lenis = new Lenis({ lerp: 0.16, smoothWheel: true, wheelMultiplier: 1.15, anchors: { offset: -90 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Kaydırma hızı (diğer efektler bunu okur), yumuşatılmış
  const vel = { v: 0, a: 0 };
  lenis.on('scroll', (l: Lenis) => { vel.v = l.velocity; });
  gsap.ticker.add(() => {
    vel.a += (Math.min(Math.abs(vel.v) / 40, 1) - vel.a) * 0.12;
    vel.v *= 0.9;
  });

  splitHeadings();
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (fine) fx.repel(hero?.querySelector('h1') ?? null);
  heroIntro();
  fx.water(hero);
  fx.grow();
  fx.explorer(document.querySelector('[data-explorer]'));
  fx.horizontal(document.querySelector('[data-hscroll]'));
  fx.scramble();
  reveals();
  marquee(vel);
  rgbSplit(vel);
  lines();
  parallax();
  if (fine) { cursor(); servicePreview(); magnetic(); fx.rings(); }
  ScrollTrigger.refresh();
  scrollHint();

  root.classList.add('anim-ready');
}

// ---------- 1. Başlıkları kelimelere böl (maske içinde yükselsin) ----------
function splitHeadings() {
  document.querySelectorAll<HTMLElement>('[data-split], main h1, main h2').forEach((el) => {
    if (el.dataset.splitDone || el.closest('[data-nosplit]') || el.hasAttribute('data-scramble') || el.children.length) return;
    const text = el.textContent?.trim() ?? '';
    if (!text) return;
    el.dataset.splitDone = '1';
    el.setAttribute('aria-label', text);
    el.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`)
      .join(' ');
  });
}

// ---------- 2. Ana sayfa girişi: tek koreografi ----------
function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  document.querySelectorAll<HTMLElement>('main h1').forEach((h1) => {
    const words = h1.querySelectorAll('.wi');
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(words, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 });
    tl.add(() => h1.classList.add('loose'));
    const after = (hero ?? document.querySelector('main'))?.querySelectorAll('[data-intro]');
    if (after?.length) {
      tl.fromTo(after, { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: EASE, stagger: 0.1 }, '-=0.6');
    }
    h1.dataset.animated = '1';
  });
}

// ---------- 3. Kaydırınca açılanlar ----------
function reveals() {
  // Başlıklar (h1 hariç): kelimeler maskeden yükselir
  gsap.utils.toArray<HTMLElement>('main h2[data-split-done], main [data-split][data-split-done]').forEach((h) => {
    if (h.dataset.animated) return;
    gsap.fromTo(h.querySelectorAll(':scope > .w > .wi'), { yPercent: 115 }, {
      yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: h, start: REVEAL_START, once: true },
      onComplete: () => h.style.setProperty('--rev', '1'),
    });
  });
  // Tek öğeler: bulanıktan netleşir
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 28, filter: 'blur(10px)' }, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
    });
  });
  // Gruplar: çocuklar sırayla
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((g) => {
    gsap.fromTo(g.children, { opacity: 0, y: 34, filter: 'blur(8px)' }, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: g, start: REVEAL_START, once: true },
    });
  });
  // Görseller: perde açılır gibi (clip-path) + hafif zoom
  gsap.utils.toArray<HTMLElement>('[data-curtain]').forEach((el) => {
    const img = el.querySelector('img');
    gsap.fromTo(el, { clipPath: 'inset(18% 10% 18% 10% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
    });
    if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: REVEAL_START, once: true } });
  });
}

// ---------- 4. Dev kayan yazı bandı: kaydırma hızıyla hızlanır, yön değiştirir ----------
function marquee(vel: { v: number; a: number }) {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((row) => {
    const track = row.querySelector<HTMLElement>('.mq-track');
    if (!track) return;
    const dir = row.dataset.marquee === 'right' ? 1 : -1;
    let x = 0, boost = 1;
    row.classList.add('js-driven');
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(row);
    gsap.ticker.add((_, dt) => {
      if (!visible) return;
      const half = track.scrollWidth / 2;
      const scrollDir = vel.v === 0 ? 1 : Math.sign(vel.v);
      boost += ((1 + vel.a * 9) - boost) * 0.1;
      x += dir * scrollDir * boost * dt * 0.06;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
    // Kaydırırken eğilir
    gsap.ticker.add(() => {
      if (visible) row.style.setProperty('--skew', `${(-vel.v * 0.12).toFixed(2)}deg`);
    });
  });
}

// ---------- 5. Turkuaz renk ayrışması: hızlı kaydırınca başlık katmanlara ayrılır ----------
function rgbSplit(vel: { v: number; a: number }) {
  const els = gsap.utils.toArray<HTMLElement>('[data-rgb]');
  if (!els.length) return;
  els.forEach((el) => {
    el.classList.add('rgb');
    // Hayaletler başlığın kelime yapısının birebir kopyası (aynı satır kırılımı, animasyonsuz)
    const markup = el.innerHTML.replace(/ style="[^"]*"/g, '');
    ['a', 'b'].forEach((k) => {
      const g = document.createElement('span');
      g.className = `rgb-ghost rgb-${k}`;
      g.setAttribute('aria-hidden', 'true');
      g.innerHTML = markup;
      el.appendChild(g);
    });
  });
  gsap.ticker.add(() => {
    const sep = Math.max(-14, Math.min(14, vel.v * 0.5));
    els.forEach((el) => {
      el.style.setProperty('--sep', `${sep.toFixed(2)}px`);
      el.style.setProperty('--ga', vel.a.toFixed(3));
    });
  });
}

// ---------- 6. Çizgiler kaydırmayla çizilir ----------
function lines() {
  gsap.utils.toArray<HTMLElement>('[data-line]').forEach((el) => {
    gsap.fromTo(el, { '--line': 0 }, {
      '--line': 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 55%', scrub: 0.6 },
    });
  });
  // Süreç numaraları sayarak gelir
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.textContent);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
  });
}

// ---------- 7. Parallax ----------
function parallax() {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amt = Number(el.dataset.parallax || 12);
    gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Büyük başlık kaydırmayla genişler (CTA bandı)
  gsap.utils.toArray<HTMLElement>('[data-stretch]').forEach((el) => {
    gsap.fromTo(el, { '--wdth': 75, letterSpacing: '-0.06em' }, { '--wdth': 100, letterSpacing: '-0.02em', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 40%', scrub: 0.5 } });
  });
}

// ---------- 8. Özel imleç: turkuaz nokta, tıklanabilir öğede büyür ----------
function cursor() {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span class="cursor-label"></span>';
  document.body.appendChild(dot);
  root.classList.add('has-cursor');
  const label = dot.querySelector<HTMLElement>('.cursor-label')!;
  gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
  const xTo = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); gsap.to(dot, { opacity: 1, duration: 0.2, overwrite: 'auto' }); }, { passive: true });
  document.addEventListener('pointerleave', () => gsap.to(dot, { opacity: 0, duration: 0.25 }));
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('a, button, summary, label, input, textarea, [data-cursor]');
    const text = t?.dataset.cursor ?? '';
    label.textContent = text;
    dot.classList.toggle('is-link', !!t);
    dot.classList.toggle('has-label', !!text);
  });
}

// ---------- 9. Hizmet listesi: imleci takip eden görsel önizleme ----------
function servicePreview() {
  document.querySelectorAll<HTMLElement>('[data-preview-list]').forEach((list) => {
    const box = document.createElement('div');
    box.className = 'svc-preview';
    box.setAttribute('aria-hidden', 'true');
    document.body.appendChild(box);
    const imgs = new Map<string, HTMLImageElement>();
    list.querySelectorAll<HTMLElement>('[data-preview]').forEach((item) => {
      const src = item.dataset.preview!;
      if (!imgs.has(src)) { const im = new Image(); im.src = src; im.alt = ''; im.decoding = 'async'; box.appendChild(im); imgs.set(src, im); }
    });
    gsap.set(box, { xPercent: 0, yPercent: -50, scale: 0.6, opacity: 0, rotate: -6, transformOrigin: '0% 50%' });
    const xTo = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
    let lastX = 0, shown = false, current = '';
    const hide = () => { if (!shown) return; shown = false; current = ''; gsap.to(box, { scale: 0.6, opacity: 0, duration: 0.3, ease: EASE, overwrite: 'auto' }); };
    // Kart yalnızca imleç öndeki bir hizmetin üzerindeyken görünür; kaydırma başlayınca hemen kaybolur.
    list.addEventListener('pointermove', (e) => {
      xTo(e.clientX + 56); yTo(e.clientY);
      const item = (e.target as Element).closest<HTMLElement>('[data-preview]');
      const li = item?.closest('li');
      if (!item || (li && list.classList.contains('wheel') && !li.classList.contains('front'))) { hide(); return; }
      const src = item.dataset.preview!;
      if (src !== current) { current = src; imgs.forEach((im, k) => im.classList.toggle('on', k === src)); }
      if (!shown) { shown = true; gsap.to(box, { scale: 1, opacity: 1, duration: 0.45, ease: EASE, overwrite: 'auto' }); }
      gsap.to(box, { rotate: Math.max(-12, Math.min(12, (e.clientX - lastX) * 0.6)), duration: 0.5 });
      lastX = e.clientX;
    });
    window.addEventListener('wheel', hide, { passive: true });
    window.addEventListener('scroll', hide, { passive: true });
    list.addEventListener('pointerleave', hide);
  });
}

// ---------- 10. Mıknatıs butonlar ----------
function magnetic() {
  document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    const yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// ---------- 11. Kaydırma ipucu ----------
function scrollHint() {
  const hint = document.querySelector<HTMLElement>('[data-scroll-hint]');
  if (!hint) return;
  gsap.to(hint.querySelector('svg'), { y: 6, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true });
  ScrollTrigger.create({
    start: 80, onEnter: () => gsap.to(hint, { opacity: 0, y: 10, duration: 0.3 }),
    onLeaveBack: () => gsap.to(hint, { opacity: 1, y: 0, duration: 0.5, ease: EASE }),
  });
}
