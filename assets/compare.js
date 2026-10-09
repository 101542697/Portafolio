/* Antes -> Después: anotaciones enlazadas a zonas de las dos imágenes */
(function () {
  var root = document.getElementById('ad'); if (!root) return;
  var cfg = null; try { cfg = root.dataset.zones ? JSON.parse(root.dataset.zones) : null; } catch (e) { cfg = null; }
  var W = cfg ? cfg.w : 1588, H = cfg ? cfg.h : 1032;
  // zonas por anotación (mismo espacio W×H en las dos imágenes)
  var Z = cfg ? cfg.z : {
    a: { 1: [[138, 168, 616, 282]], 2: [[138, 547, 935, 349]], 3: [[160, 252, 440, 64]] },
    d: { 1: [[128, 123, 989, 149]], 2: [[128, 500, 989, 100]], 3: [[128, 123, 10, 149], [195, 360, 76, 19], [195, 462, 66, 18], [195, 660, 66, 19]] }
  };
  var stages = root.querySelectorAll('.ad-stage'), notes = root.querySelectorAll('.ad-notes li'), boxes = {};
  function pct(z) { return 'left:' + (z[0] / W * 100) + '%;top:' + (z[1] / H * 100) + '%;width:' + (z[2] / W * 100) + '%;height:' + (z[3] / H * 100) + '%'; }
  [].forEach.call(stages, function (st) {
    var side = st.dataset.side; boxes[side] = {};
    [1, 2, 3].forEach(function (n) {
      boxes[side][n] = Z[side][n].map(function (z, k) { var d = document.createElement('div'); d.className = 'ad-box'; d.style.cssText = pct(z); if (k === 0) d.innerHTML = '<i>' + n + '</i>'; st.appendChild(d); return d; });
    });
  });
  var btns = root.querySelectorAll('.ad-sel');
  function show(n) {
    [1, 2, 3].forEach(function (k) { ['a', 'd'].forEach(function (sd) { boxes[sd][k].forEach(function (b) { b.classList.toggle('on', k === n); b.classList.toggle('dim', k !== n); }); }); });
    [].forEach.call(notes, function (li) { var on = +li.dataset.n === n; li.classList.toggle('on', on); li.classList.toggle('dim', !on); li.querySelector('.ad-sel').setAttribute('aria-pressed', on); });
  }
  [].forEach.call(notes, function (li) {
    var n = +li.dataset.n;
    li.addEventListener('click', function () { show(n); });
  });
  show(1);
})();
