/* ============================================================
   Vakratunda Developers — "Projects" transitional section
   Scroll choreography (GSAP 3 + ScrollTrigger)
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     CONFIG — the knobs an integrator is expected to touch
     ------------------------------------------------------------ */
  var CONFIG = {
    counterFrom: 1,     // rail counter at section entry  (reference site: 77)
    counterTo: 14,      // rail counter at section exit   (reference site: 83)
    counterPad: 2,      // zero-padding width, e.g. 2 -> "01"
    scrollLength: 3.2,  // pin duration, in viewport-heights of scroll
    scrub: 0.9          // seconds of scrub smoothing (0 = hard-linked)
  };

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Fallback: no GSAP (CDN blocked) or reduced motion — rest in the
     final merged state, which styles.css defines for .static-motion. */
  if (reduceMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    docEl.classList.add("static-motion");
    var staticCounter = document.querySelector("[data-counter]");
    if (staticCounter) staticCounter.textContent = pad(CONFIG.counterTo, CONFIG.counterPad);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var stage = document.querySelector(".stage");
  var counterEl = document.querySelector("[data-counter]");
  var counterProxy = { value: CONFIG.counterFrom };

  function pad(n, width) {
    var s = String(Math.round(n));
    while (s.length < width) s = "0" + s;
    return s;
  }

  /* ------------------------------------------------------------
     Timeline. One scrubbed timeline, five beats:

       0.00 – 0.38  the seam closes; panes settle out of their
                    vertical offsets (subtle inter-pane parallax)
       0.30 – 0.64  the merged frame expands to full bleed
       0.46 – 0.78  the wordmark reveals: overscaled -> pinned
       0.42 – 0.72  boughs drift down and out (slower than scroll)
       0.86 – 1.00  departure: image eases up + veil, handing the
                    viewport to the next section
     ------------------------------------------------------------ */

  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".transition",
      start: "top top",
      end: "+=" + CONFIG.scrollLength * 100 + "%",
      pin: ".stage",
      scrub: CONFIG.scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  /* Beat 1 — the seam closes */
  tl.to(docEl, {
    "--gap": "0vw",
    duration: 0.38,
    ease: "power2.inOut"
  }, 0);

  tl.fromTo(".pane--left",  { y: "4.5vh" }, { y: 0, duration: 0.42, ease: "power2.inOut" }, 0);
  tl.fromTo(".pane--right", { y: "-4.5vh" }, { y: 0, duration: 0.42, ease: "power2.inOut" }, 0);

  /* inner zoom settles as the panes meet */
  tl.fromTo(".pane img",
    { scale: 1.14, transformOrigin: "50% 42%" },
    { scale: 1.04, duration: 0.6, ease: "power1.out" },
  0);

  /* Beat 2 — frame expands to full bleed */
  tl.to(docEl, {
    "--fx": "0vw",
    "--ft": "0vh",
    "--fb": "0vh",
    duration: 0.34,
    ease: "power2.inOut"
  }, 0.30);

  /* Chrome flips to paper-white as the image reaches the rail and corners */
  tl.to([".chrome", ".rail"], {
    color: "#f8f6ef",
    duration: 0.12,
    ease: "none"
  }, 0.40);

  /* Beat 3 — wordmark reveal (starts once the frame has taken the edges,
     so no stray white glyph fragments land on paper) */
  tl.fromTo(".wordmark-inner",
    { opacity: 0, scale: 1.9, y: "14vh" },
    { opacity: 1, scale: 1, y: 0, duration: 0.26, ease: "power2.out" },
  0.54);

  /* Beat 4 — boughs exit with a lag (parallax: slower than scroll) */
  tl.to(".bough--left", {
    y: "30vh",
    x: "-6vw",
    rotation: -5,
    opacity: 0,
    duration: 0.30,
    ease: "power1.in"
  }, 0.42);

  tl.to(".bough--right", {
    y: "34vh",
    x: "5vw",
    rotation: 4,
    opacity: 0,
    duration: 0.30,
    ease: "power1.in"
  }, 0.46);

  /* gentle idle drift while the boughs are on stage */
  tl.fromTo(".bough--left",  { yPercent: 6 },  { yPercent: 0, duration: 0.42, ease: "none" }, 0);
  tl.fromTo(".bough--right", { yPercent: -4 }, { yPercent: 0, duration: 0.46, ease: "none" }, 0);

  /* Beat 5 — departure */
  tl.to(".pane img", { scale: 1.12, duration: 0.14, ease: "power1.in" }, 0.86);
  tl.to(".frame-veil", { opacity: 0.28, duration: 0.14, ease: "power1.in" }, 0.86);
  tl.to([".wordmark-inner", ".frame"], {
    y: "-7vh",
    duration: 0.14,
    ease: "power1.in"
  }, 0.86);

  /* Rail — progress + counter run the whole section */
  tl.to(".rail-fill", { scaleY: 1, duration: 1, ease: "none" }, 0);

  tl.to(counterProxy, {
    value: CONFIG.counterTo,
    duration: 1,
    ease: "none",
    onUpdate: function () {
      counterEl.textContent = pad(counterProxy.value, CONFIG.counterPad);
    }
  }, 0);

  /* Fade the scroll cue once the visitor commits */
  tl.to(".rail-scroll", { opacity: 0, duration: 0.1, ease: "none" }, 0.1);

  counterEl.textContent = pad(CONFIG.counterFrom, CONFIG.counterPad);

  /* Keep pin measurements honest across orientation changes */
  window.addEventListener("orientationchange", function () {
    ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------
     QA hook: ?p=0.55 freezes the choreography at that progress
     (used for visual regression captures; harmless in production)
     ------------------------------------------------------------ */
  var frozen = new URLSearchParams(window.location.search).get("p");
  if (frozen !== null) {
    var p = Math.min(1, Math.max(0, parseFloat(frozen) || 0));
    tl.scrollTrigger.kill();
    var lead = document.querySelector(".lead");
    if (lead) lead.style.display = "none";
    tl.pause().progress(p);
  }
})();
