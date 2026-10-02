/* STE Cinematics — interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Overlays: letterbox bars, film grain, scroll bar, cursor light */
  const add = cls => { const d = document.createElement("div"); d.className = cls; document.body.appendChild(d); return d; };
  add("bar top"); add("bar bottom"); add("grain");
  const progress = add("progress");
  const glow = add("cursor-glow");

  /* Open the "curtains" once loaded; close them when changing pages */
  const open = () => { document.body.classList.remove("leaving"); requestAnimationFrame(() => document.body.classList.add("ready")); };
  addEventListener("load", () => setTimeout(open, 150));
  addEventListener("pageshow", e => { if (e.persisted) open(); });
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 480);
  });

  /* Hide missing thumbnails so the dark placeholder shows */
  $$(".reel-thumbnail img").forEach(img => img.addEventListener("error", () => (img.style.display = "none")));

  /* Mobile menu */
  const toggle = $(".menu-toggle"), links = $(".nav-links");
  toggle.addEventListener("click", () => { toggle.classList.toggle("open"); links.classList.toggle("open"); });
  links.addEventListener("click", () => { toggle.classList.remove("open"); links.classList.remove("open"); });

  /* Scroll: header, progress bar, hero parallax */
  const header = $("header"), hero = $("#home") || $(".portfolio-hero");
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("solid", y > 40);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (hero && !reduce && y < innerHeight * 1.2) hero.style.setProperty("--py", `${y * 0.25}px`);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Cursor light */
  addEventListener("mousemove", e => { glow.style.opacity = 1; glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  document.addEventListener("mouseleave", () => (glow.style.opacity = 0));

  /* Spotlight on service cards */
  $$(".service-card").forEach(c => c.addEventListener("mousemove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  /* 3D tilt on reel cards */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    $$(".reel-card").forEach(c => {
      c.addEventListener("mousemove", e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
      });
      c.addEventListener("mouseleave", () => (c.style.transform = ""));
    });
  }

  /* Reveal on scroll */
  const targets = $$(".section-label, #about h2, .about-text, .about-stats, .service-card, .work-category, #contact > *, .portfolio-content > *, .reel-card, .portfolio-cta > *");
  targets.forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (i % 3) * 90 + "ms"; });
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  targets.forEach(t => io.observe(t));

  /* Count-up for the "21" stat */
  const stat = $(".about-stats strong");
  if (stat && !reduce) {
    const end = parseInt(stat.textContent, 10);
    if (!isNaN(end)) new IntersectionObserver((es, o) => es.forEach(en => {
      if (!en.isIntersecting) return;
      const t0 = performance.now();
      const step = t => { const p = Math.min((t - t0) / 1400, 1); stat.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); o.disconnect();
    }), { threshold: 0.6 }).observe(stat);
  }

  /* Active nav link on the home page */
  const secs = $$("section[id]");
  if (secs.length) {
    const spy = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(s => spy.observe(s));
  }
})();
