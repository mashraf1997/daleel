/* Listing page: send a review, count call/WhatsApp/directions taps. */
(function () {
  var f = document.getElementById('rv');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var b = f.querySelector('button');
    b.disabled = true;
    fetch('/api/public/review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ listingId: f.dataset.id, rating: (f.querySelector('input[name=rating]:checked') || {}).value, name: f.name.value, text: f.text.value, website: f.website.value }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.ok) { f.querySelector('.ok').hidden = false; f.reset(); } else { alert(d.error); b.disabled = false; } })
      .catch(function () { b.disabled = false; });
  });
  var acts = document.querySelector('.actions[data-id]');
  if (acts) acts.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-track]');
    if (!a) return;
    var payload = new Blob([JSON.stringify({ id: acts.dataset.id, type: a.dataset.track })], { type: 'application/json' });
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/public/click', payload))) fetch('/api/public/click', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: acts.dataset.id, type: a.dataset.track }), keepalive: true });
  });
})();
