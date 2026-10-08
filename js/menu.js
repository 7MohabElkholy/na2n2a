/* المنيو — search filter + tab scroll-spy */
(function () {
  "use strict";

  var main = document.getElementById("menu-main");
  var input = document.getElementById("q");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".m-group"));

  /* ── arabic-tolerant normalize ── */
  var norm = function (s) {
    return s
      .toLowerCase()
      .replace(/[\u064B-\u0652\u0640]/g, "")   /* tashkeel + tatweel */
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  };

  if (input && main) {
    var items = Array.prototype.slice.call(main.querySelectorAll(".m-list li"));

    input.addEventListener("input", function () {
      var q = norm(input.value);
      var anyVisible = false;

      items.forEach(function (li) {
        var hit = q === "" || norm(li.textContent).indexOf(q) !== -1;
        li.hidden = !hit;
        if (hit) anyVisible = true;
      });

      groups.forEach(function (g) {
        var h3s = Array.prototype.slice.call(g.querySelectorAll("h3"));
        var groupHit = false;
        g.querySelector("h2").hidden = false;
        h3s.forEach(function (h) {
          var list = h.nextElementSibling;
          var visible = Array.prototype.slice.call(list.children)
            .some(function (li) { return !li.hidden; });
          h.hidden = !visible;
          list.hidden = !visible;
          if (visible) groupHit = true;
        });
        g.hidden = !groupHit;
        if (groupHit) anyVisible = true;
      });

      main.classList.toggle("is-empty", !anyVisible);
    });
  }

  /* ── scroll-spy for the category tabs ── */
  if ("IntersectionObserver" in window && tabs.length && groups.length) {
    var setActive = function (id) {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t.dataset.tab === id);
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    groups.forEach(function (g) { spy.observe(g); });

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { setActive(t.dataset.tab); });
    });
  }
})();
