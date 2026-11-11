/* OCHA PARTY — interactions
   Everything here runs in the visitor's browser. Nothing is sent anywhere. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function calm() { return reduceMotion.matches; }
  function $(id) { return document.getElementById(id); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Falling petals on the landing ---------- */
  function makePetal(container, opts) {
    var p = document.createElement('span');
    p.className = 'petal';
    var size = rand(opts.minSize, opts.maxSize);
    p.style.width = size + 'px';
    p.style.height = size * 1.2 + 'px';
    p.style.left = rand(opts.minX, opts.maxX) + '%';
    if (opts.top != null) p.style.top = opts.top;
    p.style.setProperty('--drift', rand(-60, 70).toFixed(0) + 'px');
    p.style.animationDuration = rand(opts.minDur, opts.maxDur).toFixed(1) + 's';
    p.style.animationDelay = rand(0, opts.maxDelay).toFixed(1) + 's';
    container.appendChild(p);
    return p;
  }

  var fall = document.querySelector('.petal-fall');
  if (fall && !calm()) {
    for (var i = 0; i < 9; i++) {
      makePetal(fall, { minSize: 10, maxSize: 16, minX: 0, maxX: 100, minDur: 11, maxDur: 19, maxDelay: 14 });
    }
  }

  /* ---------- Entering: shoji doors close, then open onto the itinerary ---------- */
  var enterBtn = $('enterBtn');
  var doors = document.querySelector('.doors');
  var itinTitle = $('itin-title');
  var itinerary = $('itinerary');
  var musicBtn = $('musicBtn');
  var entering = false;

  function jumpTo(el) {
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset);
    root.style.scrollBehavior = prev;
  }

  function reveal() {
    root.classList.add('entered');
    if (musicBtn && (window.AudioContext || window.webkitAudioContext)) musicBtn.hidden = false;
  }

  function burstFrom(btn) {
    var r = btn.getBoundingClientRect();
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('span');
      s.className = 'petal';
      s.style.position = 'fixed';
      s.style.left = (r.left + r.width / 2) + 'px';
      s.style.top = (r.top + r.height / 2) + 'px';
      s.style.zIndex = 90;
      s.style.opacity = '1';
      s.style.animation = 'none';
      document.body.appendChild(s);
      var ang = rand(0, Math.PI * 2), dist = rand(50, 120);
      s.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(ang) * dist - 7) + 'px,' + (Math.sin(ang) * dist - 8) + 'px) rotate(' + rand(90, 260) + 'deg)', opacity: 0 }
      ], { duration: rand(700, 1000), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      (function (el) { setTimeout(function () { el.remove(); }, 1100); })(s);
    }
  }

  function enter() {
    if (entering) return;
    entering = true;

    if (calm() || !doors) {
      reveal();
      jumpTo(itinerary);
      itinTitle.focus({ preventScroll: true });
      entering = false;
      return;
    }

    if (enterBtn.animate) burstFrom(enterBtn);
    doors.classList.add('is-active');
    // next frame so the transition runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { doors.classList.add('is-closed'); });
    });

    setTimeout(function () {
      reveal();
      jumpTo(itinerary);
      setTimeout(function () {
        doors.classList.remove('is-closed');
        itinTitle.focus({ preventScroll: true });
        setTimeout(function () {
          doors.classList.remove('is-active');
          entering = false;
        }, 800);
      }, 260);
    }, 820);
  }

  if (enterBtn) enterBtn.addEventListener('click', enter);

  // A link straight to a section (e.g. #itinerary) opens the world directly
  if (location.hash && location.hash.length > 1 && location.hash !== '#top') {
    reveal();
    var target = document.querySelector(location.hash);
    if (target) setTimeout(function () { jumpTo(target); }, 0);
  }

  /* ---------- Itinerary accordion (one open at a time) ---------- */
  var stops = Array.prototype.slice.call(document.querySelectorAll('.stop'));
  stops.forEach(function (stop) {
    var btn = stop.querySelector('.stop-btn');
    btn.addEventListener('click', function () {
      var opening = btn.getAttribute('aria-expanded') !== 'true';
      stops.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.stop-btn').setAttribute('aria-expanded', 'false');
      });
      if (opening) {
        stop.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Find the sakura ---------- */
  (function sakuraGame() {
    var scene = $('scene');
    if (!scene) return;
    var flowers = scene.querySelectorAll('.hs');
    var hits = scene.querySelectorAll('.hits circle');
    var countEl = $('sakuraCount').querySelector('strong');
    var foundAll = $('foundAll');
    var hintBtn = $('hintBtn');
    var magic = $('sceneMagic');
    var total = hits.length;
    var found = {};
    var count = 0;
    var NS = 'http://www.w3.org/2000/svg';

    function flowerFor(i) {
      for (var k = 0; k < flowers.length; k++) if (flowers[k].getAttribute('data-i') === String(i)) return flowers[k];
      return null;
    }

    function discover(hit) {
      var i = hit.getAttribute('data-i');
      if (found[i]) return;
      found[i] = true;
      count++;
      hit.classList.add('is-found');
      hit.setAttribute('aria-label', 'Sakura found');
      hit.setAttribute('tabindex', '-1');
      var f = flowerFor(i);
      if (f) { f.classList.remove('is-hint'); f.classList.add('is-found'); }

      if (!calm()) {
        var ring = document.createElementNS(NS, 'circle');
        ring.setAttribute("cx", hit.getAttribute("cx"));
        ring.setAttribute('cy', hit.getAttribute('cy'));
        ring.setAttribute('r', '12');
        ring.setAttribute('class', 'ripple');
        scene.appendChild(ring);
        setTimeout(function () { ring.remove(); }, 1000);
      }

      countEl.textContent = count;
      if (count === total) celebrate();
    }

    function celebrate() {
      foundAll.hidden = false;
      hintBtn.disabled = true;
      if (calm()) return;
      for (var k = 0; k < 26; k++) {
        var p = makePetal(magic, { minSize: 9, maxSize: 15, minX: 0, maxX: 100, minDur: 3.2, maxDur: 5.5, maxDelay: 1.6, top: '-24px' });
        (function (el) { setTimeout(function () { el.remove(); }, 7500); })(p);
      }
    }

    function reset() {
      found = {}; count = 0; countEl.textContent = '0';
      foundAll.hidden = true;
      hintBtn.disabled = false;
      Array.prototype.forEach.call(flowers, function (f) { f.classList.remove('is-found', 'is-hint'); });
      Array.prototype.forEach.call(hits, function (h) {
        h.classList.remove('is-found');
        h.setAttribute('tabindex', '0');
      });
      var labels = ['near the teacup', 'in the branches', 'by the lantern', 'in the corner', 'in the fence'];
      Array.prototype.forEach.call(hits, function (h) { h.setAttribute('aria-label', 'Hidden sakura ' + labels[+h.getAttribute('data-i')]); });
      magic.innerHTML = '';
    }

    Array.prototype.forEach.call(hits, function (hit) {
      hit.addEventListener('click', function () { discover(hit); });
      hit.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); discover(hit); }
      });
    });

    hintBtn.addEventListener('click', function () {
      var left = [];
      Array.prototype.forEach.call(flowers, function (f) { if (!found[f.getAttribute('data-i')]) left.push(f); });
      if (!left.length) return;
      var f = left[Math.floor(Math.random() * left.length)];
      f.classList.remove('is-hint');
      void f.getBoundingClientRect();
      f.classList.add('is-hint');
      setTimeout(function () { f.classList.remove('is-hint'); }, 3400);
    });

    $('replayBtn').addEventListener('click', reset);
  })();

  /* ---------- Doodle corner (stays in this browser only) ---------- */
  (function doodle() {
    var canvas = $('doodle');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var paper = $('paper');
    var hint = $('paperHint');
    var undoBtn = $('undoBtn');
    var clearBtn = $('clearBtn');
    var BASE = 360;            // brush sizes are relative to a 360px-wide sheet
    var color = '#4f342b';
    var size = 5;
    var strokes = [];          // { c, s, pts: [[x,y],...] } with x,y in 0..1
    var history = [];          // 'stroke' | { clear: [...] }
    var current = null;
    var w = 0, h = 0, dpr = 1;

    function resize() {
      var r = paper.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      redraw();
    }

    function drawStroke(st) {
      var pts = st.pts;
      ctx.strokeStyle = st.c;
      ctx.fillStyle = st.c;
      ctx.lineWidth = st.s * (w / BASE);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0][0] * w, pts[0][1] * h, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
      for (var i = 1; i < pts.length - 1; i++) {
        var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0] * w, pts[i][1] * h, mx * w, my * h);
      }
      var last = pts[pts.length - 1];
      ctx.lineTo(last[0] * w, last[1] * h);
      ctx.stroke();
    }

    function redraw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = .92;
      strokes.forEach(drawStroke);
      if (current) drawStroke(current);
      ctx.globalAlpha = 1;
    }

    function updateButtons() {
      undoBtn.disabled = history.length === 0;
      clearBtn.disabled = strokes.length === 0;
      hint.classList.toggle('is-gone', strokes.length > 0 || !!current);
    }

    function point(e) {
      var r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      current = { c: color, s: size, pts: [point(e)] };
      redraw();
      updateButtons();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!current) return;
      e.preventDefault();
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      if (!evs.length) evs = [e];
      evs.forEach(function (ev) { current.pts.push(point(ev)); });
      redraw();
    });
    function end() {
      if (!current) return;
      strokes.push(current);
      history.push('stroke');
      current = null;
      redraw();
      updateButtons();
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);

    undoBtn.addEventListener('click', function () {
      var last = history.pop();
      if (!last) return;
      if (last === 'stroke') strokes.pop();
      else strokes = last.clear;
      redraw();
      updateButtons();
    });
    clearBtn.addEventListener('click', function () {
      if (!strokes.length) return;
      history.push({ clear: strokes });
      strokes = [];
      redraw();
      updateButtons();
    });

    function radioGroup(selector, onPick) {
      var items = Array.prototype.slice.call(document.querySelectorAll(selector));
      items.forEach(function (item, idx) {
        item.addEventListener('click', function () {
          items.forEach(function (o) { o.setAttribute('aria-checked', 'false'); o.tabIndex = -1; });
          item.setAttribute('aria-checked', 'true');
          item.tabIndex = 0;
          onPick(item);
        });
        item.addEventListener('keydown', function (e) {
          var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var next = items[(idx + d + items.length) % items.length];
          next.focus();
          next.click();
        });
        item.tabIndex = item.getAttribute('aria-checked') === 'true' ? 0 : -1;
      });
    }
    radioGroup('.swatch', function (el) { color = el.getAttribute('data-color'); });
    radioGroup('.size', function (el) { size = +el.getAttribute('data-size'); });

    if (window.ResizeObserver) new ResizeObserver(resize).observe(paper);
    else window.addEventListener('resize', resize);
    // the paper is inside a section that is hidden until the guest enters
    if (enterBtn) enterBtn.addEventListener('click', function () { setTimeout(resize, 900); });
    resize();
    updateButtons();
  })();

  /* ---------- The little rabbit ---------- */
  (function usagi() {
    var box = $('usagi');
    var btn = $('usagiBtn');
    var says = $('usagiSays');
    if (!btn) return;
    var lines = ['Yōkoso! You found me.', 'See you on the 14th!', 'Shh… don’t tell the others I’m here.'];
    var n = 0, timer;
    btn.addEventListener('click', function () {
      says.textContent = lines[n % lines.length];
      n++;
      box.classList.add('is-awake');
      box.classList.remove('is-hop');
      void box.offsetWidth;
      if (!calm()) box.classList.add('is-hop');
      clearTimeout(timer);
      timer = setTimeout(function () {
        box.classList.remove('is-awake', 'is-hop');
      }, 4200);
    });
  })();

  /* ---------- Ambient music, composed live in the browser ----------
     A quiet drone with koto-like plucks in the Japanese "in" scale.
     Starts only when the visitor taps the button. */
  (function ambience() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!musicBtn || !AC) return;
    var ctx, master, dry, wet, timer, playing = false;
    // in-scale on E, voiced around A minor-ish: E F A B C
    var notes = [220.00, 246.94, 261.63, 329.63, 349.23, 440.00, 493.88, 523.25, 659.25];
    var idx = 4;

    function impulse(seconds) {
      var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
      var buf = ctx.createBuffer(2, len, rate);
      for (var ch = 0; ch < 2; ch++) {
        var d = buf.getChannelData(ch);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      return buf;
    }

    function setup() {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      dry = ctx.createGain(); dry.gain.value = .55; dry.connect(master);
      var rev = ctx.createConvolver(); rev.buffer = impulse(3.8);
      wet = ctx.createGain(); wet.gain.value = .5;
      rev.connect(wet); wet.connect(master);
      wet.input = rev;

      // soft drone: A and E, slowly breathing
      var droneLP = ctx.createBiquadFilter(); droneLP.type = 'lowpass'; droneLP.frequency.value = 520;
      var droneGain = ctx.createGain(); droneGain.gain.value = .035;
      droneLP.connect(droneGain); droneGain.connect(master); droneGain.connect(rev);
      [110, 164.81, 220.6].forEach(function (f, k) {
        var o = ctx.createOscillator();
        o.type = k === 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        var g = ctx.createGain(); g.gain.value = k === 2 ? .25 : .6;
        o.connect(g); g.connect(droneLP); o.start();
      });
      var lfo = ctx.createOscillator(); lfo.frequency.value = .06;
      var lfoAmt = ctx.createGain(); lfoAmt.gain.value = .018;
      lfo.connect(lfoAmt); lfoAmt.connect(droneGain.gain); lfo.start();
    }

    function pluck(freq, t, vel) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2.003;
      var g2 = ctx.createGain(); g2.gain.value = .25;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3200, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + .6);
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(vel, t + .008);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      o.connect(lp); o2.connect(g2); g2.connect(lp);
      lp.connect(env); env.connect(dry); env.connect(wet.input);
      o.start(t); o2.start(t); o.stop(t + 3); o2.stop(t + 3);
    }

    function phrase() {
      if (!playing) return;
      var t = ctx.currentTime + .05;
      var n = Math.random() < .25 ? 1 : Math.random() < .6 ? 2 : 3;
      for (var k = 0; k < n; k++) {
        idx = Math.max(0, Math.min(notes.length - 1, idx + (Math.random() < .5 ? -1 : 1) * (Math.random() < .75 ? 1 : 2)));
        pluck(notes[idx], t, rand(.07, .13));
        t += rand(.28, .62);
      }
      timer = setTimeout(phrase, rand(2400, 5600));
    }

    function play() {
      if (!ctx) setup();
      ctx.resume();
      playing = true;
      var now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(.8, now + 2.5);
      clearTimeout(timer);
      timer = setTimeout(phrase, 600);
      musicBtn.setAttribute('aria-pressed', 'true');
      musicBtn.setAttribute('aria-label', 'Pause the ambient music');
    }

    function pause() {
      playing = false;
      clearTimeout(timer);
      musicBtn.setAttribute('aria-pressed', 'false');
      musicBtn.setAttribute('aria-label', 'Play soft ambient music');
      if (!ctx) return;
      var now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + .8);
      setTimeout(function () { if (!playing) ctx.suspend(); }, 900);
    }

    musicBtn.addEventListener('click', function () { playing ? pause() : play(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && playing) pause(); });
  })();
})();
