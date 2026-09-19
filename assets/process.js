/* Silkstone · process drawings. Single-line machine illustrations that draw themselves
   as they enter the viewport, with a thread that runs from one stage to the next. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stages = document.querySelectorAll('.pstage');
  if (!stages.length) return;

  /* Traced drawings live in assets/draw and are fetched, so the page stays light.
     Reveal: the outline is drawn by many pens at once (one dash per segment of the
     path), then the ink fills in. Small hand-drawn strokes still draw end to end. */
  var SEGS = 36;
  function prepare(el) {
    var len = 0; try { len = el.getTotalLength(); } catch (e) { len = 400; }
    var traced = !!el.closest('.traced');
    if (traced) { var seg = len / SEGS; el.style.strokeDasharray = seg + ' ' + seg; el.style.strokeDashoffset = reduce ? 0 : seg; el.dataset.seg = seg; }
    else { el.style.strokeDasharray = len; el.style.strokeDashoffset = reduce ? 0 : len; }
    el.dataset.len = len;
  }
  function reveal(st) {
    var strokes = st.querySelectorAll('[data-len]');
    var t = 0, longest = 0;
    strokes.forEach(function (el) {
      var traced = !!el.closest('.traced'); var len = parseFloat(el.dataset.len);
      var dur = traced ? 2.6 : Math.min(1.4, 0.35 + len / 900);
      el.style.transition = 'stroke-dashoffset ' + dur + 's cubic-bezier(.4,0,.2,1) ' + t.toFixed(2) + 's';
      el.style.strokeDashoffset = 0;
      longest = Math.max(longest, t + dur);
      if (!traced) t += dur * 0.55;
    });
    setTimeout(function () { st.classList.add('text'); }, 600);
    setTimeout(function () { st.classList.add('drawn'); }, Math.max(300, longest * 1000 - 200));
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var st = e.target.closest('.pstage') || e.target;
      if (reduce) { st.classList.add('drawn'); return; }
      reveal(st);
    });
  }, { threshold: 0.35 });
  function ready(st) {
    st.querySelectorAll('svg path, svg circle, svg line, svg polyline, svg rect').forEach(prepare);
    var fig = st.querySelector('figure') || st;
    if (reduce) { st.classList.add('drawn'); return; }
    io.observe(fig);
  }
  stages.forEach(function (st) {
    var lazy = st.querySelectorAll('svg[data-draw]');
    if (!lazy.length) { ready(st); return; }
    var waiting = lazy.length;
    lazy.forEach(function (svg) {
      fetch(svg.dataset.draw).then(function (r) { return r.text(); }).then(function (txt) {
        var m = txt.match(/<path[^>]*?\/?>/); if (m) svg.innerHTML = m[0].replace(/\/?>$/, '/>');
      }).catch(function () {}).then(function () { if (--waiting === 0) ready(st); });
    });
  });

  /* the thread between stages */
  var thread = document.querySelector('.pthread');
  if (thread) {
    var path = thread.querySelector('path');
    var list = document.querySelector('.pstages');
    function build() {
      var r = list.getBoundingClientRect();
      var pts = Array.prototype.map.call(stages, function (s) {
        var a = s.querySelector('figure').getBoundingClientRect();
        return { x: a.left + a.width / 2 - r.left, top: a.top - r.top + 8, bottom: a.bottom - r.top - 8 };
      });
      thread.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
      thread.style.width = r.width + 'px'; thread.style.height = r.height + 'px';
      var d = '';
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], my = (a.bottom + b.top) / 2;
        d += 'M ' + a.x + ' ' + a.bottom + ' C ' + a.x + ' ' + my + ', ' + b.x + ' ' + my + ', ' + b.x + ' ' + b.top + ' ';
      }
      path.setAttribute('d', d);
      var len = path.getTotalLength(); path.style.strokeDasharray = len; path.dataset.len = len; update();
    }
    function update() {
      var r = list.getBoundingClientRect(), vh = innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      var len = parseFloat(path.dataset.len || 0);
      path.style.strokeDashoffset = len * (1 - p);
    }
    var raf = null;
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
    addEventListener('resize', build);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
    setTimeout(build, 500);
  }

  /* needle in the margin: travels with scroll, thread drawn behind it */
  var nr = document.querySelector('.needle-rail');
  if (nr && !reduce) {
    var needle = nr.querySelector('.needle'), thr = nr.querySelector('.needle-thread path');
    thr.style.strokeDasharray = '3 4'; 
    var mask = nr.querySelector('.needle-thread');
    function moveNeedle() {
      var max = document.documentElement.scrollHeight - innerHeight; var p = max > 0 ? scrollY / max : 0;
      var y = p * (innerHeight - 80) + 10; needle.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
      mask.style.clipPath = 'inset(0 0 ' + (100 - p * 100).toFixed(2) + '% 0)';
    }
    addEventListener('scroll', function () { requestAnimationFrame(moveNeedle); }, { passive: true }); moveNeedle();
  }

  /* floor plan: hover or focus a department to highlight and describe */
  var plan = document.querySelector('.plan');
  if (plan) {
    var rooms = plan.querySelectorAll('[data-room]'), notes = document.querySelectorAll('.plan-note');
    function on(id) {
      rooms.forEach(function (r) { r.classList.toggle('on', r.dataset.room === id); });
      notes.forEach(function (n) { n.classList.toggle('on', n.dataset.room === id); });
    }
    rooms.forEach(function (r) {
      r.addEventListener('mouseenter', function () { on(r.dataset.room); });
      r.addEventListener('focus', function () { on(r.dataset.room); });
      r.addEventListener('click', function () { on(r.dataset.room); });
    });
    on('sewing');
  }
})();
