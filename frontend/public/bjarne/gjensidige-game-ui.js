/*!
 * Gjensidige spill-UI v2 — animerte målere og merker i three.js (UMD-bygg, r128 eller nyere).
 *
 *   const ui = GjensidigeGameUI(THREE, { palette: { navy: '#060948' } });
 *   const helse = ui.createStatBar(el, { kind: 'health', value: 0.8, interactive: true });
 *   helse.setValue(0.35);
 *   const merke = ui.createBadge(el2, { kind: 'thumbDown' });
 *   merke.pop();
 *
 * Målere: health | frustration | trust | battery
 * Merker: thumbDown | forward | thumbUp | solved | escalation | waiting | repeat | empathy | aha | happy
 */
(function (global) {
  'use strict';

  // #060948 er Gjensidiges mørkeblå. Aksentfargene er spillfarger avledet fra den;
  // bytt dem ut med tokens fra designsystemet via options.palette.
  var DEFAULT_PALETTE = {
    navy: '#060948', plate: '#18217A', slot: '#0A0F4E', outline: '#02031C', white: '#FFFFFF',
    lantern: '#FFC23D', green: '#35D07F', mint: '#8AF5C0', sky: '#4F9DFF', skyLight: '#A6D1FF',
    coral: '#FF5A4D', orange: '#FF8A2A', teal: '#2CC7C4', pink: '#FF7EB6', violet: '#9B6BFF',
    cloud: '#DCE3FF', lime: '#B8F04A', peach: '#FFB38A', lilac: '#C9A8FF', aqua: '#6EE7F0',
    cobalt: '#3D6BFF', barn: '#C63A2E', roof: '#3A3F66', wood: '#C07A3E',
    skin: '#F2B48C', skinShade: '#E0976B', hair: '#5B3A29', coffee: '#5A3418'
  };

  var BAR_KINDS = {
    health: {
      label: 'Helse', icon: 'heart', goodDir: 1,
      stops: [[0, 'coral'], [0.3, 'orange'], [0.55, 'lantern'], [0.8, 'green']],
      danger: function (v) { return v < 0.25; }, dangerStyle: 'heartbeat'
    },
    frustration: {
      label: 'Frustrasjon', icon: 'bolt', goodDir: -1,
      stops: [[0, 'teal'], [0.4, 'lantern'], [0.7, 'orange'], [1, 'coral']],
      danger: function (v) { return v > 0.75; }, dangerStyle: 'jitter'
    },
    trust: {
      label: 'Tillit', icon: 'shield', goodDir: 1,
      stops: [[0, 'coral'], [0.3, 'skyLight'], [0.7, 'sky']],
      danger: function (v) { return v < 0.25; }, dangerStyle: 'heartbeat'
    },
    battery: {
      label: 'Batteri', icon: 'battery', goodDir: 1,
      stops: [[0, 'coral'], [0.25, 'orange'], [0.55, 'lantern'], [0.8, 'green']],
      danger: function (v) { return v < 0.25; }, dangerStyle: 'heartbeat'
    }
  };

  var BADGE_KINDS = {
    thumbDown:  { label: 'Tommel ned',    color: 'coral',    build: 'hand', rz: Math.PI,      mirror: 1,  gesture: 'wag' },
    forward:    { label: 'Rett fram',     color: 'lantern',  build: 'hand', rz: -Math.PI / 2, mirror: -1, gesture: 'poke' },
    thumbUp:    { label: 'Tommel opp',    color: 'green',    build: 'hand', rz: 0,            mirror: 1,  gesture: 'hop' },
    solved:     { label: 'Løst!',         color: 'violet',   build: 'trophy',    gesture: 'spinHop' },
    escalation: { label: 'Eskalering',    color: 'orange',   build: 'cloud',     gesture: 'rumble' },
    waiting:    { label: 'Lang ventetid', color: 'teal',     build: 'hourglass', gesture: 'flip' },
    repeat:     { label: 'Måtte gjenta',  color: 'mint',     build: 'repeat',    gesture: 'loop' },
    empathy:    { label: 'Empati',        color: 'skyLight', build: 'heart',     gesture: 'heartbeat' },
    aha:        { label: 'Aha!',          color: 'sky',      build: 'bulb',      gesture: 'glow' },
    happy:      { label: 'Fornøyd kunde', color: 'pink',     build: 'star',      gesture: 'spinHop' },
    lantern:    { label: 'Lykta',         color: 'lilac',    build: 'lantern',   gesture: 'swing' },
    fast:       { label: 'Lynrask',       color: 'lime',     build: 'stopwatch', gesture: 'dash' },
    detective:  { label: 'Detektiv',      color: 'peach',    build: 'magnifier', gesture: 'search' },
    calm:       { label: 'Rolig hav',     color: 'aqua',     build: 'wave',      gesture: 'calm' },
    streak:     { label: 'På rad',        color: 'cobalt',   build: 'flame',     gesture: 'flicker' },
    bjarne:     { label: 'Bjarne',        color: 'lantern',  build: 'bjarne',    gesture: 'bjarne' },
    countryside:{ label: 'Den må du lenger ut på landet med', color: 'green', build: 'barn', gesture: 'skeptic' }
  };

  var CSS = [
    '.ggui{position:relative;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}',
    '.ggui-canvas{display:block;width:100%;touch-action:none}',
    '.ggui-bar .ggui-canvas{aspect-ratio:4.1/1}',
    '.ggui-bar__head{display:flex;justify-content:space-between;align-items:baseline;gap:1em;padding:0 7% 0 13%;margin-bottom:-0.35em;line-height:1.1}',
    '.ggui-bar__label{font-weight:700}',
    '.ggui-bar__value{font-weight:800;font-variant-numeric:tabular-nums;display:inline-block;transition:transform .15s}',
    '.ggui-bar__value.is-pulse{animation:ggui-num .45s cubic-bezier(.2,1.6,.4,1)}',
    '.ggui-bar.is-interactive .ggui-canvas{cursor:grab}',
    '.ggui-bar.is-dragging .ggui-canvas{cursor:grabbing}',
    '.ggui-badge .ggui-canvas{aspect-ratio:1/1;cursor:pointer}',
    '.ggui-badge__caption{text-align:center;font-weight:700;margin-top:-0.6em}',
    '.ggui:focus-visible{outline:3px solid #FFC23D;outline-offset:4px;border-radius:14px}',
    '.ggui-float{position:absolute;z-index:2;pointer-events:none;font-weight:900;font-size:2em;line-height:1;white-space:nowrap;paint-order:stroke fill;-webkit-text-stroke:6px var(--ggui-stroke,#02031C);transform:translate(-50%,-50%);animation:ggui-float 1.3s cubic-bezier(.2,.8,.2,1) forwards}',
    '@keyframes ggui-float{0%{opacity:0;transform:translate(-50%,-20%) scale(.2) rotate(-8deg)}12%{opacity:1;transform:translate(-50%,-75%) scale(1.45) rotate(4deg)}24%{transform:translate(-50%,-85%) scale(1) rotate(0)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-230%) scale(.9)}}',
    '@keyframes ggui-num{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(1)}}',
    '@keyframes ggui-fade{0%,70%{opacity:1}100%{opacity:0}}',
    '@media (prefers-reduced-motion:reduce){.ggui-float{animation:ggui-fade 1.2s forwards}.ggui-bar__value.is-pulse{animation:none}}'
  ].join('\n');

  function GjensidigeGameUI(THREE, options) {
    options = options || {};
    var P = Object.assign({}, DEFAULT_PALETTE, options.palette || {});
    var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var idle = reduced ? 0 : 1;
    var TAU = Math.PI * 2;

    if (options.injectCSS !== false && !document.getElementById('ggui-styles')) {
      var st = document.createElement('style');
      st.id = 'ggui-styles'; st.textContent = CSS;
      document.head.appendChild(st);
    }

    // Én felles renderer for alle komponenter (kaster feil her hvis WebGL mangler)
    var shared = { r: new THREE.WebGLRenderer({ antialias: true, alpha: true }), w: 1, h: 1 };
    shared.r.setPixelRatio(1);
    shared.r.setClearColor(0x000000, 0);
    shared.r.autoClear = false;
    shared.r.setSize(1, 1, false);

    // ================= Hjelpere =================
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function hex(key) { return P[key] || key; }
    function easeOutBack(k) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
    function easeInOut(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function blip(x, w) { return x < 0 || x > w ? 0 : Math.sin(x / w * Math.PI); }

    function canvasTex(w, h, draw) {
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      return new THREE.CanvasTexture(c);
    }

    var gradientMap = canvasTex(3, 1, function (x) {
      ['#707070', '#b9b9b9', '#ffffff'].forEach(function (c, i) { x.fillStyle = c; x.fillRect(i, 0, 1, 1); });
    });
    gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    var glintTex = canvasTex(64, 64, function (x) {
      var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      x.fillStyle = 'rgba(255,255,255,0.95)'; x.fillRect(30, 2, 4, 60); x.fillRect(2, 30, 60, 4);
    });
    var softTex = canvasTex(64, 64, function (x) {
      var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    });
    var haloTex = canvasTex(512, 128, function (x, w, h) {
      x.shadowColor = '#fff'; x.shadowBlur = 30; x.fillStyle = '#fff';
      var r = 34, px = 40, py = 40, ww = w - 80, hh = h - 80;
      x.beginPath();
      x.moveTo(px + r, py); x.arcTo(px + ww, py, px + ww, py + hh, r); x.arcTo(px + ww, py + hh, px, py + hh, r);
      x.arcTo(px, py + hh, px, py, r); x.arcTo(px, py, px + ww, py, r); x.closePath();
      x.fill(); x.fill();
    });
    function stripeTex() {
      var t = canvasTex(64, 64, function (x) {
        x.fillStyle = '#fff'; x.fillRect(0, 0, 64, 64);
        x.fillStyle = '#c9c9c9';
        for (var k = -64; k < 128; k += 32) {
          x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 14, 0); x.lineTo(k + 14 + 64, 64); x.lineTo(k + 64, 64); x.closePath(); x.fill();
        }
      });
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    function toon(color, extra) {
      return new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(hex(color)), gradientMap: gradientMap }, extra || {}));
    }

    var outlineMats = {};
    function outlineMat(thickness) {
      var key = thickness.toFixed(4);
      if (outlineMats[key]) return outlineMats[key];
      var m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex('outline')), side: THREE.BackSide });
      m.onBeforeCompile = function (shader) {
        shader.uniforms.uOutline = { value: thickness };
        shader.vertexShader = 'uniform float uOutline;\n' + shader.vertexShader.replace(
          '#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOutline;');
      };
      m.customProgramCacheKey = function () { return 'ggui-outline'; };
      m.userData.shared = true;
      outlineMats[key] = m;
      return m;
    }

    var smoothCache = new WeakMap();
    function smoothClone(geo) {
      if (smoothCache.has(geo)) return smoothCache.get(geo);
      var g = geo.clone(), pos = g.attributes.position, nor = g.attributes.normal, map = new Map(), i, k, a;
      function key(i) { return pos.getX(i).toFixed(3) + ',' + pos.getY(i).toFixed(3) + ',' + pos.getZ(i).toFixed(3); }
      for (i = 0; i < pos.count; i++) {
        k = key(i); a = map.get(k);
        if (!a) { a = [0, 0, 0]; map.set(k, a); }
        a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i);
      }
      for (i = 0; i < pos.count; i++) {
        a = map.get(key(i));
        var len = Math.hypot(a[0], a[1], a[2]) || 1;
        nor.setXYZ(i, a[0] / len, a[1] / len, a[2] / len);
      }
      smoothCache.set(geo, g);
      return g;
    }
    function outline(mesh, thickness) {
      var o = new THREE.Mesh(smoothClone(mesh.geometry), outlineMat(thickness));
      mesh.add(o);
      return mesh;
    }
    function mesh(geo, mat, t) { var m = new THREE.Mesh(geo, mat); return t ? outline(m, t) : m; }

    function roundedRect(w, h, r) {
      var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return s;
    }
    function star(points, ro, ri) {
      var s = new THREE.Shape();
      for (var i = 0; i < points * 2; i++) {
        var r = i % 2 ? ri : ro, a = i / (points * 2) * TAU + Math.PI / 2;
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      s.closePath(); return s;
    }
    function burst(n, r, amp) {
      var s = new THREE.Shape(), steps = 220;
      for (var i = 0; i < steps; i++) {
        var a = i / steps * TAU, rr = r + amp * Math.cos(a * n);
        if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      s.closePath(); return s;
    }
    var SHAPES = {
      heart: function () {
        var s = new THREE.Shape();
        s.moveTo(0, -0.52);
        s.bezierCurveTo(-0.12, -0.38, -0.58, -0.1, -0.58, 0.16);
        s.bezierCurveTo(-0.58, 0.42, -0.38, 0.56, -0.22, 0.56);
        s.bezierCurveTo(-0.09, 0.56, 0, 0.47, 0, 0.36);
        s.bezierCurveTo(0, 0.47, 0.09, 0.56, 0.22, 0.56);
        s.bezierCurveTo(0.38, 0.56, 0.58, 0.42, 0.58, 0.16);
        s.bezierCurveTo(0.58, -0.1, 0.12, -0.38, 0, -0.52);
        return s;
      },
      bolt: function () {
        var s = new THREE.Shape();
        s.moveTo(0.04, 0.62); s.lineTo(-0.3, -0.02); s.lineTo(-0.04, -0.02);
        s.lineTo(-0.16, -0.62); s.lineTo(0.32, 0.1); s.lineTo(0.06, 0.1);
        s.lineTo(0.28, 0.62); s.closePath(); return s;
      },
      shield: function () {
        var s = new THREE.Shape();
        s.moveTo(-0.46, 0.46); s.quadraticCurveTo(0, 0.64, 0.46, 0.46); s.lineTo(0.46, 0.06);
        s.quadraticCurveTo(0.42, -0.4, 0, -0.62); s.quadraticCurveTo(-0.42, -0.4, -0.46, 0.06);
        s.closePath(); return s;
      },
      battery: function () {
        var s = new THREE.Shape();
        s.moveTo(-0.48, 0.38); s.lineTo(0.3, 0.38); s.lineTo(0.3, 0.2); s.lineTo(0.52, 0.2);
        s.lineTo(0.52, -0.2); s.lineTo(0.3, -0.2); s.lineTo(0.3, -0.38); s.lineTo(-0.48, -0.38);
        s.closePath(); return s;
      }
    };
    function extrude(shape, depth, bevel, curveSegments) {
      var g = new THREE.ExtrudeGeometry(shape, {
        depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: curveSegments || 18
      });
      g.center(); return g;
    }

    // Kapsel som kan strekkes langs x uten at omrisset blir tykkere.
    function capsule(radius, material, t, bodyMaterial) {
      var group = new THREE.Group();
      var bodyGeo = new THREE.CylinderGeometry(radius, radius, 1, 32, 1, true);
      bodyGeo.rotateZ(Math.PI / 2); bodyGeo.translate(0.5, 0, 0);
      var capGeo = new THREE.SphereGeometry(radius, 32, 18);
      var body = mesh(bodyGeo, bodyMaterial || material, t), a = mesh(capGeo, material, t), b = mesh(capGeo, material, t);
      group.add(body, a, b);
      group.setLength = function (len) { len = Math.max(0.0001, len); body.scale.x = len; b.position.x = len; };
      return group;
    }

    function spring(k, d, x) {
      return {
        x: x, v: 0, target: x,
        step: function (dt) {
          var h = dt / 4;
          for (var i = 0; i < 4; i++) { this.v += (-k * (this.x - this.target) - d * this.v) * h; this.x += this.v * h; }
          return this.x;
        }
      };
    }

    function particles(scene, count, geo, t) {
      var items = [], idx = 0;
      for (var i = 0; i < count; i++) {
        var m = mesh(geo, toon('white'), t); m.visible = false; scene.add(m);
        items.push({ m: m, life: 0, max: 1, vx: 0, vy: 0, vz: 0, spin: 0, s: 1 });
      }
      return {
        emit: function (x, y, z, colors, n, o) {
          o = o || {};
          var speed = o.speed || 3, spread = o.spread == null ? TAU : o.spread, dir = o.dir == null ? Math.PI / 2 : o.dir;
          var up = o.up || 0, scale = o.scale || 1, life = o.life || 0.9;
          for (var k = 0; k < n; k++) {
            var p = items[idx++ % count], ang = dir + (Math.random() - 0.5) * spread, sp = speed * (0.5 + Math.random() * 0.7);
            p.m.visible = true; p.m.position.set(x, y, z);
            p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp + up; p.vz = (Math.random() - 0.2) * 1.5;
            p.life = 0; p.max = life * (0.7 + Math.random() * 0.6); p.s = scale * (0.6 + Math.random() * 0.6);
            p.spin = (Math.random() - 0.5) * 14;
            p.m.material.color.set(hex(colors[k % colors.length]));
            p.m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
          }
        },
        update: function (dt, g) {
          g = g == null ? -7 : g;
          items.forEach(function (p) {
            if (!p.m.visible) return;
            p.life += dt;
            if (p.life >= p.max) { p.m.visible = false; return; }
            p.vy += g * dt;
            p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
            p.m.rotation.z += p.spin * dt; p.m.rotation.x += p.spin * 0.5 * dt;
            var k = p.life / p.max, sc = p.s * (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88);
            p.m.scale.setScalar(Math.max(0.001, sc));
          });
        }
      };
    }

    // Sjokkbølge-ringer (flate ringer som vokser og blekner)
    function rings(parent, count, radius, tube) {
      var geo = new THREE.TorusGeometry(radius, tube, 8, 64), items = [], idx = 0;
      for (var i = 0; i < count; i++) {
        var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
        m.visible = false; parent.add(m);
        items.push({ m: m, age: 0, dur: 1, from: 1, to: 2, op: 1 });
      }
      return {
        fire: function (x, y, z, color, o) {
          o = o || {};
          var r = items[idx++ % count];
          r.m.position.set(x, y, z); r.m.material.color.set(hex(color));
          r.age = 0; r.dur = o.dur || 0.6; r.from = o.from || 0.3; r.to = o.to || 2; r.op = o.opacity || 0.9;
          r.sx = o.sx || 1; r.m.visible = true;
        },
        update: function (dt) {
          items.forEach(function (r) {
            if (!r.m.visible) return;
            r.age += dt;
            var k = r.age / r.dur;
            if (k >= 1) { r.m.visible = false; return; }
            var e = 1 - Math.pow(1 - k, 3), s = r.from + (r.to - r.from) * e;
            r.m.scale.set(s * r.sx, s, s);
            r.m.material.opacity = r.op * (1 - k);
          });
        }
      };
    }

    function sprite(tex, color) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(hex(color || 'white')), transparent: true, depthWrite: false }));
      s.visible = false;
      return s;
    }

    // ================= Felles animasjonsløkke =================
    var comps = new Set(), raf = null, last = 0;
    function tick(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      comps.forEach(function (c) { if (c.stage.visible) c.update(dt, now / 1000); });
      raf = comps.size ? requestAnimationFrame(tick) : null;
    }
    function register(c) {
      comps.add(c);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    function makeStage(root, box, fov) {
      fov = fov || 26;
      var canvas = document.createElement('canvas');
      canvas.className = 'ggui-canvas';
      root.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
      scene.add(new THREE.AmbientLight(0xffffff, 0.32));
      var key = new THREE.DirectionalLight(0xffffff, 0.72); key.position.set(-3, 5, 6); scene.add(key);
      var fill = new THREE.DirectionalLight(0xbfd4ff, 0.12); fill.position.set(4, -2, 3); scene.add(fill);
      var stage = { canvas: canvas, scene: scene, camera: camera, visible: true, pointer: { x: 0, y: 0, inside: false } };
      function fit() {
        var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
        camera.aspect = w / h;
        var t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
        camera.position.set(box.cx, box.cy, Math.max((box.h / 2) / t, (box.w / 2) / (t * camera.aspect)));
        camera.lookAt(box.cx, box.cy, 0);
        camera.updateProjectionMatrix();
      }
      var ro = new ResizeObserver(fit); ro.observe(canvas); fit();
      var io = new IntersectionObserver(function (es) { stage.visible = es[es.length - 1].isIntersecting; }); io.observe(canvas);
      canvas.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        stage.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        stage.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
        stage.pointer.inside = true;
      });
      canvas.addEventListener('pointerleave', function () { stage.pointer.inside = false; });
      // Alle komponenter tegnes med én felles WebGL-renderer og kopieres inn i sitt eget 2D-lerret.
      // Da bruker hele siden bare én WebGL-kontekst, uansett hvor mange målere og merker den har.
      stage.render = function () {
        var W = canvas.width, H = canvas.height, r = shared.r;
        if (W < 2 || H < 2) return;
        if (W > shared.w || H > shared.h) {
          shared.w = Math.max(W, shared.w); shared.h = Math.max(H, shared.h);
          r.setSize(shared.w, shared.h, false);
        }
        r.setViewport(0, 0, W, H); r.setScissor(0, 0, W, H); r.setScissorTest(true);
        r.clear(true, true, true);
        r.render(scene, camera);
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(r.domElement, 0, shared.h - H, W, H, 0, 0, W, H);
      };
      stage.project = function (obj, x, y, z) {
        obj.updateMatrixWorld();
        var v = new THREE.Vector3(x, y, z).applyMatrix4(obj.matrixWorld).project(camera);
        return { x: canvas.offsetLeft + (v.x + 1) / 2 * canvas.clientWidth, y: canvas.offsetTop + (1 - v.y) / 2 * canvas.clientHeight };
      };
      stage.dispose = function () {
        ro.disconnect(); io.disconnect();
        scene.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material && !o.material.userData.shared) o.material.dispose();
        });
        canvas.remove();
      };
      return stage;
    }

    function floatText(root, stage, obj, x, text, color) {
      var p = stage.project(obj, x, 0.45, 0.5);
      var el = document.createElement('span');
      el.className = 'ggui-float';
      el.textContent = text;
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      el.style.color = hex(color);
      el.style.setProperty('--ggui-stroke', hex('outline'));
      el.setAttribute('aria-hidden', 'true');
      root.appendChild(el);
      el.addEventListener('animationend', function () { el.remove(); });
      setTimeout(function () { el.remove(); }, 2000);
    }

    // ================= Måler =================
    function createStatBar(container, opts) {
      opts = opts || {};
      var kindKey = BAR_KINDS[opts.kind] ? opts.kind : 'health';
      var kind = Object.assign({}, BAR_KINDS[kindKey], opts.kindOverrides || {});
      var label = opts.label || kind.label;
      var target = clamp01(opts.value == null ? 0.7 : opts.value);
      var interactive = !!opts.interactive;

      var root = document.createElement('div');
      root.className = 'ggui ggui-bar ggui-bar--' + kindKey + (interactive ? ' is-interactive' : '');
      var head = document.createElement('div'); head.className = 'ggui-bar__head';
      var labelEl = document.createElement('span'); labelEl.className = 'ggui-bar__label'; labelEl.textContent = label;
      var valueEl = document.createElement('span'); valueEl.className = 'ggui-bar__value';
      head.append(labelEl, valueEl); root.appendChild(head); container.appendChild(root);
      root.setAttribute('role', interactive ? 'slider' : 'meter');
      root.setAttribute('aria-label', label);
      root.setAttribute('aria-valuemin', '0'); root.setAttribute('aria-valuemax', '100');
      if (interactive) root.tabIndex = 0;

      var stage = makeStage(root, { cx: 3.4, cy: 0, w: 8.7, h: 2.12 });
      var world = new THREE.Group(); stage.scene.add(world);
      var X0 = 1.0, X1 = 6.95, L = X1 - X0;

      // Pulserende glorie bak stolpen
      var haloMat = new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, opacity: 0.3 });
      var halo = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 2.3), haloMat);
      halo.position.set(3.45, 0, -0.7); world.add(halo);

      var plateMat = toon('plate');
      var plate = mesh(extrude(roundedRect(7.35, 1.08, 0.54), 0.22, 0.06), plateMat, 0.05);
      plate.position.set(3.83, 0, -0.35); world.add(plate);

      var slot = capsule(0.3, toon('slot'), 0.03); slot.position.set(X0, 0, 0); slot.setLength(L); world.add(slot);
      var ghostMat = toon('white');
      var ghost = capsule(0.32, ghostMat); ghost.position.set(X0, 0, 0.02); world.add(ghost);

      var stripes = stripeTex();
      var fillMat = toon('white'), fillBodyMat = toon('white', { map: stripes });
      var fill = capsule(0.34, fillMat, 0.045, fillBodyMat); fill.position.set(X0, 0, 0.04); world.add(fill);

      var shine = capsule(0.075, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
      shine.position.set(X0 + 0.12, 0.16, 0.36); world.add(shine);

      var tickMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex('navy')), transparent: true, opacity: 0.35 });
      var tickGeo = new THREE.BoxGeometry(0.045, 0.46, 0.04);
      [0.25, 0.5, 0.75].forEach(function (f) { var t = new THREE.Mesh(tickGeo, tickMat); t.position.set(X0 + f * L, 0, 0.42); world.add(t); });

      var icon = new THREE.Group(); icon.position.set(0, 0, 0.1);
      var discGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.3, 48); discGeo.rotateX(Math.PI / 2);
      var medMat = toon('white');
      var emblem = mesh(extrude(SHAPES[kind.icon](), 0.14, 0.05, 24), toon('white'), 0.045);
      emblem.scale.setScalar(0.72); emblem.position.z = 0.22;
      icon.add(mesh(discGeo, medMat, 0.05), emblem);
      world.add(icon);

      var stars = particles(stage.scene, 26, extrude(star(5, 0.21, 0.09), 0.05, 0.015), 0.03);
      var puffs = particles(stage.scene, 20, new THREE.SphereGeometry(0.13, 14, 10), 0.03);
      var waves = rings(world, 3, 0.5, 0.06);
      var glint = sprite(glintTex); world.add(glint);

      var sp = spring(200, 15, target), punch = spring(320, 11, 0), hop = spring(260, 10, 0);
      var ghostV = target, hold = 0, shake = 0, flash = 0, spin = 0, squish = 0;
      var flashColor = new THREE.Color(), glintWait = 1 + Math.random() * 1.5, glintAge = -1;
      var cur = new THREE.Color(), tmp = new THREE.Color(), tmpB = new THREE.Color();

      function colorAt(v, out) {
        var s = kind.stops;
        if (v <= s[0][0]) return out.set(hex(s[0][1]));
        for (var i = 1; i < s.length; i++) {
          if (v <= s[i][0]) return out.set(hex(s[i - 1][1])).lerp(tmpB.set(hex(s[i][1])), (v - s[i - 1][0]) / (s[i][0] - s[i - 1][0]));
        }
        return out.set(hex(s[s.length - 1][1]));
      }
      colorAt(target, cur);

      function setAria() {
        var pct = Math.round(target * 100);
        root.setAttribute('aria-valuenow', String(pct));
        root.setAttribute('aria-valuetext', label + ' ' + pct + ' prosent');
      }
      setAria();

      // Kraftig reaksjon på en endring
      function react(d, fromV, toV) {
        if (Math.abs(d) < 0.03) return;
        var good = d * kind.goodDir > 0, mag = Math.min(1, Math.abs(d) / 0.3);
        var endX = X0 + Math.max(fromV, toV) * L;
        var col = good ? 'mint' : 'coral';
        flashColor.set(hex(good ? 'mint' : 'coral'));
        flash = 1;
        punch.v += (good ? 9 : -9) * (0.6 + mag * 0.6);
        waves.fire(endX, 0, 0.45, col, { from: 0.3, to: 2.4 + mag, dur: 0.7, sx: 1 });
        waves.fire(X0 + L / 2, 0, -0.2, col, { from: 5.2, to: 6.4, dur: 0.55, sx: 1, opacity: 0.5 });
        floatText(root, stage, world, endX, (d > 0 ? '+' : '−') + Math.round(Math.abs(d) * 100), col);
        valueEl.classList.remove('is-pulse'); void valueEl.offsetWidth; valueEl.classList.add('is-pulse');
        if (good) {
          spin = 1; hop.v += 9;
          stars.emit(endX, 0.1, 0.5, ['lantern', 'white', 'mint'], 10 + Math.floor(mag * 16), { spread: 2.4, speed: 4.2 + mag * 2, life: 1 });
        } else {
          squish = 1; if (!reduced) shake = 0.6 + mag * 0.6;
          puffs.emit(endX, 0.1, 0.5, ['white', 'coral', 'orange'], 8 + Math.floor(mag * 12), { spread: 1.8, speed: 2.6 + mag, up: 0.8, life: 0.9 });
        }
      }

      function setValue(v, o) {
        o = o || {};
        v = clamp01(v);
        var d = v - target;
        if (Math.abs(d) < 1e-4) return api;
        if (d < 0) { ghostV = Math.max(ghostV, clamp01(sp.x)); hold = 0.55; }
        if (!o.quiet) react(d, target, v);
        target = v; sp.target = v;
        setAria();
        return api;
      }

      var dragging = false, dragFrom = 0;
      function valueFromEvent(e) {
        var r = stage.canvas.getBoundingClientRect();
        var a = stage.project(world, X0, 0, 0.3), b = stage.project(world, X1, 0, 0.3);
        var x = e.clientX - r.left + stage.canvas.offsetLeft;
        return clamp01((x - a.x) / (b.x - a.x));
      }
      if (interactive) {
        stage.canvas.addEventListener('pointerdown', function (e) {
          dragging = true; dragFrom = target; root.classList.add('is-dragging');
          stage.canvas.setPointerCapture(e.pointerId);
          setValue(valueFromEvent(e), { quiet: true });
        });
        stage.canvas.addEventListener('pointermove', function (e) { if (dragging) setValue(valueFromEvent(e), { quiet: true }); });
        var end = function () {
          if (!dragging) return;
          dragging = false; root.classList.remove('is-dragging');
          react(target - dragFrom, dragFrom, target);
          if (opts.onChange) opts.onChange(target);
        };
        stage.canvas.addEventListener('pointerup', end);
        stage.canvas.addEventListener('pointercancel', end);
        root.addEventListener('keydown', function (e) {
          var step = { ArrowRight: 0.05, ArrowUp: 0.05, ArrowLeft: -0.05, ArrowDown: -0.05, PageUp: 0.1, PageDown: -0.1 }[e.key];
          var nv = step ? target + step : e.key === 'Home' ? 0 : e.key === 'End' ? 1 : null;
          if (nv == null) return;
          e.preventDefault(); setValue(nv);
          if (opts.onChange) opts.onChange(target);
        });
      }

      var comp = {
        stage: stage,
        update: function (dt, t) {
          sp.step(dt); punch.step(dt); hop.step(dt);
          var shown = Math.max(0, Math.min(1.02, sp.x)), display = clamp01(sp.x), len = shown * L;
          var danger = kind.danger(target);

          fill.visible = shown > 0.004; fill.setLength(len);
          stripes.repeat.set(2, Math.max(0.2, len * 1.3));
          stripes.offset.y -= dt * (danger ? 1.6 : 0.55) * idle;
          shine.visible = len > 0.35; shine.setLength(Math.max(0.0001, len - 0.3));

          if (hold > 0) hold -= dt; else ghostV += (shown - ghostV) * Math.min(1, dt * 3.5);
          if (ghostV < shown) ghostV = shown;
          ghost.visible = ghostV - shown > 0.004; ghost.setLength(ghostV * L);
          ghostMat.emissive.setScalar(hold > 0 ? 0.25 * (Math.sin(t * 40) > 0 ? 1 : 0) : 0);

          colorAt(target, tmp);
          cur.lerp(tmp, Math.min(1, dt * 6));
          fillMat.color.copy(cur); fillBodyMat.color.copy(cur); medMat.color.copy(cur);

          // Tomgangspuls: pust i fyllet, glorie som bølger, medaljong som puster
          var breathe = idle ? (Math.sin(t * (danger ? 9 : 2.6)) * 0.5 + 0.5) : 0;
          flash = Math.max(0, flash - dt * 2.8);
          var em = flash * 0.8, pulseEm = breathe * (danger ? 0.28 : 0.1);
          fillMat.emissive.copy(flashColor).multiplyScalar(em).addScalar(pulseEm);
          fillBodyMat.emissive.copy(fillMat.emissive);
          medMat.emissive.copy(flashColor).multiplyScalar(em * 0.6).addScalar(pulseEm * 0.8);
          plateMat.emissive.copy(flashColor).multiplyScalar(flash * 0.35);
          if (danger) plateMat.emissive.add(tmp.set(hex('coral')).multiplyScalar(breathe * 0.25));
          haloMat.color.copy(danger ? tmpB.set(hex('coral')) : cur);
          haloMat.opacity = 0.14 + breathe * (danger ? 0.5 : 0.22) + flash * 0.5;
          halo.scale.set(1 + breathe * 0.015, 1 + breathe * 0.1 + flash * 0.25, 1);

          spin = Math.max(0, spin - dt * 1.3);
          squish = Math.max(0, squish - dt * 2.5);
          var s = 1 + Math.sin(t * 2.6) * 0.04 * idle;
          if (danger && kind.dangerStyle === 'heartbeat') s += (Math.pow(Math.max(0, Math.sin(t * 7.5)), 8) * 0.22) * idle;
          icon.scale.set(s * (1 + squish * 0.35), s * (1 - squish * 0.3), s);
          icon.rotation.y = Math.sin(t * 1.3) * 0.3 * idle + (spin > 0 ? (1 - easeOutBack(1 - spin)) * TAU : 0);
          icon.rotation.z = squish * Math.sin(t * 40) * 0.3;
          var jit = danger && kind.dangerStyle === 'jitter' ? 0.07 * idle : 0;
          icon.position.x = (Math.random() - 0.5) * jit;
          icon.position.y = hop.x * 0.35 + (Math.random() - 0.5) * jit;

          shake = Math.max(0, shake - dt * 2.2);
          world.position.x = Math.sin(t * 55) * 0.12 * shake;
          world.position.y = Math.cos(t * 47) * 0.08 * shake;
          world.scale.set(1 - punch.x * 0.03, 1 + punch.x * 0.1, 1);
          var tx = stage.pointer.inside && !dragging ? -stage.pointer.y * 0.18 : 0;
          var ty = stage.pointer.inside && !dragging ? stage.pointer.x * 0.08 : 0;
          world.rotation.x += (tx - world.rotation.x) * Math.min(1, dt * 5);
          world.rotation.y += (ty - world.rotation.y) * Math.min(1, dt * 5);

          if (idle) {
            glintWait -= dt;
            if (glintWait <= 0 && glintAge < 0 && len > 0.8) { glintAge = 0; glintWait = 2 + Math.random() * 1.5; }
          }
          if (glintAge >= 0) {
            glintAge += dt;
            var k = glintAge / 0.8;
            if (k > 1) { glint.visible = false; glintAge = -1; }
            else {
              glint.visible = true;
              glint.position.set(X0 + 0.1 + k * Math.max(0, len - 0.2), 0.15, 0.55);
              var gs = Math.sin(k * Math.PI) * 0.7; glint.scale.set(gs, gs, 1);
            }
          }

          stars.update(dt); puffs.update(dt, 1.5); waves.update(dt);
          valueEl.textContent = Math.round(display * 100) + ' %';
          stage.render();
        }
      };
      register(comp);

      var api = {
        el: root,
        setValue: setValue,
        getValue: function () { return target; },
        dispose: function () { comps.delete(comp); stage.dispose(); root.remove(); }
      };
      return api;
    }

    // ================= Merker: emblemer =================
    var BUILD = {
      bjarne: function () {
        var g = new THREE.Group(), skin = toon('skin'), ink = toon('navy'), white = toon('white');
        // Hettegenser med «B» på brystet
        var hoodie = mesh(new THREE.SphereGeometry(0.62, 32, 20), toon('coral'), 0.045);
        hoodie.scale.set(1.08, 0.6, 0.7); hoodie.position.y = -0.7; g.add(hoodie);
        var chipGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 28); chipGeo.rotateX(Math.PI / 2);
        var chip = mesh(chipGeo, toon('lantern'), 0.025); chip.position.set(-0.24, -0.52, 0.36); chip.rotation.x = -0.35; g.add(chip);
        var bTex = canvasTex(128, 128, function (x, w, h) {
          x.font = '400 104px "Lilita One", "Arial Black", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillStyle = hex('navy'); x.fillText('B', w / 2, h / 2 + 6);
        });
        var bLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), new THREE.MeshBasicMaterial({ map: bTex, transparent: true, depthWrite: false }));
        bLabel.position.z = 0.035; chip.add(bLabel);

        // Hodet i egen gruppe, så det kan nikke og følge musepekeren
        var head = new THREE.Group(); head.position.y = 0.14; head.scale.setScalar(1.14); g.add(head);
        head.add(mesh(new THREE.SphereGeometry(0.42, 36, 24), skin, 0.045));
        [-1, 1].forEach(function (sx) {
          var ear = mesh(new THREE.SphereGeometry(0.1, 16, 12), skin, 0.03); ear.scale.z = 0.5; ear.position.set(sx * 0.42, -0.02, 0); head.add(ear);
        });
        var hair = mesh(new THREE.SphereGeometry(0.445, 32, 16, 0, TAU, 0, Math.PI * 0.4), toon('hair'), 0.035);
        hair.rotation.x = -0.35; hair.position.y = 0.02; head.add(hair);
        var tuft = mesh(new THREE.ConeGeometry(0.1, 0.24, 14), toon('hair'), 0.03); tuft.position.set(0.06, 0.46, 0.08); tuft.rotation.z = -0.5; head.add(tuft);
        // Surt ansikt: senkede, skrå øyenbryn, halvlukkede øyelokk, rynket munn og røde kinn
        var eyes = [], pupils = [], brows = [], lids = [], cheeks = [];
        var cheekMat = toon('coral', { transparent: true, opacity: 0.55, depthWrite: false });
        [-1, 1].forEach(function (sx) {
          var e = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 12), white); e.scale.z = 0.5; e.position.set(sx * 0.15, 0.03, 0.37); head.add(e); eyes.push(e);
          var p = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 8), ink); p.position.set(sx * 0.15, 0.015, 0.41); p.userData.base = sx * 0.15; head.add(p); pupils.push(p);
          var lid = new THREE.Mesh(new THREE.SphereGeometry(0.092, 18, 10, 0, TAU, 0, Math.PI / 2), skin);
          lid.scale.z = 0.58; lid.position.set(sx * 0.15, 0.03, 0.372); lid.rotation.z = sx * 0.28; lid.rotation.x = 0.55; head.add(lid);
          lid.userData.base = 0.55; lid.userData.sx = sx; lids.push(lid);
          var ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 8, 28), ink); ring.position.set(sx * 0.15, 0.03, 0.41); head.add(ring);
          var b = mesh(new THREE.BoxGeometry(0.19, 0.055, 0.05), toon('hair'), 0.015);
          b.position.set(sx * 0.16, 0.16, 0.42); b.rotation.z = sx * 0.42; b.userData.base = 0.16; b.userData.rot = sx * 0.42; head.add(b); brows.push(b);
          var ch = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), cheekMat); ch.scale.set(1.3, 0.7, 0.3); ch.position.set(sx * 0.25, -0.1, 0.34); head.add(ch); cheeks.push(ch);
          var crease = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.01), toon('skinShade'));
          crease.position.set(sx * 0.03, 0.2, 0.41); crease.rotation.z = sx * 1.1; head.add(crease);
        });
        var bridge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.02), ink); bridge.position.set(0, 0.05, 0.42); head.add(bridge);
        var nose = mesh(new THREE.SphereGeometry(0.065, 14, 10), toon('skinShade'), 0.02); nose.scale.set(1, 0.9, 1); nose.position.set(0, -0.07, 0.42); head.add(nose);
        var mouth = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 20, Math.PI), ink);
        mouth.position.set(0.02, -0.215, 0.37); mouth.rotation.z = 0.12; mouth.scale.set(1, 0.7, 1); head.add(mouth);
        var chin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), toon('skinShade')); chin.position.set(0.02, -0.29, 0.35); head.add(chin);
        var puffs = [-1, 1].map(function (sx) {
          return [0, 1].map(function (i) {
            var pf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
            pf.userData.sx = sx; pf.userData.phase = i * 0.5; head.add(pf); return pf;
          });
        }).reduce(function (a, b) { return a.concat(b); }, []);
        var glint = sprite(glintTex); glint.position.set(-0.2, 0.12, 0.5); head.add(glint);

        // Kaffekoppen
        var mug = new THREE.Group();
        mug.add(mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.26, 24), white, 0.03));
        var band = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.025, 8, 28), toon('lantern')); band.rotation.x = Math.PI / 2; mug.add(band);
        var handle = mesh(new THREE.TorusGeometry(0.07, 0.025, 8, 16, Math.PI), white, 0.02); handle.position.x = 0.15; handle.rotation.z = -Math.PI / 2; mug.add(handle);
        var coffeeGeo = new THREE.CircleGeometry(0.13, 24); coffeeGeo.rotateX(-Math.PI / 2);
        var coffee = new THREE.Mesh(coffeeGeo, toon('coffee')); coffee.position.y = 0.125; mug.add(coffee);
        var hand = mesh(new THREE.SphereGeometry(0.1, 16, 12), white, 0.03); hand.position.set(-0.13, -0.04, 0.08); mug.add(hand);
        var steam = [0, 1, 2].map(function (i) {
          var st = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
          st.position.set(0, 0.2, 0); st.userData.phase = i / 3; mug.add(st); return st;
        });
        var mugHome = new THREE.Vector3(0.46, -0.44, 0.4);
        mug.position.copy(mugHome); mug.scale.setScalar(1.25); g.add(mug);

        g.position.y = 0.02;
        g.userData = { head: head, eyes: eyes, pupils: pupils, brows: brows, lids: lids, cheeks: cheeks, cheekMat: cheekMat,
          puffs: puffs, skin: skin, mouth: mouth, mug: mug, mugHome: mugHome, coffee: coffee, steam: steam, glint: glint,
          scale: 1.02, cups: 1 };
        return g;
      },

      lantern: function () {
        var outer = new THREE.Group(), swing = new THREE.Group(), g = new THREE.Group(), frame = toon('white');
        var top = mesh(new THREE.TorusGeometry(0.09, 0.03, 8, 20), frame, 0.02); top.position.y = 0.62; g.add(top);
        var cap = mesh(new THREE.ConeGeometry(0.36, 0.22, 28), frame, 0.035); cap.position.y = 0.44; g.add(cap);
        var rim = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 28), frame, 0.03); rim.position.y = 0.31; g.add(rim);
        var flameMat = toon('orange', { emissive: new THREE.Color(hex('orange')) });
        var flame = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), flameMat); flame.scale.set(1, 1.7, 1); flame.position.y = 0.04; g.add(flame);
        var glassMat = toon('lantern', { transparent: true, opacity: 0.55, depthWrite: false });
        var glass = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.5, 28), glassMat); glass.position.y = 0.04; g.add(outline(glass, 0.03));
        [-1, 1].forEach(function (sx) {
          var p = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.52, 10), frame, 0.02); p.position.set(sx * 0.22, 0.04, 0.14); g.add(p);
        });
        var base = mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 28), frame, 0.03); base.position.y = -0.25; g.add(base);
        var foot = mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.07, 24), frame, 0.03); foot.position.y = -0.33; g.add(foot);
        g.position.y = -0.62; swing.position.y = 0.62; swing.add(g); outer.add(swing);
        outer.position.y = -0.1;
        outer.userData = { swing: swing, flame: flame, flameMat: flameMat, glassMat: glassMat, scale: 1.35 };
        return outer;
      },
      stopwatch: function () {
        var g = new THREE.Group(), trim = toon('plate');
        var faceGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.18, 44); faceGeo.rotateX(Math.PI / 2);
        var body = mesh(faceGeo, toon('white'), 0.04); g.add(body);
        var rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 12, 48), trim); g.add(rim);
        var crown = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 14), trim, 0.03); crown.position.y = 0.62; g.add(crown);
        var btn = mesh(extrude(roundedRect(0.24, 0.07, 0.03), 0.12, 0.02), trim, 0.025); btn.position.y = 0.71; g.add(btn);
        var side = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), trim, 0.025);
        side.position.set(0.42, 0.42, 0); side.rotation.z = -Math.PI / 4; g.add(side);
        var tickMat = toon('navy');
        for (var i = 0; i < 12; i++) {
          var a = i / 12 * TAU, big = i % 3 === 0;
          var t = new THREE.Mesh(new THREE.BoxGeometry(0.03, big ? 0.1 : 0.05, 0.02), tickMat);
          t.position.set(Math.sin(a) * 0.38, Math.cos(a) * 0.38, 0.1); t.rotation.z = -a; g.add(t);
        }
        var hand = new THREE.Group(), stick = capsule(0.028, toon('coral'));
        stick.setLength(0.34); stick.rotation.z = Math.PI / 2; hand.add(stick); hand.position.z = 0.12; g.add(hand);
        var dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), toon('coral')); dot.position.z = 0.13; g.add(dot);
        var lines = new THREE.Group();
        [[-0.2, 0.28], [0, 0.4], [0.2, 0.28]].forEach(function (l) {
          var c = capsule(0.04, toon('white'), 0.02); c.rotation.z = Math.PI; c.position.set(-0.64, l[0], 0); c.userData.len = l[1]; c.setLength(l[1]); lines.add(c);
        });
        g.add(lines);
        g.position.x = 0.1;
        g.userData = { hand: hand, lines: lines, scale: 1.02 };
        return g;
      },
      magnifier: function () {
        var g = new THREE.Group(), lensG = new THREE.Group();
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), toon('white')); eye.scale.z = 0.4; lensG.add(eye);
        var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), toon('navy')); pupil.scale.z = 0.5; pupil.position.z = 0.09; lensG.add(pupil);
        var lensGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 36); lensGeo.rotateX(Math.PI / 2);
        var lens = new THREE.Mesh(lensGeo, toon('skyLight', { transparent: true, opacity: 0.35, depthWrite: false })); lens.position.z = 0.14; lensG.add(lens);
        lensG.add(mesh(new THREE.TorusGeometry(0.36, 0.08, 14, 48), toon('lantern'), 0.04));
        var hl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.scale.set(1.8, 0.7, 0.3); hl.position.set(-0.14, 0.17, 0.18); hl.rotation.z = 0.7; lensG.add(hl);
        lensG.position.set(-0.1, 0.12, 0); g.add(lensG);
        var handle = capsule(0.09, toon('wood'), 0.04);
        handle.position.set(0.17, -0.15, 0); handle.rotation.z = -Math.PI / 4; handle.setLength(0.5); g.add(handle);
        g.userData = { pupil: pupil, lens: lensG, scale: 1.08 };
        return g;
      },
      wave: function () {
        var g = new THREE.Group(), bands = [];
        function waveShape(w, h, amp, periods, phase) {
          var s = new THREE.Shape(), n = 40;
          s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2);
          for (var i = 0; i <= n; i++) {
            var x = w / 2 - i / n * w;
            s.lineTo(x, h / 2 + amp * Math.sin(x / w * periods * TAU + phase));
          }
          s.closePath(); return s;
        }
        [['white', 0.16, 0], ['skyLight', -0.1, 1.4], ['sky', -0.34, 2.6]].forEach(function (b, i) {
          var m = mesh(extrude(waveShape(1.0, 0.16, 0.06, 1.6, b[2]), 0.14, 0.04), toon(b[0]), 0.035);
          var holder = new THREE.Group(); holder.position.set(0, b[1], i * 0.08); holder.add(m); g.add(holder);
          bands.push(holder);
        });
        var boat = new THREE.Group();
        var hull = new THREE.Shape(); hull.moveTo(-0.2, 0); hull.lineTo(0.2, 0); hull.lineTo(0.13, -0.1); hull.lineTo(-0.13, -0.1); hull.closePath();
        boat.add(mesh(extrude(hull, 0.1, 0.02), toon('coral'), 0.025));
        var sail = new THREE.Shape(); sail.moveTo(0, 0.02); sail.lineTo(0, 0.3); sail.lineTo(0.16, 0.04); sail.closePath();
        var sm = mesh(extrude(sail, 0.03, 0.015), toon('white'), 0.02); sm.position.set(0.04, 0.16, 0); boat.add(sm);
        boat.position.set(-0.05, 0.36, -0.05); g.add(boat);
        var sun = mesh(new THREE.SphereGeometry(0.13, 18, 12), toon('lantern', { emissive: new THREE.Color(0x332200) }), 0.03);
        sun.position.set(0.36, 0.5, -0.1); g.add(sun);
        g.position.y = -0.02;
        g.userData = { bands: bands, boat: boat, scale: 1 };
        return g;
      },
      flame: function (o) {
        var g = new THREE.Group();
        function flameShape() {
          var s = new THREE.Shape();
          s.moveTo(0, -0.45);
          s.bezierCurveTo(0.42, -0.45, 0.46, -0.05, 0.26, 0.15);
          s.bezierCurveTo(0.12, 0.3, 0.14, 0.42, 0.02, 0.62);
          s.bezierCurveTo(-0.06, 0.42, -0.3, 0.36, -0.36, 0.06);
          s.bezierCurveTo(-0.44, -0.2, -0.3, -0.45, 0, -0.45);
          return s;
        }
        var fg = new THREE.Group();
        var outer = mesh(extrude(flameShape(), 0.2, 0.06, 24), toon('orange', { emissive: new THREE.Color(0x331100) }), 0.045); fg.add(outer);
        var mid = mesh(extrude(flameShape(), 0.1, 0.04, 24), toon('lantern'), 0.03); mid.scale.setScalar(0.62); mid.position.set(0, -0.1, 0.16); fg.add(mid);
        var core = new THREE.Mesh(extrude(flameShape(), 0.05, 0.02, 20), new THREE.MeshBasicMaterial({ color: 0xffffff })); core.scale.setScalar(0.3); core.position.set(0, -0.2, 0.24); fg.add(core);
        fg.position.y = 0.06; g.add(fg);
        var n = String(o && o.value != null ? o.value : 3);
        var tag = new THREE.Group();
        tag.add(mesh(extrude(roundedRect(0.26 + n.length * 0.14, 0.3, 0.13), 0.1, 0.03), toon('coral'), 0.03));
        var tex = canvasTex(256, 128, function (x, w, h) {
          x.font = '400 104px "Lilita One", "Arial Black", system-ui, sans-serif';
          x.textAlign = 'center'; x.textBaseline = 'middle';
          x.lineWidth = 16; x.strokeStyle = hex('outline'); x.strokeText('×' + n, w / 2, h / 2 + 6);
          x.fillStyle = '#fff'; x.fillText('×' + n, w / 2, h / 2 + 6);
        });
        var label = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.28), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
        label.position.z = 0.1; tag.add(label);
        tag.position.set(0.3, -0.42, 0.25); g.add(tag);
        g.userData = { fg: fg, mid: mid, tag: tag, scale: 1 };
        return g;
      },
      barn: function () {
        var g = new THREE.Group(), red = toon('barn'), white = toon('white'), ink = toon('navy');
        var house = new THREE.Shape();
        house.moveTo(-0.5, -0.45); house.lineTo(0.5, -0.45); house.lineTo(0.5, 0.12); house.lineTo(0, 0.5); house.lineTo(-0.5, 0.12); house.closePath();
        var body = mesh(extrude(house, 0.34, 0.04, 4), red, 0.045); g.add(body);
        var bodyFront = 0.21;
        var roofLen = Math.hypot(0.56, 0.4) + 0.12, ang = Math.atan2(0.4, 0.56);
        [-1, 1].forEach(function (sx) {
          var r = mesh(new THREE.BoxGeometry(roofLen, 0.12, 0.5), toon('roof'), 0.035);
          r.position.set(sx * 0.27, 0.34, 0); r.rotation.z = -sx * ang; g.add(r);
        });
        var frame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.03), white); frame.position.set(0, -0.25, bodyFront); g.add(frame);
        var inner = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.03), red); inner.position.set(0, -0.25, bodyFront + 0.01); g.add(inner);
        var xl = Math.hypot(0.3, 0.32), xa = Math.atan2(0.32, 0.3);
        [-1, 1].forEach(function (sx) {
          var b = new THREE.Mesh(new THREE.BoxGeometry(xl, 0.045, 0.03), white); b.position.set(0, -0.25, bodyFront + 0.02); b.rotation.z = sx * xa; g.add(b);
        });
        var pupils = [];
        [-1, 1].forEach(function (sx) {
          var eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 12), white); eye.scale.z = 0.45; eye.position.set(sx * 0.16, 0.12, bodyFront + 0.02); g.add(outline(eye, 0.02));
          var p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), ink); p.position.set(sx * 0.16, 0.12, bodyFront + 0.065); p.userData.base = sx * 0.16; g.add(p); pupils.push(p);
        });
        var browL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.04), ink); browL.position.set(-0.16, 0.25, bodyFront + 0.03); browL.rotation.z = -0.08; g.add(browL);
        var browR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.04), ink); browR.position.set(0.16, 0.3, bodyFront + 0.03); browR.rotation.z = 0.35; g.add(browR);
        var mouth = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), ink); mouth.position.set(0.06, -0.01, bodyFront + 0.03); mouth.rotation.z = 0.18; g.add(mouth);
        var q = mesh(extrude((function () {
          var s = new THREE.Shape();
          s.moveTo(-0.1, 0.08); s.quadraticCurveTo(-0.1, 0.2, 0, 0.2); s.quadraticCurveTo(0.12, 0.2, 0.12, 0.09);
          s.quadraticCurveTo(0.12, 0.02, 0.03, -0.02); s.lineTo(0.03, -0.08); s.lineTo(-0.03, -0.08); s.lineTo(-0.03, 0.01);
          s.quadraticCurveTo(0.06, 0.05, 0.06, 0.1); s.quadraticCurveTo(0.06, 0.14, 0, 0.14); s.quadraticCurveTo(-0.04, 0.14, -0.04, 0.08); s.closePath();
          return s;
        })(), 0.05, 0.015, 8), toon('lantern'), 0.02);
        var qd = mesh(new THREE.SphereGeometry(0.035, 10, 8), toon('lantern'), 0.02); qd.position.y = -0.14; q.add(qd);
        q.position.set(0.5, 0.5, 0.2); g.add(q);
        g.position.y = -0.04;
        g.userData = { pupils: pupils, brow: browR, q: q, scale: 1.02 };
        return g;
      },
      hand: function () {
        var g = new THREE.Group(), glove = toon('white');
        var fist = mesh(extrude(roundedRect(0.9, 0.8, 0.28), 0.5, 0.08), glove, 0.05);
        fist.position.set(0.1, -0.2, 0); g.add(fist);
        for (var i = 0; i < 4; i++) {
          var f = capsule(0.12, glove, 0.045);
          f.position.set(0.2, 0.07 - i * 0.22, 0.3); f.setLength(0.4); g.add(f);
        }
        // Tommelen: lang, tykk og med en farget negl, så den skiller seg tydelig ut
        var thumb = capsule(0.2, glove, 0.055);
        thumb.position.set(-0.16, 0.1, 0.12); thumb.rotation.z = Math.PI / 2 - 0.1; thumb.setLength(0.82);
        var nail = mesh(new THREE.SphereGeometry(0.12, 20, 12), toon('skyLight'), 0.03);
        nail.scale.set(1.35, 0.95, 0.5); nail.position.set(0.8, 0, 0.16);
        thumb.add(nail);
        g.add(thumb);
        var cuff = mesh(extrude(roundedRect(0.34, 1.0, 0.12), 0.62, 0.05), toon('sky'), 0.05);
        cuff.position.set(-0.56, -0.2, 0); g.add(cuff);
        g.position.set(0, -0.14, 0);
        var wrap = new THREE.Group(); wrap.add(g);
        wrap.userData.inner = g;
        wrap.userData.scale = 0.78;
        return wrap;
      },
      trophy: function () {
        var g = new THREE.Group(), gold = toon('lantern');
        var cup = mesh(new THREE.LatheGeometry([
          new THREE.Vector2(0.001, -0.28), new THREE.Vector2(0.28, -0.24), new THREE.Vector2(0.44, 0.02),
          new THREE.Vector2(0.5, 0.42), new THREE.Vector2(0.44, 0.45), new THREE.Vector2(0.38, 0.12), new THREE.Vector2(0.001, 0.06)
        ], 40), gold, 0.045);
        cup.position.y = 0.12; g.add(cup);
        [-1, 1].forEach(function (sx) {
          var h = mesh(new THREE.TorusGeometry(0.17, 0.055, 10, 24, Math.PI), gold, 0.035);
          h.position.set(sx * 0.46, 0.34, 0); h.rotation.z = sx < 0 ? Math.PI / 2 : -Math.PI / 2; g.add(h);
        });
        var stem = mesh(new THREE.CylinderGeometry(0.07, 0.13, 0.3, 20), gold, 0.035); stem.position.y = -0.28; g.add(stem);
        var base = mesh(extrude(roundedRect(0.62, 0.16, 0.06), 0.34, 0.05), toon('white'), 0.04); base.position.y = -0.5; g.add(base);
        var badge = mesh(extrude(star(5, 0.15, 0.07), 0.04, 0.02), toon('white'), 0.025); badge.position.set(0, 0.22, 0.46); g.add(badge);
        g.position.y = 0.04;
        g.userData.scale = 1.05;
        return g;
      },
      cloud: function () {
        var g = new THREE.Group(), cloud = new THREE.Group(), mat = toon('cloud');
        [[-0.36, 0, 0.3], [0, 0.16, 0.4], [0.36, 0.02, 0.32], [-0.16, -0.14, 0.28], [0.18, -0.14, 0.28]].forEach(function (c) {
          var m = mesh(new THREE.SphereGeometry(c[2], 28, 18), mat, 0.04); m.position.set(c[0], c[1], 0); cloud.add(m);
        });
        var eyeMat = toon('navy');
        [-1, 1].forEach(function (sx) {
          var eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), eyeMat); eye.position.set(sx * 0.12, 0.14, 0.38); cloud.add(eye);
          var brow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), eyeMat);
          brow.position.set(sx * 0.13, 0.27, 0.37); brow.rotation.z = sx * 0.4; cloud.add(brow);
        });
        cloud.position.y = 0.2; g.add(cloud);
        var bolt = mesh(extrude(SHAPES.bolt(), 0.1, 0.04), toon('lantern'), 0.035);
        bolt.scale.setScalar(0.62); bolt.position.set(0.05, -0.38, 0.15); g.add(bolt);
        g.userData.cloud = cloud; g.userData.bolt = bolt;
        g.userData.scale = 1.05;
        return g;
      },
      hourglass: function () {
        var g = new THREE.Group(), wood = toon('orange'), sand = toon('lantern');
        [-1, 1].forEach(function (sy) {
          var p = mesh(extrude(roundedRect(0.86, 0.12, 0.05), 0.4, 0.04), wood, 0.04); p.position.y = sy * 0.52; g.add(p);
        });
        [-1, 1].forEach(function (sx) {
          var c = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.96, 12), wood, 0.03); c.position.set(sx * 0.36, 0, 0.1); g.add(c);
        });
        var top = mesh(new THREE.ConeGeometry(0.24, 0.3, 24), sand, 0.03); top.rotation.x = Math.PI; top.position.y = 0.2; g.add(top);
        var bottom = mesh(new THREE.ConeGeometry(0.26, 0.2, 24), sand, 0.03); bottom.position.y = -0.36; g.add(bottom);
        var stream = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 8), sand); stream.position.y = -0.14; g.add(stream);
        var glass = new THREE.Mesh(new THREE.LatheGeometry([
          new THREE.Vector2(0.04, -0.46), new THREE.Vector2(0.3, -0.42), new THREE.Vector2(0.33, -0.2), new THREE.Vector2(0.07, 0),
          new THREE.Vector2(0.33, 0.2), new THREE.Vector2(0.3, 0.42), new THREE.Vector2(0.04, 0.46)
        ], 32), toon('skyLight', { transparent: true, opacity: 0.35, depthWrite: false }));
        g.add(outline(glass, 0.035));
        g.userData.top = top; g.userData.bottom = bottom; g.userData.stream = stream;
        g.userData.scale = 1.05;
        return g;
      },
      repeat: function () {
        var g = new THREE.Group(), mat = toon('white');
        var arc = mesh(new THREE.TorusGeometry(0.42, 0.11, 14, 48, Math.PI * 1.5), mat, 0.045); g.add(arc);
        var head = mesh(new THREE.ConeGeometry(0.24, 0.34, 24), mat, 0.045);
        head.rotation.z = -Math.PI / 2; head.position.set(0.1, -0.42, 0); g.add(head);
        var dotMat = toon('coral');
        [-0.16, 0, 0.16].forEach(function (x) {
          var d = mesh(new THREE.SphereGeometry(0.065, 14, 10), dotMat, 0.025); d.position.set(x, 0.02, 0.1); g.add(d);
        });
        g.userData.arc = arc; g.userData.head = head;
        g.userData.scale = 1.05;
        return g;
      },
      heart: function () {
        var g = new THREE.Group();
        var h = mesh(extrude(SHAPES.heart(), 0.3, 0.08, 28), toon('coral'), 0.05); h.scale.setScalar(1.08); g.add(h);
        var hl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.scale.set(1.7, 0.8, 0.4); hl.position.set(-0.3, 0.3, 0.26); hl.rotation.z = 0.6; g.add(hl);
        g.userData.scale = 1;
        return g;
      },
      bulb: function () {
        var g = new THREE.Group(), glassMat = toon('lantern');
        var glass = mesh(new THREE.SphereGeometry(0.4, 32, 22), glassMat, 0.045); glass.position.y = 0.16; g.add(glass);
        var neck = mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.24, 24), glassMat, 0.04); neck.position.y = -0.2; g.add(neck);
        var base = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 24), toon('white'), 0.04); base.position.y = -0.42; g.add(base);
        [-0.36, -0.46].forEach(function (y) {
          var r = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.025, 8, 28), toon('plate')); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r);
        });
        var tip = mesh(new THREE.SphereGeometry(0.08, 14, 10), toon('navy')); tip.position.y = -0.57; g.add(tip);
        var hl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.scale.set(1.5, 0.8, 0.4); hl.position.set(-0.18, 0.34, 0.33); hl.rotation.z = 0.7; g.add(hl);
        var rays = new THREE.Group();
        for (var i = 0; i < 5; i++) {
          var a = Math.PI / 2 + (i - 2) * 0.55, r = capsule(0.035, toon('white'), 0.02);
          r.setLength(0.16); r.position.set(Math.cos(a) * 0.58, 0.16 + Math.sin(a) * 0.58, 0); r.rotation.z = a; rays.add(r);
        }
        g.add(rays);
        g.userData.glassMat = glassMat; g.userData.rays = rays;
        g.userData.scale = 1;
        return g;
      },
      star: function () {
        var g = new THREE.Group();
        g.add(mesh(extrude(star(5, 0.64, 0.3), 0.22, 0.07, 6), toon('lantern'), 0.05));
        var face = toon('navy');
        [-1, 1].forEach(function (sx) {
          var e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), face); e.scale.set(1, 1.7, 0.6); e.position.set(sx * 0.12, 0.06, 0.2); g.add(e);
          var c = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), toon('pink')); c.scale.set(1.3, 0.8, 0.4); c.position.set(sx * 0.22, -0.06, 0.19); g.add(c);
        });
        var smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 8, 20, Math.PI), face);
        smile.rotation.z = Math.PI; smile.position.set(0, -0.04, 0.2); g.add(smile);
        g.userData.scale = 1;
        return g;
      }
    };

    // ================= Merke =================
    function createBadge(container, opts) {
      opts = opts || {};
      var kindKey = BADGE_KINDS[opts.kind] ? opts.kind : 'thumbDown', kind = BADGE_KINDS[kindKey];

      var root = document.createElement('div');
      root.className = 'ggui ggui-badge';
      root.setAttribute('role', 'img');
      container.appendChild(root);
      var stage = makeStage(root, { cx: 0, cy: 0, w: 3.4, h: 3.4 });
      var caption = null;
      if (opts.caption !== false) { caption = document.createElement('div'); caption.className = 'ggui-badge__caption'; root.appendChild(caption); }

      var pivot = new THREE.Group(); stage.scene.add(pivot);

      // Solstråler og glød bak medaljongen
      var shapes = [];
      for (var i = 0; i < 14; i++) {
        var a = i / 14 * TAU, w = 0.11, s = new THREE.Shape();
        s.moveTo(0, 0); s.lineTo(Math.cos(a - w) * 1.42, Math.sin(a - w) * 1.42); s.lineTo(Math.cos(a + w) * 1.42, Math.sin(a + w) * 1.42); s.closePath();
        shapes.push(s);
      }
      var raysMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false });
      var rays = new THREE.Mesh(new THREE.ShapeGeometry(shapes), raysMat); rays.position.z = -0.4; pivot.add(rays);
      var glow = sprite(softTex); glow.visible = true; glow.position.z = -0.5; glow.scale.set(2.9, 2.9, 1); pivot.add(glow);

      var medMat = toon(kind.color);
      pivot.add(mesh(extrude(burst(12, 1.0, 0.07), 0.28, 0.07), medMat, 0.05));
      var discGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.14, 56); discGeo.rotateX(Math.PI / 2);
      var disc = new THREE.Mesh(discGeo, toon('navy')); disc.position.z = 0.22; pivot.add(disc);
      var ringMat = toon('white');
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.055, 12, 72), ringMat); ring.position.z = 0.29; pivot.add(ring);

      var wrap = new THREE.Group(), gest = new THREE.Group(), emblem = null;
      wrap.add(gest); wrap.position.z = 0.5; pivot.add(wrap);

      var confetti = particles(stage.scene, 30, new THREE.BoxGeometry(0.16, 0.08, 0.03), 0.015);
      var sonar = rings(stage.scene, 3, 1.0, 0.035);
      var flashS = sprite(glintTex); stage.scene.add(flashS); flashS.position.z = 1;
      var sparkles = [0, 1, 2].map(function () { var s = sprite(glintTex, 'white'); stage.scene.add(s); return { s: s, age: -1 }; });

      var sp = spring(240, 12, 0), squash = spring(300, 10, 0);
      var age = 1e6, hoverS = 1, sonarWait = 0.8, sparkleWait = 0.5, flashAge = -1;

      function disposeTree(o) {
        o.traverse(function (c) { if (c.geometry) c.geometry.dispose(); if (c.material && !c.material.userData.shared) c.material.dispose(); });
      }
      function applyKind() {
        kind = BADGE_KINDS[kindKey];
        medMat.color.set(hex(kind.color));
        if (emblem) { gest.remove(emblem); disposeTree(emblem); }
        emblem = BUILD[kind.build](opts);
        gest.add(emblem);
        wrap.rotation.z = kind.rz || 0;
        wrap.scale.setScalar(emblem.userData.scale || 1);
        if (emblem.userData.inner) emblem.userData.inner.scale.x = kind.mirror || 1;
        var text = opts.label || kind.label;
        root.setAttribute('aria-label', text);
        if (caption) caption.textContent = text;
        root.className = 'ggui ggui-badge ggui-badge--' + kindKey;
      }
      applyKind();

      function pop() {
        age = 0; sp.x = 0; sp.v = 0; sp.target = 1; squash.v = -10;
        flashAge = 0;
        sonar.fire(0, 0, 0.3, kind.color, { from: 0.6, to: 1.6, dur: 0.6, opacity: 1 });
        sonar.fire(0, 0, 0.3, 'white', { from: 0.4, to: 1.45, dur: 0.8, opacity: 0.8 });
        confetti.emit(0, 0, 0.7, [kind.color, 'lantern', 'white', 'sky', 'mint', 'pink'], reduced ? 10 : 28,
          { speed: 5, spread: TAU, dir: 0, up: 1.6, life: 1.2 });
        return api;
      }
      root.addEventListener('click', pop);

      function gesture(t) {
        gest.rotation.set(0, 0, 0); gest.position.set(0, 0, 0); gest.scale.setScalar(1);
        var u = emblem.userData, g0 = age - 0.55;
        if (g0 < 0 && kind.gesture !== 'bjarne') return;
        var loop = function (period) { return idle ? g0 % period : Math.min(g0, period - 0.001); };
        switch (kind.gesture) {
          case 'wag': {           // "Nei, nei!" – tommelen vifter og dupper
            var c = loop(2.6), amp = Math.exp(-c * 1.8);
            gest.rotation.z = 0.5 * Math.sin(c * 15) * amp;
            gest.position.y = -0.12 * blip(c, 0.35);
            gest.scale.setScalar(1 + 0.12 * blip(c, 0.3));
            break;
          }
          case 'poke': {          // Dytter tommelen framover, to ganger
            var cp = loop(2);
            gest.position.y = 0.4 * (blip(cp, 0.3) + 0.7 * blip(cp - 0.38, 0.3));
            gest.rotation.z = Math.sin(t * 3) * 0.1 * idle;
            break;
          }
          case 'hop': {
            var ch = loop(2.2);
            gest.position.y = 0.3 * blip(ch, 0.45) + 0.12 * blip(ch - 0.5, 0.3);
            gest.rotation.z = 0.2 * Math.sin(ch * 12) * Math.exp(-ch * 3);
            break;
          }
          case 'spinHop': {
            var cs = loop(3.2);
            gest.position.y = 0.25 * blip(cs, 0.6);
            gest.rotation.y = cs < 0.8 ? easeInOut(cs / 0.8) * TAU : 0;
            gest.scale.setScalar(1 + 0.1 * blip(cs - 0.7, 0.3));
            break;
          }
          case 'rumble': {        // Skyen skjelver, lynet blinker
            var cr = loop(2.2), on = cr < 0.9;
            gest.position.x = on ? (Math.random() - 0.5) * 0.08 : 0;
            gest.position.y = on ? (Math.random() - 0.5) * 0.05 : 0;
            u.bolt.visible = !on || Math.sin(cr * 60) > -0.3;
            u.bolt.scale.setScalar(0.62 * (1 + 0.35 * blip(cr, 0.25)));
            u.bolt.material.emissive.setScalar(on ? 0.35 : 0);
            u.cloud.scale.set(1 + 0.05 * blip(cr, 0.25), 1 - 0.05 * blip(cr, 0.25), 1);
            break;
          }
          case 'flip': {          // Sanden renner, så snus timeglasset
            var cf = loop(3.4), flow = Math.min(1, cf / 2.6);
            u.top.scale.setScalar(Math.max(0.05, 1 - flow * 0.85));
            u.bottom.scale.setScalar(0.35 + flow * 0.65);
            u.stream.visible = cf < 2.6;
            gest.rotation.z = cf > 2.6 ? easeOutBack(Math.min(1, (cf - 2.6) / 0.7)) * Math.PI : 0;
            break;
          }
          case 'loop': {
            var cl = loop(1.6);
            gest.rotation.z = (Math.floor(g0 / 1.6) + easeInOut(Math.min(1, cl / 0.7))) * TAU * 0.5 * (idle ? 1 : 0);
            gest.scale.setScalar(1 + 0.08 * blip(cl, 0.35));
            break;
          }
          case 'swing': {         // Lykta svinger rolig, og flammen blafrer
            u.swing.rotation.z = 0.28 * Math.sin(t * 2.1) * idle + 0.4 * Math.sin(g0 * 9) * Math.exp(-g0 * 2);
            var fl = 0.7 + 0.3 * Math.sin(t * 23) * Math.sin(t * 7.3);
            u.flame.scale.set(1 - 0.1 * fl, 1.5 + 0.4 * fl, 1);
            u.flameMat.emissive.set(hex('orange')).multiplyScalar(0.5 + 0.5 * fl);
            u.glassMat.emissive.set(hex('lantern')).multiplyScalar(0.25 + 0.3 * fl);
            break;
          }
          case 'dash': {          // Viseren spinner, klokka spurter framover
            var cd = loop(2.4), burst = Math.min(1, cd / 0.9);
            u.hand.rotation.z = cd < 0.9 ? -easeInOut(burst) * TAU * 2 : -Math.floor((cd - 0.9) * 3) * TAU / 12;
            gest.position.x = 0.14 * blip(cd, 0.9);
            gest.rotation.z = -0.12 * blip(cd, 0.9);
            u.lines.children.forEach(function (c, i) { c.setLength(c.userData.len * (0.4 + 1.2 * blip(cd - i * 0.05, 0.9))); });
            break;
          }
          case 'search': {        // Forstørrelsesglasset leter, og øyet følger med
            var cs2 = loop(3);
            gest.position.x = 0.14 * Math.cos(t * 2.4) * idle;
            gest.position.y = 0.08 * Math.sin(t * 4.8) * idle;
            u.pupil.position.x = 0.09 * Math.cos(t * 2.4 + 0.6);
            u.pupil.position.y = 0.06 * Math.sin(t * 4.8 + 0.6);
            u.lens.scale.setScalar(1 + 0.3 * blip(cs2 - 2, 0.6));
            break;
          }
          case 'calm': {          // Fra storm til stille: bølgene flater ut
            var cc = loop(4.5), storm = cc < 1.4 ? 1 : Math.max(0, 1 - (cc - 1.4) / 1.2);
            var amp = 0.45 + storm * 1.1, speed = 2 + storm * 5;
            u.bands.forEach(function (b, i) {
              b.scale.y = amp;
              b.position.x = (0.05 + storm * 0.1) * Math.sin(t * speed + i * 1.3);
            });
            u.boat.rotation.z = (0.08 + storm * 0.35) * Math.sin(t * speed);
            u.boat.position.y = 0.3 + 0.06 * amp + 0.05 * storm * Math.sin(t * speed * 1.3);
            break;
          }
          case 'flicker': {       // Flammen blafrer, tallet spretter
            var cfl = loop(2.5);
            u.fg.scale.set(1 - 0.05 * Math.sin(t * 13), 1 + 0.09 * Math.sin(t * 13) + 0.05 * Math.sin(t * 29), 1);
            u.fg.rotation.z = 0.08 * Math.sin(t * 5);
            u.mid.scale.setScalar(0.62 * (1 + 0.1 * Math.sin(t * 17)));
            u.tag.scale.setScalar(1 + 0.35 * blip(cfl, 0.35));
            u.tag.rotation.z = 0.25 * blip(cfl, 0.35) * Math.sin(cfl * 30);
            break;
          }
          case 'skeptic': {       // Løfter øyenbrynet, lener seg bakover og ruller med øynene
            var ck = loop(3.4);
            u.brow.position.y = 0.3 + 0.08 * blip(ck, 0.35) + 0.08 * blip(ck - 0.45, 0.35);
            gest.rotation.z = -0.2 * blip(ck - 0.2, 1.6);
            var roll = ck > 1 && ck < 2 ? (ck - 1) * TAU : 0;
            u.pupils.forEach(function (p) {
              p.position.x = p.userData.base + (roll ? 0.04 * Math.cos(roll + Math.PI / 2) : 0.03);
              p.position.y = 0.12 + (roll ? 0.035 * Math.sin(roll + Math.PI / 2) : 0.02);
            });
            u.q.scale.setScalar(Math.max(0.001, blip(ck - 0.3, 2.2) > 0 ? Math.min(1, (ck - 0.3) * 5) * (1 + 0.15 * Math.sin(t * 8)) : 0));
            break;
          }
          case 'bjarne': {        // Sur Bjarne: glaner, grynter, rister på hodet og drikker kaffe uten å bli blidere
            var cj = t % 7, pt = stage.pointer, noCoffee = u.cups <= 0;
            var fury = noCoffee ? 1 : 0.35 + 0.25 * blip(cj - 1, 1.3);       // hvor sint han er akkurat nå
            var grunt = blip(cj - 5.6, 0.9);                                  // «hmpf»: rister på hodet
            u.head.rotation.y += ((pt.inside ? pt.x * 0.35 : Math.sin(t * 0.5) * 0.12) - u.head.rotation.y) * 0.1;
            u.head.rotation.y += Math.sin(t * 22) * 0.12 * grunt;
            u.head.rotation.x += ((pt.inside ? -pt.y * 0.2 : 0.08) - u.head.rotation.x) * 0.1;
            u.head.rotation.z = Math.sin(t * 1.1) * 0.04 * idle + (noCoffee ? Math.sin(t * 40) * 0.015 : 0);
            // Blunk og glaning
            var blink = (t % 4.3) < 0.12 ? 1 : 0;
            u.lids.forEach(function (l) {
              l.rotation.x = blink ? 1.45 : l.userData.base + 0.35 * fury;
              l.rotation.z = l.userData.sx * (0.3 + 0.15 * fury);
            });
            u.pupils.forEach(function (p) {
              p.position.x = p.userData.base + (pt.inside ? pt.x * 0.035 : 0.025 * Math.sin(t * 0.7));
              p.position.y = 0.01 + (pt.inside ? pt.y * 0.02 : -0.005);
              p.visible = !blink;
            });
            // Øyenbryn: skrå og senket, det høyre løftes skeptisk innimellom («om du tør»)
            var sneer = noCoffee ? 0 : blip(cj - 2.4, 1.1);
            u.brows.forEach(function (br, n) {
              var sx = n === 0 ? -1 : 1;
              br.rotation.z = br.userData.rot * (1 + 0.35 * fury) - (n === 1 ? sneer * 0.75 : 0);
              br.position.y = br.userData.base - 0.03 * fury + (n === 1 ? 0.08 * sneer : 0) + Math.sin(t * 30) * 0.006 * grunt;
              br.position.x = sx * (0.16 - 0.02 * fury);
            });
            // Munnen: sur bue, blir bare flat etter en slurk
            var sip = u.cups > 0 ? blip(cj - 3.2, 1.6) : 0, sm = Math.min(1, sip * 1.6);
            var relief = blip(cj - 4.7, 0.9);
            u.mouth.scale.set(1 - 0.15 * fury + 0.1 * relief, Math.max(0.15, 0.7 + 0.25 * fury - 0.55 * relief), 1);
            u.mouth.rotation.z = 0.12 + 0.1 * Math.sin(t * 1.7) * idle;
            // Røde kinn og damp ut av ørene når det koker
            u.cheekMat.opacity = 0.25 + 0.55 * fury;
            u.skin.emissive.set(hex('coral')).multiplyScalar(noCoffee ? 0.28 + 0.12 * Math.sin(t * 6) : 0.04 * fury);
            var steaming = noCoffee || grunt > 0;
            u.puffs.forEach(function (pf) {
              var k = (t * 0.9 + pf.userData.phase) % 1;
              pf.position.set(pf.userData.sx * (0.5 + k * 0.25), 0.02 + k * 0.3, 0);
              pf.scale.setScalar(0.5 + k * 1.3);
              pf.material.opacity = steaming ? 0.75 * (1 - k) : 0;
            });
            // Kaffe
            u.mug.position.set(u.mugHome.x - 0.2 * sm, u.mugHome.y + 0.36 * sm, u.mugHome.z + 0.08 * sm);
            u.mug.rotation.z = 0.7 * sm + (noCoffee ? 0.15 * Math.sin(t * 3) : 0);
            u.steam.forEach(function (st) {
              var k = (t * 0.6 + st.userData.phase) % 1;
              st.visible = u.cups > 0 && sm < 0.2;
              st.position.set(Math.sin(k * 9 + st.userData.phase * 5) * 0.04, 0.18 + k * 0.35, 0);
              st.scale.setScalar(0.6 + k); st.material.opacity = 0.6 * (1 - k);
            });
            u.coffee.visible = u.cups > 0;
            var gl = blip(t % 5 - 2, 0.5);
            u.glint.visible = gl > 0; u.glint.scale.set(gl * 0.3, gl * 0.3, 1);
            break;
          }
          case 'heartbeat': {
            var cb = loop(1.1);
            gest.scale.setScalar(1 + 0.2 * blip(cb, 0.18) + 0.12 * blip(cb - 0.24, 0.16));
            break;
          }
          case 'glow': {
            var cg = loop(2), fl = cg < 0.35 ? (Math.sin(cg * 70) > 0 ? 1 : 0.2) : 0.6 + 0.4 * Math.sin(t * 4);
            u.glassMat.emissive.set(hex('lantern')).multiplyScalar(0.55 * fl);
            u.rays.scale.setScalar(0.85 + 0.3 * fl);
            u.rays.visible = fl > 0.3;
            gest.position.y = 0.08 * blip(cg, 0.3);
            break;
          }
        }
      }

      var comp = {
        stage: stage,
        update: function (dt, t) {
          age += dt; sp.step(dt); squash.step(dt);
          hoverS += ((stage.pointer.inside ? 1.08 : 1) - hoverS) * Math.min(1, dt * 8);
          var breathe = 1 + Math.sin(t * 3) * 0.035 * idle;
          var sc = Math.max(0.0001, sp.x * hoverS * breathe);
          pivot.scale.set(sc * (1 - squash.x * 0.06), sc * (1 + squash.x * 0.06), sc);

          var tiltX = stage.pointer.inside ? -stage.pointer.y * 0.35 : 0, tiltY = stage.pointer.inside ? stage.pointer.x * 0.45 : 0;
          var spinY = age < 0.9 ? -TAU * (1 - easeOutBack(age / 0.9)) : 0;
          pivot.rotation.y = spinY + Math.sin(t * 0.9) * 0.18 * idle + tiltY;
          pivot.rotation.x += (tiltX - pivot.rotation.x) * Math.min(1, dt * 6);
          pivot.position.y = Math.sin(t * 1.6) * 0.06 * idle;

          rays.rotation.z += dt * 0.35 * (idle || 0);
          raysMat.opacity = (0.12 + 0.12 * (Math.sin(t * 2.2) * 0.5 + 0.5)) * Math.min(1, sp.x);
          glow.material.color.set(hex(kind.color));
          glow.material.opacity = (0.25 + 0.2 * (Math.sin(t * 3) * 0.5 + 0.5)) * Math.min(1, sp.x);
          ringMat.emissive.setScalar(0.25 * (Math.sin(t * 3) * 0.5 + 0.5) * idle);

          if (idle && sp.target > 0) {
            sonarWait -= dt;
            if (sonarWait <= 0) { sonarWait = 1.8; sonar.fire(0, pivot.position.y, 0.25, kind.color, { from: 1.0, to: 1.5, dur: 1.2, opacity: 0.7 }); }
            sparkleWait -= dt;
            if (sparkleWait <= 0) {
              sparkleWait = 0.45 + Math.random() * 0.6;
              var free = sparkles.filter(function (s) { return s.age < 0; })[0];
              if (free) { var an = Math.random() * TAU, rr = 0.95 + Math.random() * 0.45; free.s.position.set(Math.cos(an) * rr, Math.sin(an) * rr, 0.8); free.age = 0; }
            }
          }
          sparkles.forEach(function (s) {
            if (s.age < 0) return;
            s.age += dt; var k = s.age / 0.6;
            if (k > 1) { s.age = -1; s.s.visible = false; return; }
            s.s.visible = true; var z = Math.sin(k * Math.PI) * 0.35; s.s.scale.set(z, z, 1);
          });
          if (flashAge >= 0) {
            flashAge += dt; var fk = flashAge / 0.45;
            if (fk > 1) { flashAge = -1; flashS.visible = false; }
            else { flashS.visible = true; var fz = 0.5 + fk * 3.5; flashS.scale.set(fz, fz, 1); flashS.material.opacity = 1 - fk; }
          }

          gesture(t);
          confetti.update(dt, -6); sonar.update(dt);
          stage.render();
        }
      };
      register(comp);

      if (opts.autoPop !== false) setTimeout(pop, opts.delay || 0);

      var api = {
        el: root,
        pop: pop,
        show: function () { sp.target = 1; return api; },
        hide: function () { sp.target = 0; return api; },
        emblem: function () { return emblem; },
        setKind: function (k) { if (BADGE_KINDS[k]) { kindKey = k; applyKind(); pop(); } return api; },
        dispose: function () { comps.delete(comp); stage.dispose(); root.remove(); }
      };
      return api;
    }

    return {
      palette: P,
      barKinds: Object.keys(BAR_KINDS),
      badgeKinds: Object.keys(BADGE_KINDS),
      badgeLabels: Object.keys(BADGE_KINDS).reduce(function (o, k) { o[k] = BADGE_KINDS[k].label; return o; }, {}),
      createStatBar: createStatBar,
      createBadge: createBadge
    };
  }

  if (typeof module === 'object' && module.exports) module.exports = GjensidigeGameUI;
  global.GjensidigeGameUI = GjensidigeGameUI;
})(typeof window !== 'undefined' ? window : this);
