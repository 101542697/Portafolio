/* Revisión de la pantalla actual: los errores de interfaz aparecen uno a uno (autoplay en bucle) */
(function () {
  var root = document.getElementById('rv'); if (!root) return;
  var W = 1588, H = 1032;
  var BOX = {
    A: [138, 168, 616, 282], Atxt: [160, 246, 560, 76], D: [1108, 168, 353, 410], Dbot: [1108, 512, 353, 66],
    Etxt: [138, 622, 457, 92], Elinks: [138, 729, 457, 120], Ftxt: [616, 622, 457, 88], Flinks: [616, 710, 457, 186],
    nav: [0, 0, 64, 720], all: [64, 96, 1524, 936]
  };
  var S = [
    { b: ['A'], es: ['Una card enorme para decir «estás al día»', 'Sin deuda, el espacio más grande de la pantalla solo comunica un estado y el summary parece vacío.'], en: ['A huge card to say "you’re up to date"', 'With no debt, the biggest space on the screen only communicates a status and the summary looks empty.'] },
    { b: ['Atxt'], es: ['No queda registro del último pago', 'Solo se aclara que está al día: no hay ningún acceso al último pago realizado.'], en: ['No record of the last payment', 'It only says you’re up to date: there is no access to the last payment made.'] },
    { b: ['A'], es: ['Con deuda, el único accionable es pagar', 'Hay varias consultas de vendedores que no entienden su deuda, y la card solo ofrece pagarla.'], en: ['With debt, the only action is paying', 'Several seller contacts come from not understanding their debt, and the card only offers to pay it.'] },
    { b: ['A', 'D'], es: ['Casi todo lo que se ve es estático', 'Para quien está al día o con débito automático, lo único útil de consultar a diario es el mes en curso.'], en: ['Almost everything you see is static', 'For users who are up to date or on auto-debit, the only thing worth checking daily is the open month.'] },
    { b: ['Elinks', 'Flinks'], fold: 710, es: ['Los accesos principales quedan fuera del primer vistazo', 'La línea marca lo que se ve sin hacer scroll: los accesos para descargar quedan debajo.'], en: ['Main entry points fall outside the first glance', 'The line marks what shows without scrolling: the download entry points sit below it.'] },
    { b: ['Etxt'], es: ['Mucho texto para decir que no hay nada nuevo', 'Se usa bastante espacio y carga cognitiva para avisar que no hay facturas por descargar.'], en: ['Lots of text to say nothing is new', 'It takes a lot of space and cognitive load to say there are no invoices to download.'] },
    { b: ['Elinks'], es: ['Tantos accesos que hace falta un texto que guíe', 'Como la card reúne varios accesos, se agrega una explicación de cuál usar para descargar los documentos.'], en: ['So many links a guiding text is needed', 'Since the card gathers several links, an explanation of which one to use to download documents is added.'] },
    { b: ['Etxt', 'Ftxt'], es: ['Avisos repartidos y sin criterio común', 'Los avisos de documentos disponibles están en dos cards y se comportan distinto: una indica cómo llegar a los archivos y la otra no.'], en: ['Notices split with no shared logic', 'Document-ready notices live in two cards and behave differently: one tells you how to reach the files and the other doesn’t.'] },
    { b: ['Flinks'], es: ['Accesos que pueden llevar a secciones vacías', 'Un vendedor sin impuestos ve igual tres accesos: el primero tiene sentido, los otros llevan a pantallas vacías.'], en: ['Links that can lead to empty sections', 'A seller with no taxes still sees three links: the first makes sense, the others lead to empty screens.'] },
    { b: ['Etxt'], badge: '×8', es: ['Ocho variantes de factura casi iguales', 'Hay alrededor de 8 casuísticas que hablan de facturas con cambios sutiles que el vendedor no distingue.'], en: ['Eight nearly identical invoice variants', 'There are around 8 cases talking about invoices, with subtle changes sellers can’t tell apart.'] },
    { b: ['D'], es: ['Más información de la que cabe y acciones que cambian por país', 'En algunos países la información supera lo pensado para el componente (ej. México) y las cards ofrecen distintos tipos de acción (Brasil).'], en: ['More information than fits, and actions that change by country', 'In some countries the information exceeds what the component was built for (e.g. Mexico) and cards offer different kinds of action (Brazil).'] }
  ];
  var STEP_MS = 4800;
  var ov = root.querySelector('.rv-ov');
  var cnt = root.querySelector('.rv-count'), ttl = root.querySelector('.rv-text h3'), det = root.querySelector('.rv-text p'), txt = root.querySelector('.rv-text');
  var segsEl = root.querySelector('.rv-segs'), num = root.querySelector('.rv-num');
  var btnPlay = root.querySelector('[data-a=play]');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idx = 0, timer = null, playing = !reduce, visible = false, started = false;

  function pct(a) { return 'left:' + (a[0] / W * 100) + '%;top:' + (a[1] / H * 100) + '%;width:' + (a[2] / W * 100) + '%;height:' + (a[3] / H * 100) + '%'; }
  function sp(es, en) { return '<span lang="es">' + es + '</span><span lang="en">' + en + '</span>'; }

  var boxes = S.map(function (s) {
    return s.b.map(function (k, j) {
      var d = document.createElement('div'); d.className = 'rv-box'; d.style.cssText = pct(BOX[k]);
      d.innerHTML = (s.badge && j === 0 ? '<em>' + s.badge + '</em>' : '');
      ov.appendChild(d); return d;
    });
  });
  var fold = document.createElement('div'); fold.className = 'rv-fold'; fold.style.top = (710 / H * 100) + '%';
  fold.innerHTML = '<span><span lang="es">Sin hacer scroll</span><span lang="en">Above the fold</span></span>'; ov.appendChild(fold);
  var segs = S.map(function (s, i) {
    var b = document.createElement('button'); b.className = 'rv-seg'; b.type = 'button';
    b.setAttribute('aria-label', (i + 1) + '. ' + s.es[0]);
    b.innerHTML = '<span class="rv-seg-fill"></span><span class="rv-tip"><span lang="es">' + s.es[0] + '</span><span lang="en">' + s.en[0] + '</span></span>';
    b.addEventListener('click', function () { go(i, true); });
    segsEl.appendChild(b); return b;
  });

  function render(i) {
    idx = i; var s = S[i];
    S.forEach(function (_, k) { boxes[k].forEach(function (b) { b.classList.toggle('now', k === i); }); });
    fold.classList.toggle('on', !!s.fold);
    segs.forEach(function (g, k) {
      var f = g.firstChild; g.classList.toggle('cur', k === i); g.classList.toggle('done', k < i);
      f.classList.remove('run'); f.style.setProperty('--dur', STEP_MS + 'ms'); f.style.transform = k < i ? 'scaleX(1)' : 'scaleX(0)';
    });
    num.textContent = String(i + 1).padStart(2, '0') + ' / ' + S.length;
    cnt.innerHTML = sp('Error ' + (i + 1) + ' de ' + S.length, 'Issue ' + (i + 1) + ' of ' + S.length);
    ttl.innerHTML = sp(s.es[0], s.en[0]); det.innerHTML = sp(s.es[1], s.en[1]);
    // reiniciar animación del texto
    txt.style.display = 'none'; void txt.offsetWidth; txt.style.display = '';
    if (playing && !reduce) { var f = segs[i].firstChild; void f.offsetWidth; f.classList.add('run'); f.style.transform = 'scaleX(1)'; }
    root.classList.toggle('is-paused', !playing);
  }
  function schedule() {
    clearTimeout(timer);
    if (!playing || !visible || reduce) return;
    timer = setTimeout(function () { go((idx + 1) % S.length); }, STEP_MS);
  }
  function go(i, manual) {
    if (manual) { playing = false; root.classList.add('is-paused'); clearTimeout(timer); }
    render(i); if (!manual) schedule();
  }
  root.querySelector('[data-a=prev]').addEventListener('click', function () { go((idx + S.length - 1) % S.length, true); });
  root.querySelector('[data-a=next]').addEventListener('click', function () { go((idx + 1) % S.length, true); });
  btnPlay.addEventListener('click', function () {
    playing = !playing; root.classList.toggle('is-paused', !playing);
    if (playing) { render(idx); schedule(); } else { clearTimeout(timer); var cf = segs[idx].firstChild; var w = cf.getBoundingClientRect().width / cf.parentNode.getBoundingClientRect().width; cf.classList.remove('run'); cf.style.transform = 'scaleX(' + w + ')'; }
  });
  root.classList.toggle('is-paused', !playing);

  function check() {
    var r = root.getBoundingClientRect();
    var panel = root.closest('.panel'); var shown = !panel || panel.classList.contains('on');
    var v = shown && r.top < innerHeight * 0.75 && r.bottom > innerHeight * 0.25 && !document.hidden;
    if (v === visible) return; visible = v;
    if (v) { if (!started) { started = true; render(0); } schedule(); } else { clearTimeout(timer); }
  }
  addEventListener('scroll', check, { passive: true }); addEventListener('resize', check);
  document.addEventListener('visibilitychange', check);
  if (root.closest('.panel')) new MutationObserver(check).observe(root.closest('.panel'), { attributes: true, attributeFilter: ['class'] });
  render(0);
  setTimeout(check, 300);
})();
