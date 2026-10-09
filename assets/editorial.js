/* Rejilla editorial: la tecla G muestra u oculta las 12 columnas sobre las que se componen los capítulos. */
(function () {
  if (!document.body.classList.contains('ed')) return;
  var g = document.createElement('div'); g.className = 'ed-grid'; g.setAttribute('aria-hidden', 'true');
  var inner = document.createElement('div');
  for (var i = 1; i <= 12; i++) { var s = document.createElement('span'); s.textContent = i; inner.appendChild(s); }
  g.appendChild(inner); document.body.appendChild(g);
  function toggle() { g.classList.toggle('on'); }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'g' && e.key !== 'G') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    toggle();
  });
  var hint = document.querySelector('.ed-grid-hint');
  if (hint) { hint.addEventListener('click', toggle); hint.style.cursor = 'pointer'; }
})();
