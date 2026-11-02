/* Daleel admin dashboard — plain JavaScript, no build step. */
(function () {
  'use strict';
  const STR = {
    ar: {
      overview: 'الرئيسية', listings: 'الأماكن', submissions: 'طلبات الإضافة', reviews: 'التقييمات', taxonomy: 'الأقسام والمناطق', importT: 'استيراد', settings: 'الإعدادات', viewSite: 'افتح الموقع ↗', logout: 'خروج', lang: 'English',
      setupTitle: 'اعمل موقع دليلك', setupLead: 'دليل لمطاعم مدينتك، أو عيادات، أو صنايعية، أو خدمات أفراح. جاهز لجوجل من أول يوم.', siteName: 'اسم الدليل', siteNamePh: 'مثلاً: دليل المعادي', tagline: 'جملة تعريفية', taglinePh: 'كل مطاعم وكافيهات المعادي في مكان واحد', dirType: 'نوع الدليل', t_food: 'مطاعم وكافيهات', t_medical: 'عيادات وصحة', t_services: 'صنايعية وخدمات منزلية', t_weddings: 'خدمات أفراح', t_general: 'دليل عام', areasL: 'المناطق (مفصولة بفاصلة)', areasPh: 'المعادي، زهراء المعادي، دجلة', password: 'كلمة السر', pwHint: '8 حروف على الأقل', start: 'ابدأ', loginTitle: 'تسجيل الدخول', login: 'دخول',
      published: 'منشور', pending: 'مستني مراجعة', hidden: 'مخفي', views: 'مشاهدات', calls: 'اتصالات', wa: 'رسايل واتساب', dirs: 'طلبات اتجاهات', top: 'الأكثر مشاهدة', leads: 'تواصل', getStarted: 'ابدأ بإضافة أماكن من «الأماكن» أو استوردها من ملف CSV.', sitemapHint: 'ضيف رابط sitemap.xml في Google Search Console عشان جوجل يلاقي كل الصفحات:',
      add: '+ مكان جديد', search: 'دوّر…', all: 'الكل', name: 'الاسم', category: 'القسم', area: 'المنطقة', status: 'الحالة', edit: 'تعديل', del: 'حذف', save: 'حفظ', saved: 'اتحفظ ✓', close: 'إغلاق', none: 'مفيش.', approve: 'اعتمد', reject: 'ارفض', publish: 'انشر',
      desc: 'الوصف', address: 'العنوان', phone: 'التليفون', whatsapp: 'واتساب', website: 'الموقع الإلكتروني', tags: 'كلمات للبحث (مفصولة بفاصلة)', mapLink: 'لينك جوجل ماب أو الإحداثيات', mapHint: 'افتح المكان على جوجل ماب وانسخ اللينك من شريط العنوان', lat: 'خط العرض', lng: 'خط الطول', hours: 'مواعيد العمل', closedDay: 'إجازة', photos: 'الصور', addPhoto: '+ صورة', featuredUntil: 'مميز لحد', priceLevel: 'مستوى الأسعار', slug: 'رابط الصفحة', submittedBy: 'اتبعت من', copyHours: 'انسخ مواعيد أول يوم لكل الأيام',
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      approved: 'معتمد', rejected: 'مرفوض', addCat: '+ قسم', addArea: '+ منطقة', categories: 'الأقسام', areas: 'المناطق',
      importLead: 'الصق ملف CSV فيه صف عناوين. الأعمدة المدعومة:', importBtn: 'استيراد', imported: 'اتضاف', chooseFile: 'اختار ملف CSV',
      lang2: 'لغة الموقع', color: 'اللون', logo: 'إيموجي اللوجو', footer: 'سطر الفوتر', featuredInfo: 'رسالة «عايز تبقى مميز؟» (سعر وطريقة تواصل)', subsOpen: 'استقبل طلبات إضافة من الزوار', revOpen: 'اسمح بالتقييمات', tz: 'المنطقة الزمنية', pwTitle: 'تغيير كلمة السر', current: 'الحالية', next: 'الجديدة', change: 'تغيير',
    },
    en: {
      overview: 'Home', listings: 'Listings', submissions: 'Submissions', reviews: 'Reviews', taxonomy: 'Categories and areas', importT: 'Import', settings: 'Settings', viewSite: 'Open site ↗', logout: 'Sign out', lang: 'العربية',
      setupTitle: 'Create your directory', setupLead: 'A guide to restaurants in your city, clinics, home services or wedding vendors. Ready for Google from day one.', siteName: 'Directory name', siteNamePh: 'e.g. Downtown Eats', tagline: 'Tagline', taglinePh: 'Every restaurant and café downtown in one place', dirType: 'Directory type', t_food: 'Restaurants and cafés', t_medical: 'Clinics and health', t_services: 'Home services', t_weddings: 'Wedding vendors', t_general: 'General', areasL: 'Areas (comma separated)', areasPh: 'Downtown, Old Town, Riverside', password: 'Password', pwHint: 'At least 8 characters', start: 'Get started', loginTitle: 'Sign in', login: 'Sign in',
      published: 'Published', pending: 'Pending', hidden: 'Hidden', views: 'Views', calls: 'Calls', wa: 'WhatsApp chats', dirs: 'Directions', top: 'Most viewed', leads: 'leads', getStarted: 'Start by adding places in Listings or import them from CSV.', sitemapHint: 'Add this sitemap in Google Search Console so Google finds every page:',
      add: '+ New listing', search: 'Search…', all: 'All', name: 'Name', category: 'Category', area: 'Area', status: 'Status', edit: 'Edit', del: 'Delete', save: 'Save', saved: 'Saved ✓', close: 'Close', none: 'Nothing here.', approve: 'Approve', reject: 'Reject', publish: 'Publish',
      desc: 'Description', address: 'Address', phone: 'Phone', whatsapp: 'WhatsApp', website: 'Website', tags: 'Search keywords (comma separated)', mapLink: 'Google Maps link or coordinates', mapHint: 'Open the place in Google Maps and copy the link from the address bar', lat: 'Latitude', lng: 'Longitude', hours: 'Opening hours', closedDay: 'Closed', photos: 'Photos', addPhoto: '+ Photo', featuredUntil: 'Featured until', priceLevel: 'Price level', slug: 'Page link', submittedBy: 'Submitted by', copyHours: "Copy the first day's hours to every day",
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      approved: 'Approved', rejected: 'Rejected', addCat: '+ Category', addArea: '+ Area', categories: 'Categories', areas: 'Areas',
      importLead: 'Paste a CSV with a header row. Supported columns:', importBtn: 'Import', imported: 'Added', chooseFile: 'Choose a CSV file',
      lang2: 'Site language', color: 'Color', logo: 'Logo emoji', footer: 'Footer line', featuredInfo: '“Want to be featured?” message (price and contact)', subsOpen: 'Accept listing submissions from visitors', revOpen: 'Allow reviews', tz: 'Time zone', pwTitle: 'Change password', current: 'Current', next: 'New', change: 'Change',
    },
  };
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
  let lang = get('daleel_lang') || 'ar';
  const t = (k) => STR[lang][k] ?? k;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');
  const S = { session: null, tax: { categories: [], areas: [] }, filter: '', q: '' };
  async function api(p, o = {}) {
    const res = await fetch(p, { method: o.method || 'GET', headers: o.body !== undefined ? { 'content-type': 'application/json' } : {}, body: o.body !== undefined ? JSON.stringify(o.body) : undefined });
    const d = await res.json().catch(() => ({}));
    if (res.status === 401 && p !== '/api/login' && p !== '/api/password') { boot(); throw new Error(d.error); }
    if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
    return d;
  }
  const toast = (m) => { const el = $('#toast'); el.textContent = m; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const catName = (id) => S.tax.categories.find((c) => c.id === id);
  const areaName = (id) => S.tax.areas.find((a) => a.id === id)?.name || '';
  const pill = (st) => `<span class="pill ${{ published: 'good', pending: 'warn', hidden: 'off', approved: 'good', rejected: 'bad' }[st]}">${t(st)}</span>`;
  const fileB64 = (f) => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(f); });

  async function boot() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    S.session = await api('/api/session').catch(() => ({}));
    if (S.session.needsSetup) return auth(true);
    if (!S.session.authed) return auth(false);
    shell(); route();
  }
  function auth(setup) {
    app.innerHTML = `<div class="auth"><form class="card" id="f"><div class="brand"><img src="/favicon.svg" alt="">Daleel <span class="muted small">دليل</span></div><h1>${setup ? t('setupTitle') : t('loginTitle')}</h1>
      ${setup ? `<p class="muted">${t('setupLead')}</p>
      <label class="field" for="sn">${t('siteName')}<input type="text" id="sn" placeholder="${t('siteNamePh')}"></label>
      <label class="field" for="tg">${t('tagline')}<input type="text" id="tg" placeholder="${t('taglinePh')}"></label>
      <label class="field" for="ty">${t('dirType')}<select id="ty">${(S.session.templates || []).map((k) => `<option value="${k}">${t('t_' + k)}</option>`).join('')}</select></label>
      <label class="field" for="ar">${t('areasL')}<input type="text" id="ar" placeholder="${t('areasPh')}"></label>` : ''}
      <label class="field" for="pw">${t('password')} ${setup ? `<span class="hint">${t('pwHint')}</span>` : ''}<input type="password" id="pw"></label>
      ${setup && S.session.setupTokenRequired ? `<label class="field" for="st">Setup token<input type="password" id="st" class="ltr"></label>` : ''}
      <div class="err" id="err"></div><div class="row"><button class="btn primary" type="submit">${setup ? t('start') : t('login')}</button><span class="spacer"></span><button class="btn sm" type="button" id="lb">${t('lang')}</button></div></form></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('daleel_lang', lang); boot(); };
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      try {
        if (setup) await api('/api/setup', { method: 'POST', body: { siteName: $('#sn').value, tagline: $('#tg').value, template: $('#ty').value, areas: $('#ar').value, password: $('#pw').value, lang, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, setupToken: $('#st')?.value } });
        else await api('/api/login', { method: 'POST', body: { password: $('#pw').value } });
        location.hash = '#overview'; boot();
      } catch (err) { $('#err').textContent = err.message; }
    };
  }
  const PAGES = ['overview', 'listings', 'submissions', 'reviews', 'taxonomy', 'importT', 'settings'];
  function shell() {
    const nav = PAGES.map((p) => `<a class="nav" href="#${p}" data-page="${p}"><span>${t(p)}</span><span class="badge" data-badge="${p}" hidden></span></a>`).join('') + `<a class="nav" href="/" target="_blank" rel="noopener">${t('viewSite')}</a>`;
    app.innerHTML = `<div class="shell"><nav class="rail"><div class="brand"><img src="/favicon.svg" alt="">Daleel</div>${nav}<div class="rail-foot"><button class="nav" id="lb" type="button">${t('lang')}</button><button class="nav" id="lo" type="button">${t('logout')}</button></div></nav><nav class="mobile-nav">${nav}</nav><main class="main" id="main"></main></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('daleel_lang', lang); boot(); };
    $('#lo').onclick = async () => { await api('/api/logout', { method: 'POST', body: {} }); boot(); };
  }
  async function route() {
    const [pg, id] = location.hash.slice(1).split(':');
    const page = PAGES.includes(pg) ? pg : pg === 'edit' ? 'edit' : 'overview';
    $$('.nav[data-page]').forEach((a) => a.setAttribute('aria-current', a.dataset.page === page ? 'page' : 'false'));
    S.tax = await api('/api/taxonomy');
    const o = await api('/api/overview');
    const badge = (p, n) => $$(`[data-badge="${p}"]`).forEach((b) => { b.hidden = !n; b.textContent = n; });
    badge('submissions', o.pending); badge('reviews', o.reviewsPending);
    const main = $('#main');
    main.scrollTop = 0;
    if (page === 'edit') return pEdit(main, id);
    ({ overview: (m) => pOverview(m, o), listings: pListings, submissions: pSubmissions, reviews: pReviews, taxonomy: pTaxonomy, importT: pImport, settings: pSettings }[page])(main);
  }
  window.addEventListener('hashchange', () => S.session?.authed && route());

  function pOverview(main, o) {
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('overview')}</h1><a class="btn primary" href="#edit:new">${t('add')}</a></div>
      <div class="grid4">
        <a class="card stat" href="#listings" style="text-decoration:none;color:inherit"><b>${o.listings}</b><span>${t('published')}</span></a>
        <div class="card stat"><b>${o.views}</b><span>${t('views')}</span></div>
        <div class="card stat"><b>${o.calls + o.whatsapp}</b><span>${t('calls')} + ${t('wa')}</span></div>
        <div class="card stat"><b>${o.directions}</b><span>${t('dirs')}</span></div>
      </div>
      ${o.listings ? '' : `<div class="card">${t('getStarted')}</div>`}
      <section class="card"><h2>${t('top')}</h2>${o.top.length ? o.top.map((x) => `<div class="row"><a href="#edit:${x.id}">${esc(x.name)}</a><span class="spacer"></span><span class="small muted">${x.views} ${t('views')} · ${x.leads} ${t('leads')}</span></div>`).join('') : `<p class="muted">${t('none')}</p>`}</section>
      <p class="muted small">${t('sitemapHint')} <code>${esc(location.origin)}/sitemap.xml</code></p></div>`;
  }

  async function pListings(main) {
    const { listings } = await api(`/api/listings?status=${S.filter}&q=${encodeURIComponent(S.q)}`);
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('listings')}</h1><div class="row"><input type="text" id="q" value="${esc(S.q)}" placeholder="${t('search')}" style="width:200px" aria-label="${t('search')}">
      <div class="tabs">${['', 'published', 'pending', 'hidden'].map((k) => `<button type="button" data-f="${k}" aria-pressed="${S.filter === k}">${k ? t(k) : t('all')}</button>`).join('')}</div><a class="btn primary" href="#edit:new">${t('add')}</a></div></div>
      ${listings.length ? `<div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('category')}</th><th>${t('area')}</th><th>${t('views')}</th><th>${t('status')}</th><th></th></tr></thead><tbody>
      ${listings.map((l) => `<tr><td><b>${esc(l.name)}</b>${l.featuredUntil ? ' ⭐' : ''}</td><td>${esc(catName(l.categoryId)?.icon || '')} ${esc(catName(l.categoryId)?.name || '')}</td><td>${esc(areaName(l.areaId))}</td><td class="num">${l.views || 0}</td><td>${pill(l.status)}</td>
        <td><div class="row" style="gap:6px"><a class="btn sm" href="#edit:${l.id}">${t('edit')}</a>${l.status === 'published' ? `<a class="btn sm" href="/l/${encodeURIComponent(l.slug)}" target="_blank" rel="noopener">↗</a>` : ''}</div></td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty">${t('none')}</div>`}</div>`;
    let tm;
    $('#q').oninput = () => { clearTimeout(tm); tm = setTimeout(() => { S.q = $('#q').value; pListings(main).then(() => { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 300); };
    $$('[data-f]', main).forEach((b) => (b.onclick = () => { S.filter = b.dataset.f; pListings(main); }));
  }

  async function pSubmissions(main) {
    const { listings } = await api('/api/listings?status=pending');
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('submissions')}</h1></div>
      ${listings.length ? listings.map((l) => `<section class="card"><div class="card-head"><div><h2>${esc(l.name)}</h2><span class="muted small">${esc(catName(l.categoryId)?.name || '')} · ${esc(areaName(l.areaId))} · <span dir="ltr">${esc(l.phone)}</span></span></div>
        <div class="row"><button class="btn sm primary" data-pub="${l.id}" type="button">${t('approve')}</button><a class="btn sm" href="#edit:${l.id}">${t('edit')}</a><button class="btn sm danger" data-del="${l.id}" type="button">${t('reject')}</button></div></div>
        ${l.description ? `<p>${esc(l.description)}</p>` : ''}${l.submittedBy ? `<p class="muted small">${t('submittedBy')}: ${esc(l.submittedBy.name)} · <span dir="ltr">${esc(l.submittedBy.phone)}</span></p>` : ''}</section>`).join('') : `<div class="card empty">${t('none')}</div>`}</div>`;
    $$('[data-pub]', main).forEach((b) => (b.onclick = async () => { await api('/api/listings/' + b.dataset.pub, { method: 'PUT', body: { status: 'published' } }); route(); }));
    $$('[data-del]', main).forEach((b) => (b.onclick = async () => { await api('/api/listings/' + b.dataset.del, { method: 'DELETE', body: {} }); route(); }));
  }

  async function pReviews(main) {
    const st = S.revFilter || 'pending';
    const { reviews } = await api('/api/reviews?status=' + st);
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('reviews')}</h1><div class="tabs">${['pending', 'approved', 'rejected'].map((k) => `<button type="button" data-f="${k}" aria-pressed="${st === k}">${t(k)}</button>`).join('')}</div></div>
      ${reviews.length ? reviews.map((r) => `<section class="card"><div class="card-head"><div><b>${esc(r.name)}</b> <span style="color:#F59E0B">${'★'.repeat(r.rating)}</span> <span class="muted small">· ${esc(r.listing)} · ${esc(r.at.slice(0, 10))}</span></div>
        <div class="row">${r.status !== 'approved' ? `<button class="btn sm primary" data-st="approved" data-id="${r.id}" type="button">${t('approve')}</button>` : ''}${r.status !== 'rejected' ? `<button class="btn sm" data-st="rejected" data-id="${r.id}" type="button">${t('reject')}</button>` : ''}<button class="btn sm danger" data-del="${r.id}" type="button">${t('del')}</button></div></div><p style="white-space:pre-wrap">${esc(r.text)}</p></section>`).join('') : `<div class="card empty">${t('none')}</div>`}</div>`;
    $$('[data-f]', main).forEach((b) => (b.onclick = () => { S.revFilter = b.dataset.f; pReviews(main); }));
    $$('[data-st]', main).forEach((b) => (b.onclick = async () => { await api('/api/reviews/' + b.dataset.id, { method: 'PUT', body: { status: b.dataset.st } }); route(); }));
    $$('[data-del]', main).forEach((b) => (b.onclick = async () => { await api('/api/reviews/' + b.dataset.del, { method: 'DELETE', body: {} }); route(); }));
  }

  async function pEdit(main, id) {
    const isNew = id === 'new';
    let l = isNew ? { name: '', categoryId: S.tax.categories[0]?.id, areaId: '', description: '', address: '', phone: '', whatsapp: '', website: '', tags: '', lat: null, lng: null, hours: null, photos: [], status: 'published', featuredUntil: '', priceLevel: 0, slug: '' } : (await api('/api/listings/' + id)).listing;
    const hrs = l.hours || Array(7).fill(null);
    const f = (fid, k, v, extra = '') => `<label class="field" for="${fid}">${t(k)}<input type="text" id="${fid}" value="${esc(v ?? '')}" ${extra}></label>`;
    main.innerHTML = `<div class="page"><div class="page-head"><div class="row"><a class="btn sm" href="#listings">←</a><h1>${isNew ? t('add') : esc(l.name)}</h1>${isNew ? '' : pill(l.status)}</div>${!isNew && l.status === 'published' ? `<a class="btn" href="/l/${encodeURIComponent(l.slug)}" target="_blank" rel="noopener">${t('viewSite')}</a>` : ''}</div>
      <form class="card" id="ef">
        <div class="grid2">${f('e-n', 'name', l.name, 'required')}<label class="field" for="e-st">${t('status')}<select id="e-st">${['published', 'pending', 'hidden'].map((k) => `<option value="${k}" ${l.status === k ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label></div>
        <div class="grid2"><label class="field" for="e-c">${t('category')}<select id="e-c">${S.tax.categories.map((c) => `<option value="${c.id}" ${c.id === l.categoryId ? 'selected' : ''}>${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select></label>
          <label class="field" for="e-a">${t('area')}<select id="e-a"><option value=""></option>${S.tax.areas.map((a) => `<option value="${a.id}" ${a.id === l.areaId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div>
        <label class="field" for="e-d">${t('desc')}<textarea id="e-d">${esc(l.description)}</textarea></label>
        <div class="grid2">${f('e-p', 'phone', l.phone, 'class="ltr"')}${f('e-w', 'whatsapp', l.whatsapp, 'class="ltr"')}</div>
        <div class="grid2">${f('e-web', 'website', l.website, 'class="ltr"')}${f('e-t', 'tags', l.tags)}</div>
        ${f('e-ad', 'address', l.address)}
        <label class="field" for="e-ml">${t('mapLink')} <span class="hint">${t('mapHint')}</span><input type="text" id="e-ml" class="ltr" value="${l.lat != null ? `${l.lat}, ${l.lng}` : ''}"></label>
        <div class="field">${t('hours')} <button class="btn sm" type="button" id="cp" style="justify-self:start">${t('copyHours')}</button><div class="hrs">${t('days').map((d, i) => `<div class="r" data-d="${i}"><span>${d}</span><label class="switch"><input type="checkbox" class="cl" ${hrs[i] ? '' : 'checked'}>${t('closedDay')}</label><input type="time" class="o" value="${hrs[i]?.[0] || '10:00'}"><input type="time" class="c" value="${hrs[i]?.[1] || '22:00'}"></div>`).join('')}</div></div>
        ${isNew ? '' : `<div class="field">${t('photos')}<div class="photos">${l.photos.map((p) => `<figure><img src="/media/${esc(p)}" alt=""><button type="button" data-rm="${esc(p)}" aria-label="${t('del')}">✕</button></figure>`).join('')}<button class="btn sm" type="button" id="ph">${t('addPhoto')}</button></div><input type="file" id="pf" accept="image/jpeg,image/png,image/webp" multiple hidden></div>`}
        <div class="grid4"><label class="field" for="e-f">${t('featuredUntil')}<input type="date" id="e-f" value="${esc(l.featuredUntil)}"></label>
          <label class="field" for="e-pl">${t('priceLevel')}<select id="e-pl">${[0, 1, 2, 3, 4].map((n) => `<option value="${n}" ${Number(l.priceLevel) === n ? 'selected' : ''}>${n ? '$'.repeat(n) : '—'}</option>`).join('')}</select></label>
          ${isNew ? '' : f('e-sl', 'slug', l.slug, 'class="ltr"')}</div>
        ${l.submittedBy ? `<p class="muted small">${t('submittedBy')}: ${esc(l.submittedBy.name)} · <span dir="ltr">${esc(l.submittedBy.phone)}</span></p>` : ''}
        <div class="err" id="ee"></div>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button><span class="spacer"></span>${isNew ? '' : `<button class="btn danger" type="button" id="dl">${t('del')}</button>`}</div>
      </form></div>`;
    const sync = () => $$('.hrs .r', main).forEach((r) => { const off = $('.cl', r).checked; $('.o', r).disabled = off; $('.c', r).disabled = off; });
    $$('.cl', main).forEach((c) => (c.onchange = sync)); sync();
    $('#cp').onclick = () => { const first = $('.hrs .r', main); $$('.hrs .r', main).forEach((r) => { $('.cl', r).checked = $('.cl', first).checked; $('.o', r).value = $('.o', first).value; $('.c', r).value = $('.c', first).value; }); sync(); };
    const body = () => {
      const hours = $$('.hrs .r', main).map((r) => ($('.cl', r).checked ? null : [$('.o', r).value, $('.c', r).value]));
      const ml = $('#e-ml').value.trim();
      return { name: $('#e-n').value, status: $('#e-st').value, categoryId: $('#e-c').value, areaId: $('#e-a').value, description: $('#e-d').value, phone: $('#e-p').value, whatsapp: $('#e-w').value, website: $('#e-web').value, tags: $('#e-t').value, address: $('#e-ad').value,
        ...(ml ? { mapLink: ml } : { lat: '', lng: '' }), hours: hours.every((h) => !h) ? null : hours, featuredUntil: $('#e-f').value, priceLevel: Number($('#e-pl').value), ...(isNew ? {} : { slug: $('#e-sl').value }) };
    };
    $('#ef').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const r = await api(isNew ? '/api/listings' : '/api/listings/' + id, { method: isNew ? 'POST' : 'PUT', body: body() });
        toast(t('saved'));
        if (isNew) location.hash = '#edit:' + r.listing.id; else pEdit(main, id);
      } catch (err) { $('#ee').textContent = err.message; }
    };
    if ($('#dl')) $('#dl').onclick = async () => { await api('/api/listings/' + id, { method: 'DELETE', body: {} }); location.hash = '#listings'; };
    if ($('#ph')) {
      $('#ph').onclick = () => $('#pf').click();
      $('#pf').onchange = async () => { for (const file of $('#pf').files) { try { await api(`/api/listings/${id}/photos`, { method: 'POST', body: { data: await fileB64(file) } }); } catch (err) { toast(err.message); } } pEdit(main, id); };
      $$('[data-rm]', main).forEach((b) => (b.onclick = async () => { await api('/api/listings/' + id, { method: 'PUT', body: { photos: l.photos.filter((p) => p !== b.dataset.rm) } }); pEdit(main, id); }));
    }
  }

  function pTaxonomy(main) {
    const row = (kind, x) => `<div class="tax-row" data-kind="${kind}" data-id="${x.id}">${kind === 'categories' ? `<input class="ic" value="${esc(x.icon)}" aria-label="icon">` : ''}<input class="nm" value="${esc(x.name)}" aria-label="${t('name')}"><button class="btn sm" type="button" data-save>${t('save')}</button><button class="btn sm danger" type="button" data-del>✕</button></div>`;
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('taxonomy')}</h1></div><div class="grid2">
      <section class="card"><div class="card-head"><h2>${t('categories')}</h2><button class="btn sm" id="ac" type="button">${t('addCat')}</button></div>${S.tax.categories.map((c) => row('categories', c)).join('')}</section>
      <section class="card"><div class="card-head"><h2>${t('areas')}</h2><button class="btn sm" id="aa" type="button">${t('addArea')}</button></div>${S.tax.areas.map((a) => row('areas', a)).join('') || `<p class="muted">${t('none')}</p>`}</section></div></div>`;
    $('#ac').onclick = async () => { await api('/api/categories', { method: 'POST', body: { name: lang === 'ar' ? 'قسم جديد' : 'New category', icon: '📍' } }); route(); };
    $('#aa').onclick = async () => { await api('/api/areas', { method: 'POST', body: { name: lang === 'ar' ? 'منطقة جديدة' : 'New area' } }); route(); };
    $$('.tax-row', main).forEach((r) => {
      $('[data-save]', r).onclick = async () => { try { await api(`/api/${r.dataset.kind}/${r.dataset.id}`, { method: 'PUT', body: { name: $('.nm', r).value, icon: $('.ic', r)?.value } }); toast(t('saved')); } catch (err) { toast(err.message); } };
      $('[data-del]', r).onclick = async () => { try { await api(`/api/${r.dataset.kind}/${r.dataset.id}`, { method: 'DELETE', body: {} }); route(); } catch (err) { toast(err.message); } };
    });
  }

  function pImport(main) {
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('importT')}</h1></div><section class="card"><p class="muted">${t('importLead')} <code>name, category, area, phone, whatsapp, address, description, website, tags, lat, lng</code></p>
      <button class="btn" type="button" id="fb" style="justify-self:start">${t('chooseFile')}</button><input type="file" id="ff" accept=".csv,text/csv" hidden>
      <textarea id="csv" class="ltr" style="min-height:220px" placeholder="name,category,area,phone&#10;Nile Pizza,Restaurants,Downtown,+20100…"></textarea>
      <div class="row"><button class="btn primary" type="button" id="go">${t('importBtn')}</button><span id="res"></span></div></section></div>`;
    $('#fb').onclick = () => $('#ff').click();
    $('#ff').onchange = async () => { const file = $('#ff').files[0]; if (file) $('#csv').value = await file.text(); };
    $('#go').onclick = async () => { try { const r = await api('/api/listings/import', { method: 'POST', body: { csv: $('#csv').value } }); $('#res').textContent = `${t('imported')}: ${r.added}`; } catch (err) { toast(err.message); } };
  }

  async function pSettings(main) {
    const { settings: s, timezone } = await api('/api/settings');
    const f = (id, k, v, extra = '') => `<label class="field" for="${id}">${t(k)}<input type="text" id="${id}" value="${esc(v)}" ${extra}></label>`;
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('settings')}</h1></div>
      <form class="card" id="sf" style="max-width:760px">
        <div class="grid2">${f('s-n', 'siteName', s.siteName)}${f('s-t', 'tagline', s.tagline)}</div>
        <div class="grid4"><label class="field" for="s-l">${t('lang2')}<select id="s-l"><option value="ar" ${s.lang === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${s.lang === 'en' ? 'selected' : ''}>English</option></select></label>
          <label class="field" for="s-c">${t('color')}<input type="color" id="s-c" value="${esc(s.color)}" style="height:40px"></label>${f('s-e', 'logo', s.logoEmoji)}${f('s-tz', 'tz', s.timezone || timezone, 'class="ltr"')}</div>
        ${f('s-f', 'footer', s.footer)}
        <label class="field" for="s-fi">${t('featuredInfo')}<textarea id="s-fi" style="min-height:70px">${esc(s.featuredInfo)}</textarea></label>
        <label class="switch"><input type="checkbox" id="s-so" ${s.submissionsOpen ? 'checked' : ''}>${t('subsOpen')}</label>
        <label class="switch"><input type="checkbox" id="s-ro" ${s.reviewsOpen ? 'checked' : ''}>${t('revOpen')}</label>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button></div></form>
      <form class="card" id="pw" style="max-width:480px"><h2>${t('pwTitle')}</h2><label class="field" for="pc">${t('current')}<input type="password" id="pc"></label><label class="field" for="pn">${t('next')}<input type="password" id="pn"></label><div class="err" id="pe"></div><div class="row"><button class="btn primary" type="submit">${t('change')}</button></div></form>
      <p class="muted small">Daleel · ${esc(S.session.version)} · MIT</p></div>`;
    $('#sf').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/settings', { method: 'PUT', body: { settings: { siteName: $('#s-n').value, tagline: $('#s-t').value, lang: $('#s-l').value, color: $('#s-c').value, logoEmoji: $('#s-e').value, timezone: $('#s-tz').value, footer: $('#s-f').value, featuredInfo: $('#s-fi').value, submissionsOpen: $('#s-so').checked, reviewsOpen: $('#s-ro').checked } } }); toast(t('saved')); } catch (err) { toast(err.message); } };
    $('#pw').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/password', { method: 'POST', body: { current: $('#pc').value, next: $('#pn').value } }); toast(t('saved')); } catch (err) { $('#pe').textContent = err.message; } };
  }
  boot();
})();
