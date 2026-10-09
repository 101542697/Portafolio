/* JD·DS · documentación viva: lee los tokens de :root y mide los contrastes en el navegador */
(function () {
  var root = document.documentElement, cs = getComputedStyle(root);
  function tok(n) { return cs.getPropertyValue(n).trim(); }
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; }); }
  function lum(h) { var c = hex2rgb(h).map(function (v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function ratio(a, b) { var la = lum(a), lb = lum(b); if (la < lb) { var t = la; la = lb; lb = t; } return (la + 0.05) / (lb + 0.05); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sp(es, en) { return '<span lang="es">' + es + '</span><span lang="en">' + en + '</span>'; }

  /* — muestras de color — */
  function swatches(id, list) {
    var box = document.getElementById(id); if (!box) return;
    list.forEach(function (t) {
      var v = tok(t[0]);
      var s = el('div', 'swc');
      s.innerHTML = '<div style="background:var(' + t[0] + ')"></div><p><b>' + t[0] + '</b>' + v + '<br>' + sp(t[1], t[2]) + '</p>';
      box.appendChild(s);
    });
  }
  swatches('sw-base', [['--bg-0', 'página', 'page'], ['--bg-1', 'blanco: controles y muestras', 'white: controls and samples'], ['--bg-2', 'relleno de imagen', 'image fill'], ['--bg-3', 'hover y activo', 'hover and active'], ['--text-1', 'texto', 'text'], ['--text-2', 'texto secundario', 'secondary text'], ['--text-3', 'etiquetas', 'labels']]);
  swatches('sw-accent', [['--hl', 'resaltador: lo que cambió', 'highlighter: what changed'], ['--pen', 'tinta azul: informa', 'blue ink: informs'], ['--ok', 'hecho', 'fact'], ['--warn', 'hipótesis', 'hypothesis'], ['--bad', 'error', 'error']]);

  /* — contraste medido — */
  var tb = document.querySelector('#contrast tbody');
  if (tb) {
    var bgs = ['--bg-0', '--bg-1', '--bg-2', '--bg-3'];
    [['--text-1', 'Texto'], ['--text-2', 'Texto secundario'], ['--text-3', 'Etiquetas'], ['--pen', 'Tinta azul'], ['--ok', 'Hecho'], ['--warn', 'Hipótesis'], ['--bad', 'Error']].forEach(function (r) {
      var tr = el('tr'); tr.appendChild(el('td', '', r[1] + '<small>' + r[0] + ' · ' + tok(r[0]) + '</small>'));
      bgs.forEach(function (b) {
        var q = ratio(tok(r[0]), tok(b));
        var lvl = q >= 7 ? 'AAA' : q >= 4.5 ? 'AA' : 'no pasa';
        tr.appendChild(el('td', 'to', q.toFixed(1) + ':1<small>' + lvl + '</small>'));
      });
      tb.appendChild(tr);
    });
    var q2 = ratio(tok('--on-hl'), tok('--hl')), tr2 = el('tr');
    tr2.appendChild(el('td', '', 'Tinta sobre resaltador<small>--on-hl sobre --hl</small>'));
    tr2.appendChild(el('td', 'to', q2.toFixed(1) + ':1<small>' + (q2 >= 7 ? 'AAA' : 'AA') + '</small>'));
    tb.appendChild(tr2);
  }

  /* — escala tipográfica — */
  var ts = document.getElementById('type-scale');
  if (ts) {
    [['--fs-display', 'Display', 'var(--f-display)', 700], ['--fs-display-sm', 'Display compacto', 'var(--f-display)', 700], ['--fs-numeral', 'Numeral de etapa', 'var(--f-display)', 700], ['--fs-big', 'Frase de apertura', 'var(--f-display)', 600], ['--fs-stat', 'Cifra de dato', 'var(--f-display)', 700], ['--fs-h3', 'Título de sección', 'var(--f-display)', 600], ['--fs-h4', 'Título de bloque', 'var(--f-display)', 600], ['--fs-body', 'Cuerpo', 'var(--f-text)', 400], ['--fs-card', 'Cuerpo en bloque', 'var(--f-text)', 400], ['--fs-small', 'Texto pequeño', 'var(--f-text)', 400], ['--fs-label', 'Etiqueta mono', 'var(--f-mono)', 500]].forEach(function (r) {
      var row = el('div', 'type-row');
      row.innerHTML = '<code>' + r[0] + '</code><span style="font-family:' + r[2] + ';font-weight:' + r[3] + ';font-size:var(' + r[0] + ');line-height:1.2' + (r[0] === '--fs-label' ? ';letter-spacing:.06em;text-transform:uppercase' : '') + '">' + r[1] + '</span><em></em>';
      ts.appendChild(row);
      var probe = row.querySelector('span'); row.querySelector('em').textContent = Math.round(parseFloat(getComputedStyle(probe).fontSize)) + 'px';
    });
  }

  /* — espacio — */
  var sc = document.getElementById('space-scale');
  if (sc) {
    ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8', '--s-9'].forEach(function (n) {
      var px = Math.round(parseFloat(tok(n)) * 16);
      var r = el('div', 'bar'); r.innerHTML = '<span>' + n + '</span><i style="width:' + px + 'px"></i><em>' + px + '</em>'; sc.appendChild(r);
    });
  }
  /* — radios — */
  var rd = document.getElementById('radii');
  if (rd) {
    [['--r-sm', 'sm · tags, cajas'], ['--r-md', 'md · tarjetas, marcos'], ['--r-lg', 'lg · teléfonos'], ['--r-pill', 'pill · cápsulas']].forEach(function (r) {
      var d = el('div', 'rad'); d.innerHTML = '<div style="border-radius:var(' + r[0] + ')"></div>' + r[1] + '<br>' + tok(r[0]); rd.appendChild(d);
    });
  }

  /* — demo del control segmentado — */
  var seg = document.getElementById('demo-seg');
  if (seg) seg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    [].forEach.call(seg.children, function (x) { x.setAttribute('aria-selected', x === b); });
  });
})();
