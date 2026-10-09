gsap.registerPlugin(ScrollTrigger);
document.body.classList.add('loading');
document.getElementById('year').textContent = new Date().getFullYear();

// Lenis smooth scroll synced with GSAP
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); nav.classList.remove('open'); }
}));

const nav = document.getElementById('nav');
document.getElementById('burger').onclick = () => nav.classList.toggle('open');
ScrollTrigger.create({ start: 60, onToggle: s => nav.classList.toggle('scrolled', s.isActive) });

const mm = gsap.matchMedia();
const isMobile = () => window.innerWidth <= 960;

// Loader -> hero intro
const intro = gsap.timeline({ onComplete: () => { document.body.classList.remove('loading'); lenis.start(); } });
intro
  .to('.loader__bar i', { width: '100%', duration: 1, ease: 'power2.inOut' })
  .to('.loader__logo', { y: -20, opacity: 0, duration: .4 }, '-=.1')
  .to('.loader', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.2')
  .from('.hero__phone .iphone', { y: 300, rotateX: 40, rotateY: -30, rotateZ: 15, opacity: 0, duration: 1.6, ease: 'expo.out' }, '-=.5')
  .from('.hero__title .line>span', { yPercent: 110, duration: 1.1, stagger: .1, ease: 'expo.out' }, '<.1')
  .from('.hero__eyebrow, .hero__cta, .nav', { y: 20, opacity: 0, duration: .8, stagger: .08 }, '<.4')
  .from('.hero__stats>div, .scroll-hint', { y: 20, opacity: 0, duration: .8, stagger: .08 }, '<.2')
  .add(() => document.querySelectorAll('[data-count]').forEach(el => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('pt-BR') });
  }), '<');

// Idle float + mouse tilt on hero phone
gsap.to('.hero__phone', { y: '-=14', duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
const hp = document.querySelector('.hero__phone .iphone');
window.addEventListener('mousemove', e => {
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  gsap.to(hp, { rotateY: -18 + x * 24, rotateX: 6 - y * 16, duration: 1.2, ease: 'power3.out' });
  gsap.to('.hero__glow', { x: x * 80, y: y * 80, duration: 2 });
});
gsap.set(hp, { rotateY: -18, rotateX: 6, rotateZ: 0 });

// Hero pinned: phone zooms & spins, text fades
gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=120%', scrub: 1, pin: true } })
  .to('.hero__inner', { y: -120, opacity: 0, ease: 'none' }, 0)
  .to('.hero__stats, .scroll-hint', { opacity: 0 }, 0)
  .to('.hero__phone', { scale: isMobile() ? 1.1 : 1.35, xPercent: isMobile() ? 0 : -60, ease: 'none' }, 0)
  .to('.hero__phone .iphone', { rotateZ: -90, ease: 'none' }, 0)
  .to('.hero__glow', { scale: 1.6, opacity: .4 }, 0)
  .to('.hero__phone', { opacity: 0, scale: 2.2, duration: .35 }, .75);

// Word-by-word reveal
const st = document.getElementById('statement');
st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
gsap.to('#statement .w', { color: '#f5f5f7', stagger: .1, ease: 'none',
  scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });

// Showcase sticky steps
const steps = gsap.utils.toArray('.step'), slides = gsap.utils.toArray('.screen__slide');
const sc = gsap.timeline({ scrollTrigger: { trigger: '.showcase', start: 'top top', end: 'bottom bottom', scrub: 1 } });
sc.from('.showcase__phone .iphone', { rotateY: 25, y: 60, duration: 1 }, 0)
  .to('.showcase__progress i', { scaleX: 1, ease: 'none', duration: steps.length }, 0);
steps.forEach((s, i) => {
  if (!i) return;
  sc.to(steps[i - 1], { opacity: 0, y: -40, duration: .4 }, i)
    .fromTo(s, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .4 }, i + .2)
    .to(slides[i], { opacity: 1, duration: .4 }, i)
    .fromTo(slides[i].children, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .4, stagger: .05 }, i + .1);
});

// Horizontal products scroll (pinned)
mm.add('(min-width: 961px)', () => {
  const track = document.getElementById('track');
  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth),
    ease: 'none',
    scrollTrigger: { trigger: '.products', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), scrub: 1, pin: true, invalidateOnRefresh: true }
  });
});
mm.add('(max-width: 960px)', () => {
  document.querySelector('.products').style.overflowX = 'auto';
});

// Headline split reveals
gsap.utils.toArray('.split').forEach(h => {
  h.innerHTML = h.textContent.split(' ').map(w => `<span class="line" style="display:inline-block"><span>${w}</span></span>`).join(' ');
  gsap.from(h.querySelectorAll('.line>span'), { yPercent: 110, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
});

// Staggered card reveals
['.tile', '.feat', 'blockquote'].forEach(sel => {
  gsap.from(sel, { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: sel, start: 'top 88%' } });
});

// Parallax on device art
gsap.utils.toArray('.macbook,.ipad,.cases,.pods').forEach(el => {
  gsap.fromTo(el, { yPercent: 15 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: el.closest('.tile'), scrub: true } });
});

// CTA scale-in
gsap.from('.cta__title', { scale: .85, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 85%', end: 'center center', scrub: true } });

// Magnetic buttons
document.querySelectorAll('.btn').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4 });
  });
  b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
});
