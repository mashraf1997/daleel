// Daleel server: public directory pages, submissions and reviews, admin API.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { homePage, listPage, listingPage, addPage, notFoundPage, actionUrl, esc } from './pages.js';
import { matchScore, uniqueSlug, parseLatLng, normalize } from './util.js';
import { hashPassword, verifyPassword, createSession, checkSession, parseCookies, RateLimiter } from './auth.js';
import { send, readJson, clientIp, originOf, serveStatic, sendFile, cookie, VERSION } from './http.js';
import { demoConfig, resetData } from './demo-mode.js';
import { buildDemo } from './demo-data.js';

export const TEMPLATES = {
  food: { ar: [['🍽️', 'مطاعم', 'Restaurant'], ['☕', 'كافيهات', 'CafeOrCoffeeShop'], ['🍰', 'حلويات', 'Bakery'], ['🥖', 'مخابز', 'Bakery'], ['🍲', 'أكل بيتي', 'FoodEstablishment'], ['🛵', 'توصيل', 'FoodEstablishment']], en: [['🍽️', 'Restaurants', 'Restaurant'], ['☕', 'Cafés', 'CafeOrCoffeeShop'], ['🍰', 'Desserts', 'Bakery'], ['🥖', 'Bakeries', 'Bakery'], ['🍲', 'Home food', 'FoodEstablishment'], ['🛵', 'Delivery', 'FoodEstablishment']] },
  medical: { ar: [['🦷', 'أسنان', 'Dentist'], ['👶', 'أطفال', 'MedicalClinic'], ['🩺', 'باطنة', 'MedicalClinic'], ['💊', 'صيدليات', 'Pharmacy'], ['🧪', 'معامل تحاليل', 'MedicalClinic'], ['🩻', 'أشعة', 'MedicalClinic']], en: [['🦷', 'Dentists', 'Dentist'], ['👶', 'Pediatrics', 'MedicalClinic'], ['🩺', 'Internal medicine', 'MedicalClinic'], ['💊', 'Pharmacies', 'Pharmacy'], ['🧪', 'Labs', 'MedicalClinic'], ['🩻', 'Radiology', 'MedicalClinic']] },
  services: { ar: [['🔧', 'سباكة', 'Plumber'], ['💡', 'كهرباء', 'Electrician'], ['🪚', 'نجارة', 'HomeAndConstructionBusiness'], ['❄️', 'تكييف', 'HVACBusiness'], ['🎨', 'دهانات', 'HousePainter'], ['🚚', 'نقل عفش', 'MovingCompany'], ['🧹', 'تنظيف', 'HomeAndConstructionBusiness']], en: [['🔧', 'Plumbers', 'Plumber'], ['💡', 'Electricians', 'Electrician'], ['🪚', 'Carpenters', 'HomeAndConstructionBusiness'], ['❄️', 'AC repair', 'HVACBusiness'], ['🎨', 'Painters', 'HousePainter'], ['🚚', 'Movers', 'MovingCompany'], ['🧹', 'Cleaning', 'HomeAndConstructionBusiness']] },
  weddings: { ar: [['🏛️', 'قاعات', 'EventVenue'], ['📸', 'تصوير', 'LocalBusiness'], ['💄', 'ميكب', 'BeautySalon'], ['👗', 'فساتين', 'ClothingStore'], ['🎶', 'دي جي وفرق', 'LocalBusiness'], ['🎂', 'تورت', 'Bakery']], en: [['🏛️', 'Venues', 'EventVenue'], ['📸', 'Photographers', 'LocalBusiness'], ['💄', 'Make-up', 'BeautySalon'], ['👗', 'Dresses', 'ClothingStore'], ['🎶', 'DJs and bands', 'LocalBusiness'], ['🎂', 'Cakes', 'Bakery']] },
  general: { ar: [['🍽️', 'مطاعم وكافيهات', 'FoodEstablishment'], ['🏥', 'صحة', 'MedicalBusiness'], ['🛍️', 'تسوق', 'Store'], ['🔧', 'خدمات', 'HomeAndConstructionBusiness'], ['💇', 'جمال', 'BeautySalon'], ['🎓', 'تعليم', 'EducationalOrganization'], ['🚗', 'سيارات', 'AutomotiveBusiness']], en: [['🍽️', 'Food and drink', 'FoodEstablishment'], ['🏥', 'Health', 'MedicalBusiness'], ['🛍️', 'Shopping', 'Store'], ['🔧', 'Services', 'HomeAndConstructionBusiness'], ['💇', 'Beauty', 'BeautySalon'], ['🎓', 'Education', 'EducationalOrganization'], ['🚗', 'Cars', 'AutomotiveBusiness']] },
};

