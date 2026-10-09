/* Portafolio · comportamiento compartido: idioma, pestañas, usuarios, visor */
(function () {
  var html = document.documentElement;

  /* ---- idioma (persistente) ---- */
  function setLang(l) {
    html.setAttribute('data-lang', l);
    html.setAttribute('lang', l);
    try { localStorage.setItem('pf-lang', l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('pf-lang'); } catch (e) {}
  setLang(saved || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es'));
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.set); });
  });

  /* ---- pestañas Producto / Visual ---- */
  var tabs = document.querySelectorAll('.tab[data-tab]'); /* solo las pestañas de los casos; la portada gestiona las suyas en home.js */
  var panels = document.querySelectorAll('.panel');
  function showTab(id, scroll) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === id); });
    panels.forEach(function (p) { p.classList.toggle('on', p.id === id); });
    if (scroll) {
      try { if (history.replaceState) history.replaceState(null, '', '#' + id); } catch (e) {}
      var bar = document.querySelector('.tabs-bar');
      if (bar && window.scrollY > bar.offsetTop - 56) window.scrollTo({ top: bar.offsetTop - 56, behavior: 'auto' });
    }
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t.dataset.tab, true); }); });
  /* botón «Continuar con Visual» al final de Producto: cambia de pestaña y vuelve al inicio del panel */
  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () {
      showTab(b.dataset.goto, true);
      /* la barra es sticky: su offsetTop cambia al quedar fija, así que se mide desde el panel */
      var panel = document.getElementById(b.dataset.goto), bar = document.querySelector('.tabs-bar');
      var top = document.querySelector('.topbar');
      if (panel) window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 0) - (top ? top.offsetHeight : 0), behavior: 'auto' });
      var t = document.querySelector('.tab[data-tab="' + b.dataset.goto + '"]'); if (t) t.focus({ preventScroll: true });
    });
  });
  var h = location.hash.replace('#', '');
  showTab(h === 'visual' ? 'visual' : 'producto', false);
  /* entrar a un caso (o con #visual) no debe saltar al panel: el navegador intenta llevar el ancla al panel y desplaza la página */
  if (h === 'producto' || h === 'visual') {
    var top0 = function () { var d = document.documentElement; d.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); d.style.scrollBehavior = ''; };
    top0(); window.addEventListener('load', function () { top0(); setTimeout(top0, 0); });
  }

  /* ---- selector de usuario (se mantiene sincronizado entre pestañas) ---- */
  var pbtns = document.querySelectorAll('.pbtn[data-p]'); /* solo el selector de personas; el mapa de componentes usa data-screen */
  function showPersona(id) {
    pbtns.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.p === id); });
    document.querySelectorAll('.pcase').forEach(function (c) { c.classList.toggle('on', c.dataset.p === id); });
  }
  pbtns.forEach(function (b) { b.addEventListener('click', function () { showPersona(b.dataset.p); }); });
  if (pbtns.length) showPersona(pbtns[0].dataset.p);

  /* ---- visor de imágenes ---- */
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button type="button">ESC ✕</button><img alt="">';
  document.body.appendChild(lb);
  function open_(img) {
    lb.querySelector('img').src = img.src;
    lb.querySelector('img').alt = img.alt;
    lb.querySelector('img').style.maxWidth = img.dataset.zoomw ? img.dataset.zoomw + 'px' : '';
    lb.classList.add('on');
  }
  document.querySelectorAll('.ad-zoom').forEach(function (b) {
    b.addEventListener('click', function () { open_(b.closest('.ad-fig').querySelector('img')); });
  });
  document.querySelectorAll('.shot img, .ad-stage img, .lv img').forEach(function (img) {
    img.addEventListener('click', function () { open_(img); });
  });
  lb.addEventListener('click', function () { lb.classList.remove('on'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
})();
