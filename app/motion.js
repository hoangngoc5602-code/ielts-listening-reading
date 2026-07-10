/* ============================================================
   TID — Motion layer (GSAP + ScrollTrigger)
   Plain JS (no JSX). Loaded after the app boots.
   - Reveals [data-reveal] on scroll (staggered)
   - Intro stagger for [data-stagger] > [data-stagger-item]
   - Continuous float for [data-float]
   - Live sound bars for [data-bars] > span
   - Count-up for [data-count]
   Re-runs safely on every route change / DOM swap. Respects
   prefers-reduced-motion. If GSAP is missing, the site still
   works (content stays visible).
   Exposed on window.TID_MOTION
   ============================================================ */
(function () {
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ready = false;

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || 0) && r.bottom > 0;
  }

  function ensure() {
    if (ready) return true;
    if (!window.gsap || !window.ScrollTrigger) return false;
    window.gsap.registerPlugin(window.ScrollTrigger);
    document.documentElement.classList.add("motion-ready");
    ready = true;
    return true;
  }

  function revealAll() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
  }

  function setup() {
    if (!ensure()) return;
    try { setupInner(); }
    catch (e) { revealAll(); if (window.console) console.warn("[motion] disabled:", e && e.message); }
  }

  function setupInner() {
    var gsap = window.gsap, ST = window.ScrollTrigger;

    if (REDUCE) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      return;
    }

    /* ---- Reveal on scroll (only elements not yet handled) ---- */
    var fresh = [];
    document.querySelectorAll("[data-reveal]:not([data-m])").forEach(function (el) {
      el.setAttribute("data-m", "1");
      fresh.push(el);
    });
    if (fresh.length) {
      gsap.set(fresh, { opacity: 0, y: 22 });
      ST.batch(fresh, {
        start: "top 90%",
        once: true,
        onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .6, ease: "power3.out", stagger: .08, overwrite: true }); }
      });
    }

    /* ---- Intro stagger containers ---- */
    document.querySelectorAll("[data-stagger]:not([data-m])").forEach(function (c) {
      c.setAttribute("data-m", "1");
      var items = c.querySelectorAll("[data-stagger-item]");
      if (!items.length) return;
      gsap.from(items, { opacity: 0, y: 26, duration: .7, ease: "power3.out", stagger: .09, delay: .05 });
    });

    /* ---- Continuous float ---- */
    document.querySelectorAll("[data-float]:not([data-m])").forEach(function (el) {
      el.setAttribute("data-m", "1");
      var amp = parseFloat(el.getAttribute("data-float")) || 10;
      gsap.to(el, { y: -amp, duration: 2.4 + Math.random() * 0.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

    /* ---- Live sound bars ---- */
    document.querySelectorAll("[data-bars]:not([data-m])").forEach(function (c) {
      c.setAttribute("data-m", "1");
      c.querySelectorAll("span").forEach(function (bar) {
        gsap.to(bar, { scaleY: 0.35 + Math.random() * 0.65, transformOrigin: "bottom", duration: 0.5 + Math.random() * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: Math.random() * 0.6 });
      });
    });

    /* ---- Count-up numbers ---- */
    document.querySelectorAll("[data-count]:not([data-m])").forEach(function (el) {
      el.setAttribute("data-m", "1");
      var end = parseFloat(el.getAttribute("data-count")) || parseFloat(el.textContent) || 0;
      var obj = { v: 0 };
      ST.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
          gsap.to(obj, { v: end, duration: 1.1, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v); } });
        }
      });
    });

    ST.refresh();

    /* ---- Safety net: never leave visible content hidden ---- */
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        if (getComputedStyle(el).opacity === "0" && inView(el)) {
          gsap.to(el, { opacity: 1, y: 0, duration: .4, overwrite: true });
        }
      });
    }, 1600);
  }

  var t;
  function schedule() { clearTimeout(t); t = setTimeout(setup, 90); }

  /* Observe root for React re-renders + route changes */
  function watch() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(watch, 120); return; }
    schedule();
    var mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true });
    window.addEventListener("hashchange", schedule);
    window.addEventListener("load", function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();

  window.TID_MOTION = { setup: setup, schedule: schedule };
})();
