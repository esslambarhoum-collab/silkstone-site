/* Silkstone Fashion · shared script: loader, nav, reveal, stitched process, wardrobe, contact, map */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Loader: the hanger draws itself once per session */
  var loader = document.querySelector('.loader');
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem('silkstone_seen') === '1'; } catch (e) {}
    if (seen || reduce) { loader.remove(); }
    else {
      requestAnimationFrame(function () { loader.classList.add('go'); });
      setTimeout(function () { loader.classList.add('done'); }, 1250);
      setTimeout(function () { if (loader.parentNode) loader.remove(); }, 2100);
      try { sessionStorage.setItem('silkstone_seen', '1'); } catch (e) {}
    }
  }

  /* Nav */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('on');
  });

  /* Reveal */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }


  /* Expanding fill: the black blooms from where the pointer entered */
  document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('pointerenter', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--fx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); b.style.setProperty('--fy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  });

  /* Digit pop-in for figures */
  document.querySelectorAll('.pop[data-count]').forEach(function (el) {
    var txt = el.textContent; el.textContent = ''; el.classList.add('t-digit-group');
    txt.split('').forEach(function (ch, i) { var d = document.createElement('span'); d.className = 't-digit'; d.textContent = ch; d.style.setProperty('--i', i); el.appendChild(d); });
  });
  var pops = document.querySelectorAll('.t-digit-group');
  if (pops.length && 'IntersectionObserver' in window) { var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-animating'); pio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' }); pops.forEach(function (p) { pio.observe(p); }); }

  /* Count-up figures (data-count) */
  var counters=document.querySelectorAll('[data-count]:not(.pop)');
  if(counters.length){
    var fmt=function(n){return n.toLocaleString('en-GB');};
    var run=function(el){ if(el.dataset.done) return; el.dataset.done='1'; var end=parseInt(el.dataset.count,10); if(reduce||!end){el.textContent=fmt(end);return;} var t0=null,dur=1400; var step=function(t){ if(!t0)t0=t; var p=Math.min(1,(t-t0)/dur); p=1-Math.pow(1-p,3); el.textContent=fmt(Math.round(end*p)); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    if('IntersectionObserver' in window){ var cio=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ run(e.target); cio.unobserve(e.target);} });},{rootMargin:'0px 0px -10% 0px'}); counters.forEach(function(c){cio.observe(c);}); }
    else counters.forEach(run);
  }

  /* Stitched process line */
  var proc = document.querySelector('.stages');
  if (proc) {
    var svg = proc.querySelector('.stitch'), base = svg.querySelector('.base'), thread = svg.querySelector('.thread'), needle = svg.querySelector('.needle');
    var stages = Array.prototype.slice.call(proc.querySelectorAll('.stage'));
    var total = 0, pts = [];
    function build() {
      var vertical = window.matchMedia('(max-width: 980px)').matches;
      var pr = proc.getBoundingClientRect();
      pts = stages.map(function (s) {
        var d = s.querySelector('.dot').getBoundingClientRect();
        return { x: d.left + d.width / 2 - pr.left, y: d.top + d.height / 2 - pr.top };
      });
      var w = pr.width, h = pr.height;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.style.width = w + 'px'; svg.style.height = h + 'px';
      var d = 'M ' + pts[0].x + ' ' + pts[0].y;
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        if (vertical) { d += ' C ' + (a.x + 18) + ' ' + (a.y + (b.y - a.y) * .35) + ', ' + (b.x + 18) + ' ' + (a.y + (b.y - a.y) * .65) + ', ' + b.x + ' ' + b.y; }
        else { d += ' C ' + (a.x + (b.x - a.x) * .5) + ' ' + (a.y - 14) + ', ' + (a.x + (b.x - a.x) * .5) + ' ' + (b.y + 14) + ', ' + b.x + ' ' + b.y; }
      }
      base.setAttribute('d', d); thread.setAttribute('d', d);
      total = thread.getTotalLength();
      thread.style.strokeDasharray = '5 5';
      thread.style.strokeDashoffset = '0';
      // draw via a mask-like trick: use a second dasharray segment equal to total
      thread.setAttribute('pathLength', '1000');
      thread.style.strokeDasharray = '0 1000';
      update();
    }
    var progress = 0;
    function update() {
      var r = proc.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.78 - r.top) / (r.height + vh * 0.2);
      p = Math.max(0, Math.min(1, p));
      if (reduce) p = 1;
      progress = p;
      // stitched look: dash pattern limited to the drawn length using pathLength=1000 units
      var drawn = 1000 * p;
      // build a dasharray of 5-on 5-off repeated until "drawn", then a gap covering the rest
      var seg = [], acc = 0, unit = 1000 / Math.max(total, 1) * 6; // about 6px stitches
      while (acc < drawn) { seg.push(Math.min(unit, drawn - acc)); acc += unit; seg.push(unit); acc += unit; }
      if (seg.length % 2 === 1) seg.push(0);
      seg.push(0); seg.push(1000);
      thread.style.strokeDasharray = seg.join(' ');
      var pt = thread.getPointAtLength(total * p);
      var ahead = thread.getPointAtLength(Math.min(total, total * p + 14));
      var ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x);
      needle.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ') rotate(' + (ang * 180 / Math.PI) + ')');
      needle.style.opacity = p > 0.01 && p < 0.995 ? 1 : 0;
      stages.forEach(function (s, i) {
        var sp = pts.length > 1 ? (i / (pts.length - 1)) : 0;
        s.classList.toggle('on', p >= sp - 0.02);
      });
    }
    var raf = null;
    function req() { if (raf) return; raf = requestAnimationFrame(function () { raf = null; update(); }); }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { build(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
    setTimeout(build, 600);
  }

  /* Wardrobe */
  var wardrobe = document.querySelector('.wardrobe');
  if (wardrobe) {
    var wall = wardrobe.querySelector('.wall');
    var hangers = wall.querySelectorAll('.hanger');
    var items = wardrobe.querySelectorAll('.item');
    var current = null;
    function show(key) {
      if (key === current) return;
      hangers.forEach(function (h) {
        if (h.dataset.key === current) { h.classList.remove('in'); h.classList.add('out'); }
      });
      hangers.forEach(function (h) {
        if (h.dataset.key === key) {
          h.classList.remove('out'); void h.offsetWidth; h.classList.add('in');
        }
      });
      setTimeout(function () { hangers.forEach(function (h) { if (h.dataset.key !== key) { h.classList.remove('out'); } }); }, 1300);
      items.forEach(function (it) { it.hidden = it.dataset.key !== key; });
      wardrobe.querySelectorAll('.rail button').forEach(function (b) { b.classList.toggle('on', b.dataset.key === key); });
      wall.classList.add('has');
      current = key;
      try { history.replaceState(null, '', '#' + key); } catch (e) {}
    }
    wardrobe.querySelectorAll('.rail button').forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.key); });
    });
    wardrobe.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = b.closest('.item');
        item.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
        item.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === b.dataset.pane); });
      });
    });
    wardrobe.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var list = [];
        try { list = JSON.parse(localStorage.getItem('silkstone_tp') || '[]'); } catch (e) {}
        if (list.indexOf(b.dataset.add) < 0) list.push(b.dataset.add);
        try { localStorage.setItem('silkstone_tp', JSON.stringify(list)); } catch (e) {}
        b.textContent = 'Added. Open tech pack';
        b.setAttribute('href', 'techpack.html?garment=' + b.dataset.add);
      });
    });
    items.forEach(function (it) { it.hidden = true; });
    var initial = (location.hash || '').replace('#', '');
    if (initial && wall.querySelector('.hanger[data-key="' + initial + '"]')) setTimeout(function () { show(initial); }, 400);
  }

  /* Department tabs (traced order) */
  var dept = document.querySelector('.dept');
  if (dept) {
    dept.querySelectorAll('.dept-nav button').forEach(function (b) {
      b.addEventListener('click', function () {
        dept.querySelectorAll('.dept-nav button').forEach(function (x) { x.classList.toggle('on', x === b); });
        dept.querySelectorAll('.dept-pane').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === b.dataset.pane); });
      });
    });
  }

  /* Contact: one question at a time */
  var convo = document.querySelector('.convo');
  if (convo) {
    var qs = Array.prototype.slice.call(convo.querySelectorAll('.q'));
    var bar = convo.querySelector('.progress i');
    var answers = {};
    var idx = 0;
    function go(i) {
      idx = Math.max(0, Math.min(qs.length - 1, i));
      qs.forEach(function (q, k) { var on = k === idx; if (on && !q.classList.contains('on')) { q.classList.add('enter'); setTimeout(function () { q.classList.remove('enter'); }, 500); } q.classList.toggle('on', on); });
      if (bar) bar.style.transform = 'scaleX(' + ((idx) / (qs.length - 1)).toFixed(3) + ')';
      var f = qs[idx].querySelector('.field'); if (f) setTimeout(function () { f.focus(); }, 50);
      if (qs[idx].dataset.q === 'summary') renderSummary();
    }
    function collect(q) {
      var key = q.dataset.q;
      var on = q.querySelector('.choices button.on');
      if (on) { answers[key] = on.dataset.v || on.textContent.trim(); return true; }
      var f = q.querySelector('.field');
      if (f) {
        if (f.required && !f.value.trim()) { f.focus(); f.classList.add('t-shake'); setTimeout(function () { f.classList.remove('t-shake'); }, 500); return false; }
        answers[key] = f.value.trim(); return true;
      }
      return true;
    }
    convo.querySelectorAll('.choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = b.closest('.q');
        q.querySelectorAll('.choices button').forEach(function (x) { x.classList.toggle('on', x === b); });
        collect(q); setTimeout(function () { go(idx + 1); }, 220);
      });
    });
    convo.querySelectorAll('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () { if (collect(qs[idx])) go(idx + 1); });
    });
    convo.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { go(idx - 1); });
    });
    convo.querySelectorAll('.field').forEach(function (f) {
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' && f.tagName !== 'TEXTAREA') { e.preventDefault(); if (collect(qs[idx])) go(idx + 1); } });
    });
    function renderSummary() {
      var box = convo.querySelector('.summary'); if (!box) return;
      var labels = { need: 'What you need', garment: 'Garment', quantity: 'Quantity', timeline: 'Needed by', name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', notes: 'Notes' };
      box.innerHTML = Object.keys(labels).filter(function (k) { return answers[k]; }).map(function (k) {
        return '<div class="row"><div class="k">' + labels[k] + '</div><div class="v">' + esc(answers[k]) + '</div></div>';
      }).join('');
      var send = convo.querySelector('[data-send]');
      if (send && !send.dataset.wired) { send.dataset.wired = '1'; send.addEventListener('click', function () { send.classList.add('sent'); }); }
      if (send) {
        var body = Object.keys(labels).filter(function (k) { return answers[k]; }).map(function (k) { return labels[k] + ': ' + answers[k]; }).join('\n');
        send.setAttribute('href', 'mailto:info@silkstone-textile.com?subject=' + encodeURIComponent('Enquiry from silkstone-textile.com: ' + (answers.need || '')) + '&body=' + encodeURIComponent(body + '\n\nSent from the Silkstone website.'));
      }
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    go(0);
  }
})();
