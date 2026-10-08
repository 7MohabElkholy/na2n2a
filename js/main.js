/* نأنأه — interactions
   - reveal-on-scroll (respects prefers-reduced-motion)
   - journey path draws itself with scroll
   - tap-to-play videos (one at a time, audio on)
   - gallery lightbox
*/
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── reveal ── */
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ── journey path progress ── */
  var journey = document.querySelector(".journey");
  var path = document.querySelector(".path");
  if (journey && path) {
    var ticking = false;
    var draw = function () {
      var r = journey.getBoundingClientRect();
      var mid = window.innerHeight * 0.62;
      var p = (mid - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      path.style.setProperty("--p", p.toFixed(4));
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    draw();
  }

  /* ── videos: tap to play with sound, one at a time ── */
  var videos = Array.prototype.slice.call(document.querySelectorAll("video"));
  var stopAll = function (except) {
    videos.forEach(function (v) {
      if (v !== except && !v.paused) {
        v.pause();
        var box = v.closest(".reel__item, .shot--video");
        if (box) box.classList.remove("is-playing");
      }
    });
  };
  videos.forEach(function (v) {
    var box = v.closest(".reel__item, .shot--video");
    var toggle = function () {
      if (v.paused) {
        stopAll(v);
        v.muted = false;
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () { v.muted = true; v.play().catch(function () {}); });
        if (box) box.classList.add("is-playing");
      } else {
        v.pause();
        if (box) box.classList.remove("is-playing");
      }
    };
    v.addEventListener("click", toggle);
    if (box) {
      var btn = box.querySelector(".play");
      if (btn) btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    }
    v.addEventListener("pause", function () { if (box) box.classList.remove("is-playing"); });
  });

  /* ── lightbox ── */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbClose = lb.querySelector(".lightbox__close");
    var lastFocus = null;

    var open = function (src, alt) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || "";
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lbClose.focus();
    };
    var close = function () {
      lb.hidden = true;
      lbImg.src = "";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll(".album__cell").forEach(function (cell) {
      cell.addEventListener("click", function () {
        var img = cell.querySelector("img");
        open(cell.dataset.full || img.src, img.alt);
      });
    });
    lbClose.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hidden) close();
    });
  }
})();
