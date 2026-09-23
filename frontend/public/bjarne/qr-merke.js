/*!
 * <qr-merke> — frittstående QR-merke uten avhengigheter.
 * Standardstørrelsen (72px) tilsvarer Bjarnes hode i headeren.
 *
 *   <script src="qr-merke.js"><\/script>
 *   <qr-merke></qr-merke>
 *   <qr-merke size="120px" text="Skann meg"></qr-merke>
 *   <qr-merke logo="bilder/logo.png"></qr-merke>      (bilde i stedet for tekst på lappen)
 *
 * Metoder: el.pop()  – spiller inngangen på nytt og lager ny kode
 *          el.newCode() – ny tilfeldig kode uten animasjon
 */
(function () {
  'use strict';
  if (customElements.get('qr-merke')) return;

  var CSS = [
    ':host{--navy:#060948;--outline:#02031C;--beam:#FF5A4D;--pill:#060948;display:inline-block;font-size:var(--qr-size,72px);width:1em;height:1.26em;position:relative;vertical-align:middle;-webkit-tap-highlight-color:transparent}',
    '.stage{position:absolute;inset:0;perspective:4em;cursor:pointer}',
    '.bob{position:absolute;inset:0;animation:bob 3.2s ease-in-out infinite}',
    '.tilt{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .25s cubic-bezier(.2,.8,.2,1)}',
    '.pop{position:absolute;inset:0;transform-style:preserve-3d}',
    '.pop.is-pop{animation:pop .7s cubic-bezier(.2,1.6,.4,1)}',
    '.card{position:absolute;left:0;top:0;width:1em;height:1em;background:#fff;border:.045em solid var(--outline);border-radius:.14em;box-shadow:0 .07em 0 var(--outline),inset 0 -.05em 0 rgba(6,9,72,.12);overflow:hidden;box-sizing:border-box}',
    '.card canvas{position:absolute;inset:.035em;width:calc(100% - .07em);height:calc(100% - .07em);image-rendering:pixelated;image-rendering:crisp-edges}',
    '.shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.75) 45%,transparent 60%);background-size:250% 100%;animation:shine 3.6s ease-in-out infinite;mix-blend-mode:screen;pointer-events:none}',
    '.beam{position:absolute;left:-.02em;right:-.02em;height:.03em;min-height:2px;background:var(--beam);box-shadow:0 0 .06em .02em var(--beam),0 0 .18em .05em rgba(255,90,77,.45);border-radius:1em;animation:scan 1.8s ease-in-out infinite alternate}',
    '.pillwrap{position:absolute;left:-.3em;right:-.3em;top:.95em;display:flex;justify-content:center;transform:translateZ(.05em);pointer-events:none}',
    '.pill{font:400 .17em/1 "Lilita One","Arial Black",system-ui,sans-serif;background:var(--pill);color:#fff;border:.14em solid var(--outline);border-radius:1em;padding:.18em .7em .24em;white-space:nowrap;box-shadow:0 .16em 0 var(--outline);animation:pill 2.5s ease-in-out infinite}',
    '.pill img{display:block;height:1em;width:auto}',
    '.bits{position:absolute;left:50%;top:50%;pointer-events:none}',
    '.bit{position:absolute;width:.09em;height:.05em;border-radius:.01em;border:.012em solid var(--outline);animation:fly .9s cubic-bezier(.2,.7,.3,1) forwards}',
    '@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-.03em)}}',
    '@keyframes pop{0%{transform:scale(0) rotateY(-360deg)}100%{transform:scale(1) rotateY(0)}}',
    '@keyframes scan{from{top:.06em}to{top:.9em}}',
    '@keyframes shine{0%,55%{background-position:120% 0}100%{background-position:-60% 0}}',
    '@keyframes pill{0%,86%,100%{transform:scale(1)}92%{transform:scale(1.12)}}',
    '@keyframes fly{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}}',
    '@media (prefers-reduced-motion:reduce){.bob,.shine,.pill,.beam{animation:none}.beam{top:.48em}.pop.is-pop{animation:none}.bit{display:none}}',
    ':host([static]) .bob,:host([static]) .shine,:host([static]) .pill,:host([static]) .beam{animation:none}:host([static]) .beam{top:.48em}'
  ].join('\n');

  // Tilfeldig, men tydelig QR-kode: 25 × 25 moduler med posisjonsmerker, tidslinjer og justeringsmerke
  function drawQR(canvas, color) {
    var N = 25, Q = 1, S = 8, size = (N + Q * 2) * S, r, c;
    var grid = [];
    for (r = 0; r < N; r++) { grid.push([]); for (c = 0; c < N; c++) grid[r].push(Math.random() < 0.5); }
    function finder(r0, c0) {
      for (var i = -1; i <= 7; i++) for (var j = -1; j <= 7; j++) {
        var rr = r0 + i, cc = c0 + j;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        var ring = Math.max(Math.abs(i - 3), Math.abs(j - 3));
        grid[rr][cc] = ring !== 2 && ring !== 4;
      }
    }
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    for (var k = 8; k < N - 8; k++) grid[6][k] = grid[k][6] = k % 2 === 0;
    for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) grid[18 + a][18 + b] = Math.max(Math.abs(a), Math.abs(b)) !== 1;
    grid[N - 8][8] = true;
    canvas.width = canvas.height = size;
    var x = canvas.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, size, size);
    x.fillStyle = color;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) if (grid[r][c]) x.fillRect((c + Q) * S, (r + Q) * S, S, S);
  }

  var COLORS = ['#FFC23D', '#FF5A4D', '#4F9DFF', '#8AF5C0', '#FF7EB6', '#FFFFFF'];

  class QrMerke extends HTMLElement {
    static get observedAttributes() { return ['size', 'text', 'logo', 'label']; }
    constructor() {
      super();
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + CSS + '</style>' +
        '<div class="stage" part="stage"><div class="bob"><div class="tilt"><div class="pop">' +
        '<div class="card" part="card"><canvas aria-hidden="true"></canvas><div class="shine"></div><div class="beam"></div></div>' +
        '<div class="pillwrap"><div class="pill" part="label"></div></div><div class="bits"></div>' +
        '</div></div></div></div>';
      this._canvas = root.querySelector('canvas');
      this._tilt = root.querySelector('.tilt');
      this._pop = root.querySelector('.pop');
      this._pill = root.querySelector('.pill');
      this._bits = root.querySelector('.bits');
      var self = this, stage = root.querySelector('.stage');
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width * 2 - 1, py = (e.clientY - r.top) / r.height * 2 - 1;
        self._tilt.style.transform = 'rotateY(' + (px * 22).toFixed(1) + 'deg) rotateX(' + (-py * 18).toFixed(1) + 'deg) scale(1.06)';
      });
      stage.addEventListener('pointerleave', function () { self._tilt.style.transform = ''; });
      stage.addEventListener('click', function () { self.pop(); });
      this._pop.addEventListener('animationend', function (e) { if (e.animationName === 'pop') self._pop.classList.remove('is-pop'); });
    }
    connectedCallback() {
      if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
      this._render();
      var self = this;
      requestAnimationFrame(function () { self.pop(); });
    }
    attributeChangedCallback() { if (this.isConnected) this._render(); }
    _render() {
      var size = this.getAttribute('size');
      if (size) this.style.setProperty('--qr-size', size); else this.style.removeProperty('--qr-size');
      var text = this.getAttribute('text') || 'Betal', logo = this.getAttribute('logo');
      this._pill.textContent = '';
      if (logo) {
        var img = document.createElement('img'); img.src = logo; img.alt = text; this._pill.appendChild(img);
      } else {
        this._pill.textContent = text;
      }
      this.setAttribute('aria-label', this.getAttribute('label') || ('QR-kode: ' + text));
      if (!this._drawn) { this.newCode(); this._drawn = true; }
    }
    newCode() { drawQR(this._canvas, getComputedStyle(this).getPropertyValue('--navy').trim() || '#060948'); return this; }
    pop() {
      this.newCode();
      this._pop.classList.remove('is-pop'); void this._pop.offsetWidth; this._pop.classList.add('is-pop');
      this._bits.textContent = '';
      for (var i = 0; i < 16; i++) {
        var b = document.createElement('span'), ang = Math.random() * Math.PI * 2, d = 0.45 + Math.random() * 0.35;
        b.className = 'bit';
        b.style.background = COLORS[i % COLORS.length];
        b.style.setProperty('--x', (Math.cos(ang) * d).toFixed(3) + 'em');
        b.style.setProperty('--y', (Math.sin(ang) * d - 0.1).toFixed(3) + 'em');
        b.style.setProperty('--r', ((Math.random() - 0.5) * 720).toFixed(0) + 'deg');
        b.style.animationDelay = (Math.random() * 0.08).toFixed(2) + 's';
        this._bits.appendChild(b);
      }
      var bits = this._bits;
      setTimeout(function () { bits.textContent = ''; }, 1200);
      return this;
    }
  }
  customElements.define('qr-merke', QrMerke);
})();
