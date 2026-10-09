/* Facturación · pestaña Visual: capturas reales de Figma + demostraciones interactivas.
   Todos los datos salen de la lectura de los archivos de Figma (Biblioteca Summary y archivo de flujos).
   Lo que no se pudo verificar no se simula: se muestra «Evidencia no disponible». */
(function () {
  var root = document.getElementById('visual'); if (!root) return;
  var IMG = '../assets/img/fact/figma/', V = '?v=5';
  var FILES = {"d-vencido-neutro-da":"png","sc-vencido-mobile":"png","sc-vencido-web":"png","set-deuda":"png","set-encurso":"jpg","set-mes":"jpg","spec-card-deuda":"png","spec-card-mes":"png","spec-medidas-entre-cards":"png"};
  var AD = '../assets/img/fact/ad/';
  function L() { return document.documentElement.dataset.lang === 'en' ? 1 : 0; }
  function sp(es, en) { return '<span lang="es">' + es + '</span><span lang="en">' + en + '</span>'; }
  function T(a) { return a[L()] || a[0]; }
  function src(n) { return FILES[n] ? IMG + n + '.' + FILES[n] + V : null; }
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var labels = [];
  function lab(node, attr, es, en) { labels.push([node, attr, es, en]); node.setAttribute(attr, L() ? en : es); }
  new MutationObserver(function () { labels.forEach(function (l) { l[0].setAttribute(l[1], L() ? l[3] : l[2]); }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  /* ---------- visor ---------- */
  function zoom(url, alt, w) {
    var lb = document.querySelector('.lb');
    if (!lb) { lb = el('div', 'lb', '<button type="button">ESC ✕</button><img alt="">'); document.body.appendChild(lb); lb.addEventListener('click', function () { lb.classList.remove('on'); }); }
    var im = lb.querySelector('img'); im.src = url; im.alt = alt || ''; im.style.maxWidth = w ? w + 'px' : ''; lb.classList.add('on');
  }
  function zoomable(img, w) { img.classList.add('vf-zoom'); img.tabIndex = 0; img.setAttribute('role', 'button'); img.addEventListener('click', function () { zoom(img.src, img.alt, w); }); img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(img.src, img.alt, w); } }); }

  /* ---------- control segmentado accesible ---------- */
  function seg(host, opts, cur, onChange, label) {
    host.className = (host.className + ' vf-seg').trim(); host.setAttribute('role', 'group'); if (label) lab(host, 'aria-label', label[0], label[1]);
    var btns = opts.map(function (o) {
      var b = el('button', '', sp(o.es, o.en)); b.type = 'button'; b.dataset.v = o.v;
      b.addEventListener('click', function () { set(o.v, true); });
      b.addEventListener('keydown', function (e) {
        var i = btns.indexOf(b), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
        e.preventDefault(); var n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click();
      });
      host.appendChild(b); return b;
    });
    function set(v, user) { cur = v; btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === v); }); if (onChange) onChange(v, user); }
    set(cur, false);
    return { set: set, get: function () { return cur; }, btns: btns };
  }
  function tabs(host, opts, cur, onChange, label) {
    host.className = (host.className + ' vf-tabs').trim(); host.setAttribute('role', 'tablist'); if (label) lab(host, 'aria-label', label[0], label[1]);
    var btns = opts.map(function (o) {
      var b = el('button', '', (o.n ? '<b>' + o.n + '</b>' : '') + sp(o.es, o.en)); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.v = o.v;
      b.addEventListener('click', function () { set(o.v); });
      b.addEventListener('keydown', function (e) {
        var i = btns.indexOf(b), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
        e.preventDefault(); var n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click();
      });
      host.appendChild(b); return b;
    });
    function set(v) { cur = v; btns.forEach(function (b) { var on = b.dataset.v === v; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; }); if (onChange) onChange(v); }
    set(cur);
    return { set: set, get: function () { return cur; } };
  }
  function empty(msgEs, msgEn) { return '<div class="vf-empty" role="status">' + sp(msgEs, msgEn) + '</div>'; }
  function fig(name, alt, cap, w) { var u = src(name); if (!u) return empty('Evidencia no disponible', 'Evidence not available'); return '<img src="' + u + '" alt="' + alt + '" loading="lazy">'; }

  /* ======================================================= 01 · HERO */
  (function () {
    var host = $('#vf-hero'); if (!host) return;
    host.innerHTML =
      '<div class="vf-duo"><figure class="vf-duo-d"><img src="' + src('sc-vencido-web') + '" alt=""><span class="vf-lab">Desktop</span></figure>' +
      '<figure class="vf-duo-m"><img src="' + src('sc-vencido-mobile') + '" alt=""><span class="vf-lab">Mobile</span></figure></div>' +
      '</div>';
    var im = $$('.vf-duo img', host);
    im[0].alt = T(['Summary desktop en estado vencido', 'Summary desktop, overdue state']); im[1].alt = T(['Summary mobile en estado vencido', 'Summary mobile, overdue state']);
    zoomable(im[0], 1500); zoomable(im[1], 520);
  })();
  /* ======================================================= 02 · COMPARADOR */
  (function () {
    var host = $('#vf-cmp'); if (!host) return;
    var W = 1588, H = 1032;
    function pc(r) { return 'left:' + (r[0] / W * 100) + '%;top:' + (r[1] / H * 100) + '%;width:' + (r[2] / W * 100) + '%;height:' + (r[3] / H * 100) + '%'; }
    var NOTES = [
      { n: '01', es: 'Estado general', en: 'General status', d: ['La situación de pago se comunica de forma diferenciada.', 'The payment situation is communicated in a differentiated way.'], b: [138, 168, 616, 282], a: [129, 122, 988, 150] },
      { n: '02', es: 'Períodos visibles', en: 'Visible periods', d: ['Los meses se muestran directamente en el Summary.', 'Months are shown directly in the Summary.'], b: [775, 168, 298, 282], a: [129, 309, 988, 393] },
      { n: '03', es: 'Información contextual', en: 'Contextual information', d: ['Cada período permite consultar información y documentos asociados.', 'Each period lets sellers check its information and associated documents.'], b: [138, 547, 457, 301], a: [129, 503, 988, 97] }
    ];
    host.innerHTML =
      '<div class="vf-cmp-stage" id="vf-cmp-stage">' +
      '<div class="vf-cmp-layer vf-cmp-b"><img src="' + AD + 'antes.jpg?v=1" alt="">' + NOTES.map(function (n, i) { return '<i class="vf-reg" data-i="' + i + '" style="' + pc(n.b) + '"></i>'; }).join('') + '<span class="vf-lab">' + sp('Antes', 'Before') + '</span></div>' +
      '<div class="vf-cmp-layer vf-cmp-a"><img src="' + AD + 'despues.jpg?v=1" alt="">' + NOTES.map(function (n, i) { return '<i class="vf-reg" data-i="' + i + '" style="' + pc(n.a) + '"></i>'; }).join('') + '<span class="vf-lab">' + sp('Después', 'After') + '</span></div>' +
      '</div>' +
      '<ol class="vf-notes" id="vf-cmp-notes"></ol>';
    var imgs = $$('.vf-cmp-layer img', host); imgs[0].alt = T(['Summary anterior', 'Previous Summary']); imgs[1].alt = T(['Summary nuevo con períodos visibles', 'New Summary with visible periods']);
    host.classList.add('is-stack');
    $$('.vf-cmp-layer img', host).forEach(function (im) { zoomable(im, 1600); });
    var sel = -1, list = $('#vf-cmp-notes');
    NOTES.forEach(function (n, i) {
      var li = el('li', '', '<button type="button" aria-pressed="false"><b>' + n.n + '</b><span class="t">' + sp(n.es, n.en) + '</span><span class="d">' + sp(n.d[0], n.d[1]) + '</span></button>');
      li.firstChild.addEventListener('click', function () { sel = sel === i ? -1 : i; paint(); });
      list.appendChild(li);
    });
    function paint() { $$('button', list).forEach(function (b, i) { b.setAttribute('aria-pressed', i === sel); }); $$('.vf-reg', host).forEach(function (r) { r.classList.toggle('on', +r.dataset.i === sel); }); }
    imgs.forEach(function (i) { i.addEventListener('dragstart', function (e) { e.preventDefault(); }); });
  })();

  /* ======================================================= 03 · ARQUITECTURA */
  var PROPS = {
    deuda: { name: 'Deuda', set: 'set-deuda', node: '3460:78247', n: 14 },
    mes: { name: 'Mes', set: 'set-mes', node: '3460:78296', n: 11 },
    encurso: { name: 'En curso', set: 'set-encurso', node: '3460:78372', n: 14 }
  };
  (function () {
    var host = $('#vf-arch'); if (!host) return;
    var LAY = [
      { v: 'l1', n: '1', es: 'Andes', en: 'Andes', kind: 'dep', d: ['Componentes y estilos corporativos existentes: botón Simple, Pill, íconos, Divider, tabs y los estilos de color y texto andes-*.', 'Existing corporate components and styles: Simple button, Pill, icons, Divider, tabs and the andes-* color and text styles.'], re: ['Reutilizado, no construido por mí.', 'Reused, not built by me.'],
        img: 'd-vencido-neutro-da', cap: ['Dentro de Deuda, el ícono de feedback y el botón Simple son instancias de Andes.', 'Inside Deuda, the feedback icon and the Simple button are Andes instances.'] },
      { v: 'l2', n: '2', es: 'Componentes de Facturación', en: 'Billing components', kind: 'own', d: ['Deuda, Mes y En curso, junto con Cargos y Pagos, Accesos, Débito automático, Datos de facturación, Número de meses, Pill de estado, Expandible y CTA.', 'Deuda, Mes and En curso, along with Cargos y Pagos, Accesos, Débito automático, Datos de facturación, Número de meses, status Pill, Expandible and CTA.'], re: ['Construido específicamente para Facturación, sobre Andes.', 'Built specifically for Billing, on top of Andes.'] },
      { v: 'l3', n: '3', es: 'Pantallas', en: 'Screens', kind: 'own', d: ['Summary (web) y Mobile: 12 variantes cada uno, con Site y Estado como propiedades, compuestos con instancias y configuraciones.', 'Summary (web) and Mobile: 12 variants each, with Site and Status as properties, composed with instances and configurations.'], re: ['Composición de las capas 1 y 2 en las pantallas web y mobile.', 'Composition of layers 1 and 2 into the web and mobile screens.'],
        img: 'sc-vencido-web', cap: ['Summary web en estado vencido, compuesto con instancias de los componentes anteriores.', 'Web Summary in overdue state, composed with instances of the components above.'] }
    ];
    host.innerHTML = '<p class="persona-q">' + sp('Elige una capa · cambia el detalle', 'Choose a layer · the detail changes') + '</p><div class="vf-arch-nav" id="vf-arch-nav"></div><div class="vf-arch-panel" id="vf-arch-panel"></div>';
    var nav = $('#vf-arch-nav'), panel = $('#vf-arch-panel'), cur = 'l2', comp = 'deuda';
    var tb = tabs(nav, LAY.map(function (l) { return { v: l.v, es: l.es, en: l.en, n: l.n }; }), cur, function (v) { cur = v; paint(); }, ['Capas de la arquitectura', 'Architecture layers']);
    nav.setAttribute('aria-orientation', 'horizontal');
    function ficha() {
      var p = PROPS[comp];
      return '<div class="vf-ficha"><div class="vf-ficha-head"><div id="vf-comp-seg"></div></div>' +
        '<div class="vf-ficha-grid"><figure class="vf-ficha-fig">' + fig(p.set, p.name, '') + '</figure>' +
        '</div></div>';
    }
    function paint() {
      var l = LAY.filter(function (x) { return x.v === cur; })[0];
      var h = '<div class="vf-arch-head"><h3>' + sp(l.es, l.en) + '</h3></div><p>' + sp(l.d[0], l.d[1]) + '</p><p class="vf-re">' + sp(l.re[0], l.re[1]) + '</p>';
      if (l.v === 'l2') h += ficha(); else if (l.img) h += '<figure class="vf-arch-fig">' + fig(l.img, T(l.cap), '') + '</figure>';
      panel.innerHTML = h; panel.setAttribute('role', 'tabpanel');
      if (l.v === 'l2') seg($('#vf-comp-seg'), [{ v: 'deuda', es: 'Deuda', en: 'Deuda' }, { v: 'mes', es: 'Mes', en: 'Mes' }, { v: 'encurso', es: 'En curso', en: 'En curso' }], comp, function (v, user) { comp = v; if (user) paint(); }, ['Componente', 'Component']);
      $$('img', panel).forEach(function (i) { zoomable(i, 2400); });
    }
    paint();
  })();

  /* ======================================================= 04 · EXPLORADOR DE ESPECIFICACIONES */
  (function () {
    var host = $('#vf-docs'); if (!host) return;
    var D = {
      componentes: [
        { f: 'spec-card-deuda', es: 'Card de deuda', en: 'Debt card', n: '8648:19120', c: ['Medidas, tokens de color y estilos de texto por elemento.', 'Measurements, color tokens and text styles per element.'], w: 1600 },
        { f: 'spec-card-mes', es: 'Card de mes', en: 'Month card', n: '8648:18646', c: ['Especificación del componente de mes con medidas y tokens.', 'Month component specification with measurements and tokens.'], w: 1600 },
        { f: 'spec-medidas-entre-cards', es: 'Medidas entre cards', en: 'Spacing between cards', n: '8648:19100', c: ['Espaciado entre las cards del Summary.', 'Spacing between the Summary cards.'], w: 1900 },
      ]
    };
    host.innerHTML = '<div class="vf-docs-body"><p class="persona-q">' + sp('Elige una especificación · cambia la lámina', 'Choose a specification · the sheet changes') + '</p><ul class="vf-docs-list" id="vf-docs-list"></ul><figure class="vf-docs-view" id="vf-docs-view" aria-live="polite"></figure></div>' +
      '<div class="vf-rule"><p>' + sp('«Se muestran tres meses, incluido el mes en curso, en cualquier casuística.»', '“Three months are shown, including the open month, in every scenario.”') + '</p><div class="vf-rule-fig"><img src="' + AD + 'despues.jpg?v=1" alt=""><i style="left:8.12%;top:30%;width:62.2%;height:38.1%"></i></div></div>';
    $('.vf-rule-fig img', host).alt = T(['Summary con tres meses visibles', 'Summary with three months visible']);
    var cur = 'componentes', idx = 0;
    function paint() {
      var items = D[cur], ul = $('#vf-docs-list'); ul.innerHTML = '';
      items.forEach(function (it, i) {
        var li = el('li', '', '<button type="button" aria-pressed="false"><b>' + (i + 1) + '</b><span class="t">' + sp(it.es, it.en) + '</span></button>');
        li.firstChild.addEventListener('click', function () { idx = i; show(); }); ul.appendChild(li);
      });
      show();
    }
    function show() {
      var it = D[cur][idx], u = src(it.f);
      $$('#vf-docs-list button').forEach(function (b, i) { b.setAttribute('aria-pressed', i === idx); });
      $('#vf-docs-view').innerHTML = (u ? '<img src="' + u + '" alt="" loading="lazy">' : empty('Evidencia no disponible', 'Evidence not available'));
      var im = $('#vf-docs-view img'); if (im) { im.alt = T([it.es, it.en]); zoomable(im, it.w); }
    }
    paint();
  })();
})();