export function defaultData() {
  return {
    version: 1,
    meta: { secret: crypto.randomBytes(32).toString('hex'), createdAt: new Date().toISOString() },
    admin: null,
    settings: { siteName: '', tagline: '', lang: 'ar', color: '#B45309', logoEmoji: '📍', timezone: '', footer: '', submissionsOpen: true, reviewsOpen: true, featuredInfo: '' },
    categories: [],
    areas: [],
    listings: [],
    reviews: [],
  };
}

const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
function sniff(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}
const cleanUrl = (u) => (/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(String(u || '').trim()) ? String(u).trim() : '');
const cleanHours = (h) => (Array.isArray(h) && h.length === 7 ? h.map((d) => (Array.isArray(d) && /^\d{1,2}:\d{2}$/.test(d[0]) && /^\d{1,2}:\d{2}$/.test(d[1]) ? [d[0].padStart(5, '0'), d[1].padStart(5, '0')] : null)) : null);

export function createApp({ dataDir, setupToken = process.env.SETUP_TOKEN || '', env = process.env } = {}) {
  fs.mkdirSync(path.join(dataDir, 'media'), { recursive: true });
  const file = path.join(dataDir, 'daleel.json');
  const def = defaultData();
  const loaded = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const data = loaded ? { ...def, ...loaded, settings: { ...def.settings, ...loaded.settings } } : def;
  let timer;
  const flush = () => { clearTimeout(timer); fs.writeFileSync(file + '.tmp', JSON.stringify(data)); fs.renameSync(file + '.tmp', file); };
  const save = () => { clearTimeout(timer); timer = setTimeout(flush, 300); };
  if (!loaded) flush();
  // DEMO_MODE=true: a public showcase with sample data that resets on a timer.
  const demo = demoConfig(env);
  const resetDemo = () => { resetData(data, () => buildDemo(demo), demo); flush(); };
  let demoTimer = null;
  if (demo) { resetDemo(); demoTimer = setInterval(resetDemo, demo.resetMinutes * 60_000); demoTimer.unref?.(); }

  const loginLimiter = new RateLimiter(10, 15 * 60_000);
  const publicLimiter = new RateLimiter(8, 60 * 60_000);
  const hashFor = (uid) => (uid === 'owner' ? data.admin?.hash : null);
  const isAuthed = (req) => Boolean(checkSession(data.meta.secret, parseCookies(req.headers.cookie).daleel_session, hashFor));
  const session = (req) => cookie(req, 'daleel_session', createSession(data.meta.secret, data.admin.hash), 30 * 86400);
  const tz = () => data.settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const published = () => data.listings.filter((l) => l.status === 'published');
  const isFeatured = (l) => Boolean(l.featuredUntil && l.featuredUntil >= new Date().toISOString().slice(0, 10));
  const ratingCache = new Map();
  const ratingOf = (id) => {
    if (!ratingCache.has(id)) {
      const rs = data.reviews.filter((r) => r.listingId === id && r.status === 'approved');
      ratingCache.set(id, { count: rs.length, avg: rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0 });
    }
    return ratingCache.get(id);
  };
  const sortListings = (list) => [...list].sort((a, b) => (isFeatured(b) - isFeatured(a)) || (ratingOf(b.id).avg - ratingOf(a.id).avg) || b.createdAt.localeCompare(a.createdAt));

  function ctx(req, q = '') {
    ratingCache.clear();
    const catMap = new Map(data.categories.map((c) => [c.id, c]));
    const areaMap = new Map(data.areas.map((a) => [a.id, a]));
    return {
      settings: data.settings,
      origin: originOf(req),
      tz: tz(),
      q,
      categories: [...data.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      areas: data.areas,
      catById: (id) => catMap.get(id),
      areaById: (id) => areaMap.get(id),
      isFeatured,
      ratingOf,
      countIn: (cid) => published().filter((l) => l.categoryId === cid).length,
      featured: () => sortListings(published().filter(isFeatured)).slice(0, 12),
      newest: (n) => [...published()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, n),
    };
  }
  const html = (res, status, body) => send(res, status, body, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });

  function saveImage(b64) {
    const buf = Buffer.from(String(b64 || ''), 'base64');
    const mime = sniff(buf);
    if (!mime || buf.length > 6 * 1024 * 1024) return null;
    const name = `${crypto.randomUUID()}.${MIME_EXT[mime]}`;
    fs.writeFileSync(path.join(dataDir, 'media', name), buf);
    return name;
  }

  function applyListing(l, b, { admin }) {
    for (const k of ['name', 'description', 'address', 'phone', 'whatsapp', 'tags', 'facebook', 'instagram']) if (typeof b[k] === 'string') l[k] = b[k].trim().slice(0, k === 'description' ? 3000 : 200);
    if (typeof b.website === 'string') l.website = cleanUrl(b.website);
    if (b.categoryId !== undefined) l.categoryId = data.categories.some((c) => c.id === b.categoryId) ? b.categoryId : data.categories[0]?.id || '';
    if (b.areaId !== undefined) l.areaId = data.areas.some((a) => a.id === b.areaId) ? b.areaId : '';
    if (b.mapLink) { const ll = parseLatLng(b.mapLink); if (ll) Object.assign(l, ll); }
    if (b.lat !== undefined && b.lng !== undefined) {
      if (b.lat === '' || b.lat === null) { l.lat = null; l.lng = null; }
      else if (Math.abs(Number(b.lat)) <= 90 && Math.abs(Number(b.lng)) <= 180) { l.lat = Number(b.lat); l.lng = Number(b.lng); }
    }
    if (b.hours !== undefined) l.hours = cleanHours(b.hours);
    if (admin) {
      if (['published', 'pending', 'hidden'].includes(b.status)) l.status = b.status;
      if (b.featuredUntil !== undefined) l.featuredUntil = /^\d{4}-\d{2}-\d{2}$/.test(b.featuredUntil || '') ? b.featuredUntil : '';
      if (b.priceLevel !== undefined) l.priceLevel = Math.min(4, Math.max(0, Number(b.priceLevel) || 0));
      if (Array.isArray(b.photos)) l.photos = b.photos.filter((p) => l.photos.includes(p));
      if (typeof b.slug === 'string' && b.slug.trim()) {
        const taken = new Set(data.listings.filter((x) => x.id !== l.id).map((x) => x.slug));
        l.slug = uniqueSlug(b.slug, taken);
      }
    }
    l.updatedAt = new Date().toISOString();
  }

  function newListing(b, status, admin) {
    const l = { id: crypto.randomUUID(), slug: '', name: '', categoryId: data.categories[0]?.id || '', areaId: '', description: '', address: '', phone: '', whatsapp: '', website: '', facebook: '', instagram: '', tags: '', lat: null, lng: null, hours: null, photos: [], priceLevel: 0, featuredUntil: '', status, views: 0, clicks: { call: 0, whatsapp: 0, directions: 0, website: 0 }, createdAt: new Date().toISOString() };
    applyListing(l, b, { admin });
    l.slug = uniqueSlug(b.slug || l.name, new Set(data.listings.map((x) => x.slug)));
    return l;
  }

  function seedTemplate(type, lang) {
    const tpl = TEMPLATES[type] || TEMPLATES.general;
    const taken = new Set(data.categories.map((c) => c.slug));
    tpl[lang === 'en' ? 'en' : 'ar'].forEach(([icon, name, schemaType], i) => {
      const slug = uniqueSlug(name, taken);
      taken.add(slug);
      data.categories.push({ id: crypto.randomUUID(), slug, name, icon, schemaType, order: i });
    });
  }

  // ---------------- routes ----------------
  async function route(req, res) {
    const url = new URL(req.url, 'http://localhost');
    let p;
    try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad path'); }
    const method = req.method;
    let m;

    if (p === '/health') return send(res, 200, { ok: true, version: VERSION });
    if (method === 'GET' && (m = p.match(/^\/media\/([\w-]+\.(jpg|png|webp))$/))) return sendFile(res, path.join(dataDir, 'media', m[1]), { 'cache-control': 'public, max-age=604800' });
    if (method === 'GET' && /^\/(site\.css|review\.js|add\.js|favicon\.svg)$/.test(p)) return serveStatic(res, p.slice(1), { 'cache-control': 'public, max-age=3600' });

    // admin SPA
    if (method === 'GET' && (p === '/admin' || p === '/admin/')) return serveStatic(res, 'admin.html');
    if (method === 'GET' && /^\/(admin\.js|style\.css|demo\.js)$/.test(p)) return serveStatic(res, p.slice(1));

    if (!data.admin && method === 'GET' && !p.startsWith('/api/')) return send(res, 302, '', { location: '/admin' });

    // ----- public pages -----
    if (method === 'GET') {
      if (p === '/robots.txt') return send(res, 200, `User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${originOf(req)}/sitemap.xml\n`);
      if (p === '/sitemap.xml') {
        const o = originOf(req);
        const urls = ['/', ...data.categories.map((c) => `/c/${encodeURIComponent(c.slug)}`), ...published().map((l) => `/l/${encodeURIComponent(l.slug)}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${esc(o + u)}</loc></url>`).join('\n')}\n</urlset>`;
        return send(res, 200, xml, { 'content-type': 'application/xml; charset=utf-8' });
      }
      if (p === '/') return html(res, 200, homePage(ctx(req)));
      if ((m = p.match(/^\/c\/([^/]+)$/))) {
        const c = data.categories.find((x) => x.slug === m[1]);
        if (!c) return html(res, 404, notFoundPage(ctx(req)));
        const areaSlug = url.searchParams.get('area') || '';
        const area = data.areas.find((a) => a.slug === areaSlug);
        const items = sortListings(published().filter((l) => l.categoryId === c.id && (!area || l.areaId === area.id)));
        const k = ctx(req);
        return html(res, 200, listPage(k, { title: area ? `${c.name} - ${area.name}` : c.name, description: `${c.name}${area ? ' ' + area.name : ''} · ${data.settings.siteName}`, canonical: `/c/${encodeURIComponent(c.slug)}${area ? `?area=${encodeURIComponent(area.slug)}` : ''}`, items, total: items.length, areaFilter: { base: `/c/${encodeURIComponent(c.slug)}`, current: area ? area.slug : '' } }));
      }
      if ((m = p.match(/^\/a\/([^/]+)$/))) {
        const a = data.areas.find((x) => x.slug === m[1]);
        if (!a) return html(res, 404, notFoundPage(ctx(req)));
        const items = sortListings(published().filter((l) => l.areaId === a.id));
        return html(res, 200, listPage(ctx(req), { title: a.name, canonical: `/a/${encodeURIComponent(a.slug)}`, items, total: items.length, areaFilter: { base: `/a/${encodeURIComponent(a.slug)}`, current: '' } }));
      }
      if (p === '/search') {
        const q = String(url.searchParams.get('q') || '').slice(0, 100);
        const areaSlug = url.searchParams.get('area') || '';
        const area = data.areas.find((a) => a.slug === areaSlug);
        const scored = published()
          .filter((l) => !area || l.areaId === area.id)
          .map((l) => {
            const extra = `${data.categories.find((c) => c.id === l.categoryId)?.name || ''} ${data.areas.find((a) => a.id === l.areaId)?.name || ''}`;
            return { l, s: matchScore(l, q, extra) + (isFeatured(l) ? 0.5 : 0) };
          })
          .filter((x) => x.s > 0.5 || !q)
          .sort((a, b) => b.s - a.s);
        const k = ctx(req, q);
        return html(res, 200, listPage(k, { title: q || data.settings.siteName, items: scored.slice(0, 60).map((x) => x.l), total: scored.length, areaFilter: { base: `/search?q=${encodeURIComponent(q)}`, current: area ? area.slug : '' } }));
      }
      if ((m = p.match(/^\/l\/([^/]+)$/))) {
        const l = data.listings.find((x) => x.slug === m[1] && x.status === 'published');
        if (!l) return html(res, 404, notFoundPage(ctx(req)));
        if (!/bot|crawl|spider|preview/i.test(req.headers['user-agent'] || '')) { l.views = (l.views || 0) + 1; save(); }
        const reviews = data.reviews.filter((r) => r.listingId === l.id && r.status === 'approved').sort((a, b) => b.at.localeCompare(a.at));
        return html(res, 200, listingPage(ctx(req), l, reviews));
      }
      if (p === '/add' && data.settings.submissionsOpen) return html(res, 200, addPage(ctx(req)));
    }

    // ----- public API -----
    if (p === '/api/public/click' && method === 'POST') {
      // Counts calls, WhatsApp chats and directions: the leads a listing brings its owner.
      const body = await readJson(req).catch(() => ({}));
      const l = data.listings.find((x) => x.id === body.id && x.status === 'published');
      if (l && ['call', 'whatsapp', 'directions', 'website'].includes(body.type)) {
        l.clicks = l.clicks || {};
        l.clicks[body.type] = (l.clicks[body.type] || 0) + 1;
        save();
      }
      return send(res, 204, '');
    }
    if (p === '/api/public/review' && method === 'POST') {
      const body = await readJson(req);
      if (body.website) return send(res, 200, { ok: true }); // honeypot
      if (!data.settings.reviewsOpen) return send(res, 403, { error: 'Reviews are closed' });
      if (!publicLimiter.allow('r' + clientIp(req))) return send(res, 429, { error: 'Too many reviews, try later' });
      const l = data.listings.find((x) => x.id === body.listingId && x.status === 'published');
      const rating = Math.round(Number(body.rating));
      const name = String(body.name || '').trim().slice(0, 60);
      const text = String(body.text || '').trim().slice(0, 1000);
      if (!l || !(rating >= 1 && rating <= 5) || !name || !text) return send(res, 400, { error: 'Name, rating and text are required' });
      data.reviews.push({ id: crypto.randomUUID(), listingId: l.id, name, rating, text, status: 'pending', at: new Date().toISOString(), ip: crypto.createHash('sha256').update(clientIp(req) + data.meta.secret).digest('hex').slice(0, 12) });
      save();
      return send(res, 200, { ok: true });
    }
    if (p === '/api/public/submit' && method === 'POST') {
      const body = await readJson(req);
      if (body.website2) return send(res, 200, { ok: true }); // honeypot
      if (!data.settings.submissionsOpen) return send(res, 403, { error: 'Submissions are closed' });
      if (!publicLimiter.allow('s' + clientIp(req))) return send(res, 429, { error: 'Too many submissions, try later' });
      if (!String(body.name || '').trim() || !String(body.contactName || '').trim() || !String(body.contactPhone || '').trim()) return send(res, 400, { error: 'Name and contact details are required' });
      const l = newListing(body, 'pending', false);
      l.submittedBy = { name: String(body.contactName).slice(0, 60), phone: String(body.contactPhone).slice(0, 30), at: new Date().toISOString() };
      data.listings.push(l);
      save();
      return send(res, 200, { ok: true });
    }

    // ----- admin auth -----
    if (demo && method === 'POST' && (p === '/api/setup' || p === '/api/password')) return send(res, 403, { error: 'Not available in the demo' });
    if (p === '/api/session' && method === 'GET') return send(res, 200, { needsSetup: !data.admin, authed: isAuthed(req), setupTokenRequired: Boolean(setupToken), version: VERSION, templates: Object.keys(TEMPLATES), demo: demo ? { password: demo.password, resetMinutes: demo.resetMinutes } : null });
    if (p === '/api/setup' && method === 'POST') {
      if (data.admin) return send(res, 409, { error: 'Already set up' });
      const body = await readJson(req);
      if (setupToken && body.setupToken !== setupToken) return send(res, 403, { error: 'Wrong setup token' });
      if (String(body.password || '').length < 8) return send(res, 400, { error: 'Password must be at least 8 characters' });
      data.admin = hashPassword(String(body.password));
      Object.assign(data.settings, { siteName: String(body.siteName || 'Daleel').slice(0, 80), tagline: String(body.tagline || '').slice(0, 160), lang: body.lang === 'en' ? 'en' : 'ar', timezone: String(body.timezone || '') });
      seedTemplate(body.template, data.settings.lang);
      for (const name of String(body.areas || '').split(/[,،\n]/).map((x) => x.trim()).filter(Boolean).slice(0, 50)) data.areas.push({ id: crypto.randomUUID(), slug: uniqueSlug(name, new Set(data.areas.map((a) => a.slug))), name });
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/login' && method === 'POST') {
      if (!loginLimiter.allow(clientIp(req))) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
      const body = await readJson(req);
      if (!verifyPassword(String(body.password || ''), data.admin)) return send(res, 401, { error: 'Wrong password' });
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/logout' && method === 'POST') return send(res, 200, { ok: true }, { 'set-cookie': cookie(req, 'daleel_session', '', 0) });

    if (p.startsWith('/api/')) {
      if (!isAuthed(req)) return send(res, 401, { error: 'Not signed in' });
      if (method !== 'GET' && !(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { error: 'Send JSON' });
      return api(req, res, url, p, method);
    }

    return html(res, 404, notFoundPage(ctx(req)));
  }

  async function api(req, res, url, p, method) {
    let m;
    if (p === '/api/overview' && method === 'GET') {
      const pub = published();
      const sum = (k) => pub.reduce((s, l) => s + (l.clicks?.[k] || 0), 0);
      return send(res, 200, {
        listings: pub.length, pending: data.listings.filter((l) => l.status === 'pending').length, reviewsPending: data.reviews.filter((r) => r.status === 'pending').length,
        featured: pub.filter(isFeatured).length, views: pub.reduce((s, l) => s + (l.views || 0), 0), calls: sum('call'), whatsapp: sum('whatsapp'), directions: sum('directions'),
        top: [...pub].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8).map((l) => ({ id: l.id, name: l.name, views: l.views || 0, leads: Object.values(l.clicks || {}).reduce((s, n) => s + n, 0) })),
        categories: data.categories.length, areas: data.areas.length,
      });
    }

    // ----- listings -----
    if (p === '/api/listings' && method === 'GET') {
      const st = url.searchParams.get('status');
      const q = String(url.searchParams.get('q') || '');
      const list = data.listings.filter((l) => (!st || l.status === st) && (!q || normalize(l.name).includes(normalize(q)) || String(l.phone).includes(q)));
      return send(res, 200, { listings: list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 500) });
    }
    if (p === '/api/listings' && method === 'POST') {
      const body = await readJson(req);
      if (!String(body.name || '').trim()) return send(res, 400, { error: 'Name is required' });
      const l = newListing(body, body.status || 'published', true);
      data.listings.push(l);
      save();
      return send(res, 200, { listing: l });
    }
    if (p === '/api/listings/import' && method === 'POST') {
      const body = await readJson(req);
      const rows = parseCsv(String(body.csv || ''));
      if (rows.length < 2) return send(res, 400, { error: 'The CSV needs a header row and at least one listing' });
      const head = rows[0].map((h) => h.trim().toLowerCase());
      let added = 0;
      for (const row of rows.slice(1, 5001)) {
        const o = Object.fromEntries(head.map((h, i) => [h, (row[i] || '').trim()]));
        if (!o.name) continue;
        const cat = data.categories.find((c) => normalize(c.name) === normalize(o.category)) || (o.category ? addCategory(o.category) : data.categories[0]);
        const area = data.areas.find((a) => normalize(a.name) === normalize(o.area)) || (o.area ? addArea(o.area) : null);
        const l = newListing({ ...o, categoryId: cat?.id, areaId: area?.id || '', lat: o.lat || undefined, lng: o.lng || undefined }, 'published', true);
        data.listings.push(l);
        added += 1;
      }
      save();
      return send(res, 200, { added });
    }
    if ((m = p.match(/^\/api\/listings\/([\w-]+)$/))) {
      const l = data.listings.find((x) => x.id === m[1]);
      if (!l) return send(res, 404, { error: 'Listing not found' });
      if (method === 'GET') return send(res, 200, { listing: l });
      if (method === 'PUT') { applyListing(l, await readJson(req), { admin: true }); save(); return send(res, 200, { listing: l }); }
      if (method === 'DELETE') {
        for (const ph of l.photos || []) fs.rmSync(path.join(dataDir, 'media', ph), { force: true });
        data.listings = data.listings.filter((x) => x.id !== l.id);
        data.reviews = data.reviews.filter((r) => r.listingId !== l.id);
        save();
        return send(res, 200, { ok: true });
      }
    }
    if ((m = p.match(/^\/api\/listings\/([\w-]+)\/photos$/)) && method === 'POST') {
      const l = data.listings.find((x) => x.id === m[1]);
      if (!l) return send(res, 404, { error: 'Listing not found' });
      if ((l.photos || []).length >= 12) return send(res, 400, { error: 'Up to 12 photos per listing' });
      const name = saveImage((await readJson(req)).data);
      if (!name) return send(res, 400, { error: 'Use a JPG, PNG or WebP photo up to 6 MB' });
      l.photos = [...(l.photos || []), name];
      save();
      return send(res, 200, { listing: l });
    }

    // ----- categories and areas -----
    if (p === '/api/taxonomy' && method === 'GET') return send(res, 200, { categories: data.categories, areas: data.areas });
    if (p === '/api/categories' && method === 'POST') {
      const b = await readJson(req);
      if (!String(b.name || '').trim()) return send(res, 400, { error: 'Name is required' });
      return send(res, 200, { category: addCategory(b.name, b.icon) });
    }
    if (p === '/api/areas' && method === 'POST') {
      const b = await readJson(req);
      if (!String(b.name || '').trim()) return send(res, 400, { error: 'Name is required' });
      return send(res, 200, { area: addArea(b.name) });
    }
    if ((m = p.match(/^\/api\/(categories|areas)\/([\w-]+)$/))) {
      const list = data[m[1]];
      const item = list.find((x) => x.id === m[2]);
      if (!item) return send(res, 404, { error: 'Not found' });
      if (method === 'PUT') {
        const b = await readJson(req);
        if (typeof b.name === 'string' && b.name.trim()) item.name = b.name.trim().slice(0, 60);
        if (typeof b.icon === 'string' && b.icon.trim()) item.icon = [...b.icon.trim()].slice(0, 2).join('');
        if (b.order != null) item.order = Number(b.order) || 0;
        save();
        return send(res, 200, { item });
      }
      if (method === 'DELETE') {
        const field = m[1] === 'categories' ? 'categoryId' : 'areaId';
        if (data.listings.some((l) => l[field] === item.id)) return send(res, 409, { error: 'Move the listings out of it first' });
        data[m[1]] = list.filter((x) => x.id !== item.id);
        save();
        return send(res, 200, { ok: true });
      }
    }

    // ----- reviews -----
    if (p === '/api/reviews' && method === 'GET') {
      const st = url.searchParams.get('status') || 'pending';
      return send(res, 200, { reviews: data.reviews.filter((r) => r.status === st).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300).map((r) => ({ ...r, listing: data.listings.find((l) => l.id === r.listingId)?.name || '' })) });
    }
    if ((m = p.match(/^\/api\/reviews\/([\w-]+)$/))) {
      const r = data.reviews.find((x) => x.id === m[1]);
      if (!r) return send(res, 404, { error: 'Review not found' });
      if (method === 'PUT') { const b = await readJson(req); if (['approved', 'pending', 'rejected'].includes(b.status)) r.status = b.status; save(); return send(res, 200, { review: r }); }
      if (method === 'DELETE') { data.reviews = data.reviews.filter((x) => x.id !== r.id); save(); return send(res, 200, { ok: true }); }
    }

    // ----- settings -----
    if (p === '/api/settings' && method === 'GET') return send(res, 200, { settings: data.settings, timezone: tz() });
    if (p === '/api/settings' && method === 'PUT') {
      const b = (await readJson(req)).settings || {};
      const s = data.settings;
      for (const k of ['siteName', 'tagline', 'footer', 'featuredInfo', 'timezone']) if (typeof b[k] === 'string') s[k] = b[k].slice(0, k === 'featuredInfo' || k === 'footer' ? 500 : 160);
      if (b.lang === 'ar' || b.lang === 'en') s.lang = b.lang;
      if (/^#[0-9a-f]{6}$/i.test(b.color || '')) s.color = b.color;
      if (typeof b.logoEmoji === 'string' && b.logoEmoji.trim()) s.logoEmoji = [...b.logoEmoji.trim()].slice(0, 2).join('');
      for (const k of ['submissionsOpen', 'reviewsOpen']) if (typeof b[k] === 'boolean') s[k] = b[k];
      save();
      return send(res, 200, { settings: s });
    }
    if (p === '/api/password' && method === 'POST') {
      const body = await readJson(req);
      if (!verifyPassword(String(body.current || ''), data.admin)) return send(res, 401, { error: 'Current password is wrong' });
      if (String(body.next || '').length < 8) return send(res, 400, { error: 'New password must be at least 8 characters' });
      data.admin = hashPassword(String(body.next));
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    return send(res, 404, { error: 'Not found' });
  }

  function addCategory(name, icon = '📍') {
    const c = { id: crypto.randomUUID(), slug: uniqueSlug(name, new Set(data.categories.map((x) => x.slug))), name: String(name).trim().slice(0, 60), icon: [...String(icon || '📍')].slice(0, 2).join(''), schemaType: 'LocalBusiness', order: data.categories.length };
    data.categories.push(c);
    save();
    return c;
  }
  function addArea(name) {
    const a = { id: crypto.randomUUID(), slug: uniqueSlug(name, new Set(data.areas.map((x) => x.slug))), name: String(name).trim().slice(0, 60) };
    data.areas.push(a);
    save();
    return a;
  }

  const server = http.createServer((req, res) => {
    route(req, res).catch((err) => {
      const status = err.status || 500;
      if (status === 500) console.error('[http]', err);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'Internal error' : err.message });
    });
  });
  return {
    resetDemo,
    server, data,
    async start(port) { await new Promise((r) => server.listen(port, r)); return server.address().port; },
    async stop() { clearInterval(demoTimer); flush(); await new Promise((r) => server.close(r)); },
  };
}

// Small RFC 4180 CSV parser (quotes, commas and newlines inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}
