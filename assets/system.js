/* Sistema de diseño: casos (diff de propiedades), componente por dentro e idioma */
(function () {
  var IMG = '../assets/img/fact/', V = '?v=20';
  function sp(es, en) { return '<span lang="es">' + es + '</span><span lang="en">' + en + '</span>'; }

  /* ---------- PASO 1: casos ---------- */
  var root = document.getElementById('rc');
  if (root) (function () {
    var W = 1366, H = 768; // el escenario muestra solo el fold (1366×768), igual que el hero
    // los 4 "interruptores" (propiedades de variante) que definen cada caso
    var SW = [
      { k: ['Deuda', 'Debt'], p: ['Estado', 'State'], o: [['Vencido', 'Overdue'], ['Por vencer', 'Due soon'], ['Al día', 'Up to date']], lab: 'tl' },
      { k: ['En curso', 'Open month'], p: ['Estado', 'State'], o: [['Con cargos', 'With charges'], ['Sin cargos', 'No charges'], ['Sin cargos + saldo a favor', 'No charges + credit']], lab: 'tl' }
    ];
    // v = índice de la opción activa en cada interruptor; b = caja de cada componente en la pantalla
    var C = [
      { id: 'vencido', es: 'Vencido', en: 'Overdue', sit: ['Debe una factura vencida y no tiene débito automático.', 'Owes an overdue invoice and has no auto-debit.'], v: [0, 0], b: [[111, 205, 850, 136], [111, 373, 850, 80]], m: [[20,109,320,144],[20,285,321,140],[24,221,316,32]] },
      { id: 'porvencer', es: 'Por vencer', en: 'Due soon', sit: ['La factura vence pronto y no tiene débito automático.', 'The invoice is due soon and there is no auto-debit.'], v: [1, 0], b: [[111, 205, 850, 136], [111, 373, 850, 80]], m: [[20,109,320,144],[20,285,321,140],[24,221,316,32]] },
      { id: 'aldia', es: 'Al día', en: 'Up to date', sit: ['No debe nada y tiene un mes en curso con cargos.', 'Owes nothing and has an open month with charges.'], v: [2, 0], b: [[111, 205, 850, 129], [111, 366, 850, 80]], m: [[20,109,320,104],[20,245,321,140],[24,181,316,32]] },
      { id: 'noencurso', es: 'Sin mes en curso', en: 'No open month', sit: ['No debe nada y todavía no hay cargos en el mes en curso.', 'Owes nothing and there are no charges yet in the open month.'], v: [2, 1], b: [[111, 205, 850, 129], [111, 366, 850, 76]], m: [[20,109,320,104],[20,245,321,80],[24,181,316,32]] },
      { id: 'saldo', es: 'Saldo a favor', en: 'Credit balance', sit: ['No debe nada y tiene saldo a favor.', 'Owes nothing and has a credit balance.'], v: [2, 2], b: [[111, 205, 850, 129], [111, 366, 850, 94]], m: [[20,109,320,104],[20,245,321,96],[24,181,316,32]] }
    ];
    var tabs = root.querySelector('.rc-tabs'), stage = root.querySelector('.rc-stage'), btn = root.querySelector('[data-a=play]');
    var situ = document.createElement('p'); situ.className = 'rc-situ'; tabs.insertAdjacentElement('afterend', situ);
    var imgs = C.map(function (c) { var i = document.createElement('img'); i.src = IMG + 'casos/' + c.id + '.jpg' + V; i.alt = c.es; stage.appendChild(i); return i; });
    var boxes = SW.map(function (r) { var d = document.createElement('div'); d.className = 'rc-box ' + r.lab; d.innerHTML = '<i>' + sp(r.k[0], r.k[1]) + '</i>'; stage.appendChild(d); return d; });
    var phone = root.querySelector('.rc-phone');
    var pimgs = C.map(function (c) { var i = document.createElement('img'); i.src = IMG + 'mobile/' + c.id + '.jpg' + V; i.alt = c.es + ' · mobile'; phone.appendChild(i); return i; });
    var pboxes = SW.map(function () { var d = document.createElement('div'); d.className = 'rc-box'; phone.appendChild(d); return d; });
    function mpct(a) { return 'left:' + (a[0] / 360 * 100) + '%;top:' + (a[1] / 360 * 100) + 'cqw;width:' + (a[2] / 360 * 100) + '%;height:' + (a[3] / 360 * 100) + 'cqw'; }
    var tbtn = C.map(function (c, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = sp(c.es, c.en); b.addEventListener('click', function () { go(i, true); }); tabs.appendChild(b); return b; });
    var cur = 0, playing = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), timer = null, visible = false;
    function pct(a) { return 'left:' + (a[0] / W * 100) + '%;top:' + (a[1] / H * 100) + '%;width:' + (a[2] / W * 100) + '%;height:' + (a[3] / H * 100) + '%'; }
    function render(i) {
      var c = C[i], p = i > 0 ? C[i - 1] : null;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      pimgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      tbtn.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      situ.innerHTML = sp(c.sit[0], c.sit[1]);
      SW.forEach(function (r, n) {
        var ch = !!p && c.v[n] !== p.v[n];
        boxes[n].style.cssText = pct(c.b[n]); boxes[n].classList.toggle('chg', ch);
        pboxes[n].style.cssText = mpct(c.m[n]); pboxes[n].classList.toggle('chg', ch);
      });
    }
    function schedule() { clearTimeout(timer); if (!playing || !visible) return; timer = setTimeout(function () { go((cur + 1) % C.length); }, 4600); }
    function go(i, manual) { if (manual) { playing = false; clearTimeout(timer); upd(); } cur = i; render(i); if (!manual) schedule(); }
    function upd() { btn.innerHTML = playing ? sp('❚❚ Pausar', '❚❚ Pause') : sp('▶ Reproducir', '▶ Play'); }
    btn.addEventListener('click', function () { playing = !playing; upd(); if (playing) schedule(); else clearTimeout(timer); });
    function check() { var r = root.getBoundingClientRect(); var pnl = root.closest('.panel'); var shown = !pnl || pnl.classList.contains('on'); var v = shown && r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2 && !document.hidden; if (v === visible) return; visible = v; if (v) schedule(); else clearTimeout(timer); }
    addEventListener('scroll', check, { passive: true }); addEventListener('resize', check); document.addEventListener('visibilitychange', check);
    if (root.closest('.panel')) new MutationObserver(check).observe(root.closest('.panel'), { attributes: true, attributeFilter: ['class'] });
    upd(); go(0); setTimeout(check, 300);
  })();

  /* ---------- PASO 2: componente por dentro ---------- */
  var pv = document.getElementById('pv');
  if (pv) (function () {
    var D = [
      { k: ['Deuda', 'Debt'], n: '3', f: ['vencido, por vencer y al día', 'overdue, due soon and up to date'], props: [{ n: ['Estado', 'State'], o: [[['Vencido', 'Overdue'], 'vencido'], [['Por vencer', 'Due soon'], 'porvencer'], [['Al día', 'Up to date'], 'aldia']] }], file: function (s) { return 'deuda-' + s[0] + '-da1'; } },
      { k: ['En curso', 'Open month'], n: '4', f: ['4 estados', '4 states'], props: [{ n: ['Estado', 'State'], o: [[['Con cargos', 'With charges'], 'concargos'], [['Con cargos + saldo a favor', 'With charges + credit'], 'cargossaldo'], [['Sin cargos', 'No charges'], 'vacio'], [['Sin cargos + saldo a favor', 'No charges + credit'], 'vacio-saldo']] }], file: function (s) { return 'encurso-' + s[0]; } },
      { k: ['Débito automático', 'Auto-debit'], n: '6', f: ['estado × medio de pago, en la versión web neutra', 'state × payment method, in the neutral web version'], props: [{ n: ['Estado', 'State'], o: [[['Activo · tarjeta', 'Active · card'], 'activo-tarjeta'], [['Activo · Mercado Pago', 'Active · Mercado Pago'], 'activo-mp'], [['Por vencer · tarjeta', 'Due soon · card'], 'porvencer'], [['Con error · tarjeta', 'Error · card'], 'error'], [['Sin saldo · Mercado Pago', 'No balance · Mercado Pago'], 'sinsaldo'], [['No adherido', 'Not enrolled'], 'noadherido']] }], file: function (s) { return 'debito-' + s[0]; } },
      { k: ['Mes', 'Month'], n: '3', f: ['cerrado y expandido, más el estado sin meses', 'closed and expanded, plus the no-months state'], props: [{ n: ['Estado', 'State'], o: [[['Cerrado', 'Closed'], 'cerrado'], [['Expandido', 'Expanded'], 'expandido'], [['Sin meses', 'No months'], 'vacio']] }], file: function (s) { return 'mes-' + s[0]; } }
    ];
    var tabs = pv.querySelector('.pv-tabs'), view = pv.querySelector('.pv-view img'), props = pv.querySelector('.pv-props'), count = pv.querySelector('.pv-count');
    var tb = D.map(function (d, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = sp(d.k[0], d.k[1]); b.addEventListener('click', function () { pick(i); }); tabs.appendChild(b); return b; });
    var comp = 0, sel = [];
    function draw() { view.src = IMG + 'var/' + D[comp].file(sel.map(function (v, k) { return D[comp].props[k].o[v][1]; })) + '.png' + V; view.alt = D[comp].k[0]; }
    function pick(i) {
      comp = i; sel = D[i].props.map(function () { return 0; });
      tb.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      props.innerHTML = '';
      D[i].props.forEach(function (p, pi) { var g = document.createElement('div'); g.className = 'pv-prop'; g.innerHTML = '<b>' + sp(p.n[0], p.n[1]) + '</b><div class="pv-seg"></div>'; var seg = g.querySelector('.pv-seg');
        p.o.forEach(function (o, oi) { var b = document.createElement('button'); b.type = 'button'; b.innerHTML = sp(o[0][0], o[0][1]); b.setAttribute('aria-pressed', oi === 0); b.addEventListener('click', function () { sel[pi] = oi; [].forEach.call(seg.children, function (x, xi) { x.setAttribute('aria-pressed', xi === oi); }); draw(); }); seg.appendChild(b); });
        props.appendChild(g); });
      if (count) count.innerHTML = '';
      draw();
    }
    pick(0);
  })();

  /* ---------- PASO 3: idioma ---------- */
  var lg = document.getElementById('lg');
  if (lg) { var st = lg.querySelector('.lg-stage'); [].forEach.call(lg.querySelectorAll('.lg-sw button'), function (b) { b.addEventListener('click', function () { var es = b.dataset.l === 'es'; st.classList.toggle('es', es); [].forEach.call(lg.querySelectorAll('.lg-sw button'), function (x) { x.setAttribute('aria-pressed', x === b); }); }); }); }
})();
