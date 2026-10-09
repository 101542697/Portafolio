/* Portada: portadas de revista (referencia étapes:) que pasan a una columna y abren un sidebar con el proyecto */
(function () {
  var D = window.HOME_DATA;
  var CASES = [
    { key: 'facturacion', href: 'casos/facturacion.html', name: 'Facturación', nameEn: 'Billing', num: '01', img: 'facturacion-page', client: 'Mercado Libre', kind: 'real', cat: ['E-commerce · Web + mobile', 'E-commerce · Web + mobile'], y: ['2024', '2024'] },
    { key: 'facturador', href: 'casos/facturador.html', name: 'Facturador / Emisor de facturas', nameEn: 'Facturador / Invoice creator', num: '02', img: 'facturador-page', client: 'Mercado Libre', kind: 'real', cat: ['E-commerce · Web', 'E-commerce · Web'], y: ['2025', '2025'] },
    { key: 'tarjeta', href: 'casos/tarjeta-credito.html', name: 'Tarjeta de crédito', nameEn: 'Credit Card', num: '03', img: 'tarjeta-page', client: 'Mercado Pago', kind: 'concepto', cat: ['Fintech · Mobile', 'Fintech · Mobile'], y: ['Concepto', 'Concept'] },
    { key: 'emocion', href: 'casos/emocion-creativa.html', name: 'Emoción creativa', nameEn: 'Creative Emotion', num: '04', img: 'emocion', client: 'Emoción Creativa', kind: 'real', cat: ['Sitio web', 'Website'], y: ['2020', '2020'] },
    { key: 'sp', href: 'casos/sp-pro.html', name: 'SP-PRO', num: '05', img: 'sp', client: 'SP-PRO', kind: 'real', cat: ['E-commerce · Web', 'E-commerce · Web'], y: ['2020', '2020'] }
  ];
  var EASE = 'cubic-bezier(.2,.7,.2,1)', DUR = 720, STAGGER = 50;
  var home = document.getElementById('home'), rail = document.getElementById('rail-pv'), body = document.getElementById('pv-body'), scroller = document.getElementById('pv-scroll');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [], covers = [], flips = [], links = [], cur = -1, busy = false, lastOpener = null;
  function L() { return document.documentElement.dataset.lang === 'en' ? 1 : 0; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------- portada ---------- */
  CASES.forEach(function (c, i) {
    var item = document.createElement('div'); item.className = 'item';
    var fl = document.createElement('div'); fl.className = 'fl';
    var a = document.createElement('a'); a.className = 'cover cs cs-' + c.num; a.href = c.href; a.setAttribute('aria-label', c.name);
    /* caso: captura de la página real sobre negro; debajo, número · categoría y año, nombre con flecha, y el tipo de caso con el cliente (pill) */
    function sp(a) { return '<span lang="es">' + a[0] + '</span><span lang="en">' + a[1] + '</span>'; }
    a.innerHTML = '<span class="cs-media"><img src="assets/img/cover/' + c.img + '.jpg" alt="" loading="lazy" decoding="async"></span>' +
      '<span class="sello" aria-hidden="true"><small><span lang="es">Caso</span><span lang="en">Case</span></small><b>' + c.num + '</b></span>' +
      '<span class="cs-meta"><span>' + c.num + ' · ' + sp(c.cat) + '</span><span>' + sp(c.y) + '</span></span>' +
      '<span class="cs-head"><span class="cs-name">' + (c.nameEn ? sp([c.name, c.nameEn]) : c.name) + '</span><span class="cs-arr" aria-hidden="true">→</span></span>' +
      '<span class="cs-tease"><span class="badge cs-kind"><span>' + (c.kind === 'real' ? sp(['Caso real', 'Real case']) : sp(['Caso conceptual', 'Conceptual case'])) + ' · ' + c.client + '</span></span></span>';
    /* la portada siempre entra al caso, también con el panel abierto; el ojo cambia el caso previsualizado */
    /* un solo botón de icono (más) abre la previsualización: sin texto repetido */
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pv-open'; b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><span class="sr"><span lang="es">Previsualizar ' + c.name + '</span><span lang="en">Preview ' + c.name + '</span></span>';
    b.addEventListener('click', function () { if (home.classList.contains('is-open')) select(i); else openRail(i, b); });
    fl.appendChild(a); fl.appendChild(b); item.appendChild(fl); home.insertBefore(item, rail); items.push(item); covers.push(a); flips.push(fl); links.push(b);
  });

  /* ---------- contenido del sidebar: el recorrido (scroll) por el proyecto real ---------- */
  var W = 1280, SPEED = 170, PAUSE = 3200, pv = null;
  function stopPv() { if (pv) { cancelAnimationFrame(pv.raf); pv = null; } }
  function fit() {
    if (!pv) return; var w = pv.stage.clientWidth, h = pv.stage.clientHeight; pv.sc = w / W;
    pv.fr.style.transform = 'scale(' + pv.sc + ')'; pv.fr.style.height = Math.ceil(h / pv.sc) + 'px';
  }
  function showSeg(k) {
    var p = pv, d = p.doc; p.seg = k; p.y = 0;
    var t = d.querySelector('.tab[data-tab="' + p.segs[k].id + '"]'); if (t) t.click();
    p.win.scrollTo({ top: 0, behavior: 'instant' });
    p.btns.forEach(function (b, n) { b.setAttribute('aria-current', n === k ? 'true' : 'false'); p.fills[n].style.width = n < k ? '100%' : '0'; });
  }
  function startPv(i) {
    var c = CASES[i], tabbed = !!(D[c.key].A && D[c.key].B), segs = tabbed ? [{ id: 'producto', n: ['Producto', 'Product'] }, { id: 'visual', n: ['Visual', 'Visual'] }] : [{ id: '', n: ['Proyecto', 'Project'] }];
    var stage = body.querySelector('.pstage'), fr = document.createElement('iframe');
    fr.setAttribute('tabindex', '-1'); fr.setAttribute('aria-hidden', 'true'); fr.title = c.name; fr.src = c.href;
    stage.insertBefore(fr, stage.firstChild);
    var btns = [].slice.call(body.querySelectorAll('.pv-track button')), fills = btns.map(function (b) { return b.querySelector('b'); });
    pv = { stage: stage, fr: fr, segs: segs, btns: btns, fills: fills, seg: 0, y: 0, sc: 1, hold: performance.now() + 900, guard: performance.now() + 2500, last: 0, raf: 0, doc: null, win: null };
    var p = pv;
    new ResizeObserver(fit).observe(stage); fit();
    fr.addEventListener('load', function () {
      if (pv !== p) return;
      p.win = fr.contentWindow; p.doc = fr.contentDocument;
      var s = p.doc.createElement('style'); s.textContent = '.topbar,.tabs-bar,footer,.lb{display:none!important}html{scroll-behavior:auto!important;scrollbar-width:none}'; p.doc.head.appendChild(s);
      p.doc.documentElement.setAttribute('data-lang', document.documentElement.dataset.lang);
      showSeg(0); p.hold = performance.now() + 900; p.last = performance.now();
      if (!reduce) p.raf = requestAnimationFrame(loop);
    });
    function max() { return Math.max(0, p.doc.documentElement.scrollHeight - p.win.innerHeight); }
    function paint() { var m = max(); p.fills[p.seg].style.width = (m ? Math.min(100, p.y / m * 100) : 100) + '%'; }
    function loop(now) {
      if (pv !== p) return;
      var dt = Math.min(64, now - p.last); p.last = now;
      if (now >= p.hold) {
        p.y += SPEED * dt / 1000; var m = max();
        if (p.y >= m) { p.y = m; p.win.scrollTo({ top: m, behavior: 'instant' }); paint(); p.hold = now + 1400; if (p.seg < p.segs.length - 1) showSeg(p.seg + 1); else { showSeg(0); p.hold = now + 1400; } }
        else p.win.scrollTo({ top: p.y, behavior: 'instant' });
        paint();
      }
      p.raf = requestAnimationFrame(loop);
    }
    p.hit = body.querySelector('.hit');
    p.hit.addEventListener('wheel', function (e) {
      if (!p.win) return; e.preventDefault(); p.y = Math.max(0, Math.min(max(), p.y + e.deltaY / Math.max(.3, p.sc) * .6)); p.win.scrollTo({ top: p.y, behavior: 'instant' }); paint(); p.hold = performance.now() + PAUSE;
    }, { passive: false });
    btns.forEach(function (b, k) { b.addEventListener('click', function () { if (!p.doc) return; showSeg(k); p.hold = performance.now() + 900; }); });
  }
  function render(i) {
    var c = CASES[i], d = D[c.key], tabbed = !!(d.A && d.B); cur = i; stopPv();
    document.getElementById('pv-no').textContent = c.num; document.getElementById('pv-title').innerHTML = c.nameEn ? '<span lang="es">' + esc(c.name) + '</span><span lang="en">' + esc(c.nameEn) + '</span>' : esc(c.name); document.getElementById('pv-open').href = c.href;
    var labels = tabbed ? [['Producto', 'Product'], ['Visual', 'Visual']] : [['Proyecto', 'Project']];
    body.innerHTML = '<div class="pv-stage"><div class="pstage"><a class="hit" href="' + c.href + '" aria-label="' + esc(c.name) + '"></a></div><div class="pv-track">' +
      labels.map(function (l) { return '<button type="button"><span>' + l[L()] + '</span><i><b></b></i></button>'; }).join('') + '</div></div>';
    items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); links[k].setAttribute('aria-current', k === i ? 'true' : 'false'); });
    scroller.scrollTop = 0; startPv(i);
  }
  function select(i) {
    if (i === cur || busy) return;
    if (!reduce) body.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE });
    render(i);
  }

  new MutationObserver(function () { if (pv && pv.doc) pv.doc.documentElement.setAttribute('data-lang', document.documentElement.dataset.lang); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  /* ---------- FLIP: cada casete viaja de su lugar a la columna sin saltos ---------- */
  function flip(change) {
    var first = flips.map(function (it) { return it.getBoundingClientRect(); });
    change();
    var last = flips.map(function (it) { return it.getBoundingClientRect(); });
    if (reduce) return 0;
    flips.forEach(function (it, k) {
      var dx = first[k].left - last[k].left, dy = first[k].top - last[k].top, s = first[k].width / last[k].width;
      it.style.transformOrigin = '0 0';
      var an = it.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }, { transform: 'translate(0,0) scale(1)' }], { duration: DUR, easing: EASE, delay: k * STAGGER, fill: 'backwards' });
      an.onfinish = function () { it.style.transformOrigin = ''; };
    });
    return DUR + STAGGER * (items.length - 1);
  }
  function openRail(i, opener) {
    if (busy || home.classList.contains('is-open')) return; busy = true; lastOpener = opener;
    var total = flip(function () {
      home.classList.add('is-open'); document.documentElement.classList.add('rail-open'); window.scrollTo({ top: 0, behavior: 'instant' }); render(i);
      links.forEach(function (l) { l.setAttribute('aria-expanded', 'true'); });
    });
    if (!reduce) rail.animate([{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 260, easing: EASE, fill: 'backwards' });
    setTimeout(function () { busy = false; document.getElementById('pv-close').focus({ preventScroll: true }); }, total + 40);
  }
  function closeRail() {
    if (busy || !home.classList.contains('is-open')) return; busy = true;
    stopPv();
    var total = flip(function () {
      home.classList.remove('is-open'); document.documentElement.classList.remove('rail-open'); cur = -1;
      items.forEach(function (it) { it.classList.remove('is-active'); });
      links.forEach(function (l) { l.setAttribute('aria-expanded', 'false'); l.removeAttribute('aria-current'); });
    });
    setTimeout(function () { busy = false; if (lastOpener) lastOpener.focus({ preventScroll: true }); }, total + 40);
  }
  /* el contenido del iframe no debe arrastrar el scroll de la portada mientras el sidebar está abierto */
  addEventListener('scroll', function () { if (pv && performance.now() < pv.guard && home.classList.contains('is-open') && window.scrollY) window.scrollTo({ top: 0, behavior: 'instant' }); }, { passive: true });
  scroller.addEventListener('scroll', function () { if (pv && performance.now() < pv.guard && scroller.scrollTop) scroller.scrollTop = 0; }, { passive: true });
  document.getElementById('pv-close').addEventListener('click', closeRail);
  addEventListener('keydown', function (e) {
    if (!home.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeRail();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); select(Math.min(CASES.length - 1, Math.max(0, cur + (e.key === 'ArrowDown' ? 1 : -1)))); }
  });
})();

/* Portada: pestañas «Casos de estudio» / «IA». No usan .tab/.panel (site.js las gobierna en los casos). */
(function () {
  var home = document.getElementById('home'), ia = document.getElementById('ia');
  var tabs = [].slice.call(document.querySelectorAll('.pg-tab'));
  if (!home || !ia || !tabs.length) return;
  function show(v, focus) {
    tabs.forEach(function (t) { var on = t.dataset.v === v; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    home.classList.toggle('is-ia', v === 'ia'); ia.hidden = v !== 'ia';
    try { history.replaceState(null, '', v === 'ia' ? '#ia' : location.pathname + location.search); } catch (e) {}
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      if (t.dataset.v === 'ia' && home.classList.contains('is-open')) { document.getElementById('pv-close').click(); setTimeout(function () { show('ia'); }, 1100); return; }
      show(t.dataset.v);
    });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length].dataset.v, true);
    });
  });
  if (location.hash === '#ia') show('ia');
})();

