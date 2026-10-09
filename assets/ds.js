/* Mapa de componentes: pantalla real + cajas numeradas + leyenda con recortes */
(function () {
  var D = window.DS_MAP, root = document.getElementById('ds-map'), body = document.getElementById('ds-map-body');
  if (!D || !root || !body) return;
  var base = root.dataset.base || '../assets/img/tc/ds/';
  var tabs = root.querySelectorAll('[data-screen]');
  var phone = body.querySelector('.ds-phone'), legend = body.querySelector('.ds-legend');

  /* nombre semántico: lo que el componente es en la pantalla, no cómo se llama en la biblioteca */
  var SEM = {
    'Status bar android': ['Barra de estado', 'Status bar'], 'Header': ['Encabezado', 'Header'],
    'Message mobile': ['Mensaje de aviso', 'Notice message'], 'Money amount mask': ['Monto', 'Amount'],
    'Badge pill': ['Etiqueta de estado', 'Status badge'], 'Textlink': ['Enlace de texto', 'Text link'],
    'Button group': ['Acciones de pago', 'Payment actions'], 'Titles': ['Título o etiqueta', 'Title or label'],
    'Button': ['Botón de acción', 'Action button'], 'Main Actions - Grid': ['Acciones de la tarjeta', 'Card actions'],
    'Activities row': ['Movimiento', 'Transaction'], 'Bottom navigation': ['Navegación inferior', 'Bottom navigation'],
    'List row': ['Fila de lista', 'List row']
  };
  function sem(c) { var t = SEM[c]; return t ? '<span lang="es">' + t[0] + '</span><span lang="en">' + t[1] + '</span>' : c; }

  function hot(n, on) {
    phone.classList.toggle('dim', on);
    phone.querySelectorAll('.ds-box').forEach(function (b) { b.classList.toggle('hot', on && b.dataset.n === String(n)); });
    legend.querySelectorAll('.ds-item').forEach(function (i) { i.classList.toggle('hot', on && i.dataset.n === String(n)); });
  }
  function render(key) {
    var s = D[key];
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.screen === key); });
    phone.innerHTML = '<img src="' + base + s.img + '" alt="' + key + '">';
    s.boxes.forEach(function (b) {
      var e = document.createElement('div');
      e.className = 'ds-box'; e.dataset.n = b.n;
      e.style.cssText = 'left:' + (b.x / s.w * 100) + '%;top:' + (b.y / s.h * 100) + '%;width:' + (b.w / s.w * 100) + '%;height:' + (b.h / s.h * 100) + '%';
      e.innerHTML = '<i>' + b.n + '</i>';
      e.addEventListener('mouseenter', function () { hot(b.n, true); });
      e.addEventListener('mouseleave', function () { hot(b.n, false); });
      phone.appendChild(e);
    });
    legend.innerHTML = '';
    s.legend.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'ds-item'; d.dataset.n = l.n;
      d.innerHTML = '<span class="num">' + l.n + '</span>' +
        '<span class="nm">' + sem(l.comp) + '<small>' + l.comp + ' · ×' + l.count + '</small></span>';
      d.tabIndex = 0;
      d.addEventListener('mouseenter', function () { hot(l.n, true); });
      d.addEventListener('mouseleave', function () { hot(l.n, false); });
      d.addEventListener('focus', function () { hot(l.n, true); });
      d.addEventListener('blur', function () { hot(l.n, false); });
      legend.appendChild(d);
    });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { render(t.dataset.screen); }); });
  render('marcos');
})();
