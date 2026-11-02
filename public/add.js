/* "Add your place" form */
(function () {
  var f = document.getElementById('addf');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var body = {};
    Array.prototype.forEach.call(f.elements, function (el) { if (el.name) body[el.name] = el.value; });
    var b = f.querySelector('button');
    b.disabled = true;
    fetch('/api/public/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) { f.querySelector('.ok').hidden = false; f.querySelector('.err').hidden = true; f.reset(); }
        else { var er = f.querySelector('.err'); er.textContent = d.error; er.hidden = false; b.disabled = false; }
      }).catch(function () { b.disabled = false; });
  });
})();
