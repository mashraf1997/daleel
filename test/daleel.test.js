import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp, parseCsv } from '../src/app.js';
import { isOpenNow, parseLatLng, matchScore, slugify } from '../src/util.js';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
let app, base, jar, dataDir;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'daleel-'));
  app = createApp({ dataDir });
  base = `http://127.0.0.1:${await app.start(0)}`;
});
after(async () => {
  await app.stop();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function call(p, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const res = await fetch(base + p, { method, redirect: 'manual', headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(auth && jar ? { cookie: jar } : {}), ...headers }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json, headers: res.headers, text };
}

test('helpers: slugs, map links, Arabic search, opening hours', () => {
  assert.equal(slugify('مطعم أبو السيد!'), 'مطعم-أبو-السيد');
  assert.deepEqual(parseLatLng('https://www.google.com/maps/place/X/@29.9602,31.2569,17z/data=!3m1'), { lat: 29.9602, lng: 31.2569 });
  assert.deepEqual(parseLatLng('https://maps.google.com/?q=30.05,31.23'), { lat: 30.05, lng: 31.23 });
  assert.deepEqual(parseLatLng('29.96, 31.25'), { lat: 29.96, lng: 31.25 });
  assert.equal(parseLatLng('hello'), null);
  assert.ok(matchScore({ name: 'كشري أبو طارق', description: '', tags: '' }, 'كشرى ابو طارق') > 0, 'ى/ي and أ/ا match');
  assert.equal(matchScore({ name: 'Pizza', description: '', tags: '' }, 'sushi'), 0);
  // Monday 23:30 UTC, open Monday 18:00-02:00 => open; Tuesday 01:00 => still open from Monday's shift
  const hours = [null, ['18:00', '02:00'], null, null, null, null, null];
  assert.equal(isOpenNow(hours, 'UTC', Date.parse('2026-11-02T23:30:00Z')), true);
  assert.equal(isOpenNow(hours, 'UTC', Date.parse('2026-11-03T01:00:00Z')), true);
  assert.equal(isOpenNow(hours, 'UTC', Date.parse('2026-11-03T03:00:00Z')), false);
  assert.equal(isOpenNow(null, 'UTC'), null);
  assert.deepEqual(parseCsv('name,phone\n"Café, ""Nile""",0100\n'), [['name', 'phone'], ['Café, "Nile"', '0100']]);
});

test('before setup every page leads to the admin setup', async () => {
  const r = await call('/');
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/admin');
});

let cafe;
test('setup seeds categories and areas from the directory type', async () => {
  let r = await call('/api/setup', { method: 'POST', body: { siteName: 'دليل المعادي', tagline: 'كل أماكن المعادي', template: 'food', areas: 'المعادي، دجلة', password: 'owner-pass-1', timezone: 'UTC' } });
  jar = r.headers.get('set-cookie').split(';')[0];
  r = await call('/api/taxonomy');
  assert.equal(r.body.categories[1].name, 'كافيهات');
  assert.deepEqual(r.body.areas.map((a) => a.name), ['المعادي', 'دجلة']);
  const cat = r.body.categories[1];
  r = await call('/api/listings', { method: 'POST', body: { name: 'كافيه النيل', categoryId: cat.id, areaId: r.body.areas[0].id, phone: '+20 100 123 4567', whatsapp: '+201001234567', description: 'أحسن قهوة مختصة على النيل', tags: 'قهوة, واي فاي', mapLink: 'https://www.google.com/maps/@29.96,31.25,17z', hours: [['08:00', '23:00'], ['08:00', '23:00'], ['08:00', '23:00'], ['08:00', '23:00'], ['08:00', '23:00'], ['08:00', '01:00'], null] } });
  cafe = r.body.listing;
  assert.equal(cafe.slug, 'كافيه-النيل');
  assert.equal(cafe.lat, 29.96);
  r = await call(`/api/listings/${cafe.id}/photos`, { method: 'POST', body: { data: PNG.toString('base64') } });
  assert.equal(r.body.listing.photos.length, 1);
  r = await call(`/api/listings/${cafe.id}/photos`, { method: 'POST', body: { data: Buffer.from('not an image').toString('base64') } });
  assert.equal(r.status, 400);
});

test('public pages render with SEO data', async () => {
  let r = await call('/', { auth: false });
  assert.equal(r.status, 200);
  assert.match(r.text, /<title>دليل المعادي · كل أماكن المعادي<\/title>/);
  assert.match(r.text, /كافيه النيل/);
  r = await call('/l/' + encodeURIComponent(cafe.slug), { auth: false });
  assert.match(r.text, /"@type":"CafeOrCoffeeShop"/);
  assert.match(r.text, /"latitude":29.96/);
  assert.match(r.text, /href="https:\/\/wa\.me\/201001234567"/);
  assert.match(r.text, /openstreetmap\.org\/export\/embed\.html/);
  assert.match(r.text, /rel="canonical" href="http:\/\/127\.0\.0\.1:\d+\/l\/%D9%83/);
  r = await call('/search?q=' + encodeURIComponent('قهوه'), { auth: false });
  assert.match(r.text, /كافيه النيل/, 'search by tag with ة/ه normalized');
  r = await call('/sitemap.xml', { auth: false });
  assert.match(r.text, /<loc>http:\/\/127\.0\.0\.1:\d+\/l\/%D9%83/);
  r = await call('/robots.txt', { auth: false });
  assert.match(r.text, /Disallow: \/admin/);
  r = await call('/l/nope', { auth: false });
  assert.equal(r.status, 404);
  r = await call('/l/' + encodeURIComponent(cafe.slug), { auth: false, headers: { 'user-agent': 'Googlebot/2.1' } });
  assert.equal(app.data.listings[0].views, 1, 'bots are not counted as views');
});

test('click tracking and reviews with moderation and honeypot', async () => {
  await call('/api/public/click', { method: 'POST', body: { id: cafe.id, type: 'whatsapp' }, auth: false });
  await call('/api/public/click', { method: 'POST', body: { id: cafe.id, type: 'bogus' }, auth: false });
  assert.deepEqual(app.data.listings[0].clicks.whatsapp, 1);
  let r = await call('/api/public/review', { method: 'POST', auth: false, body: { listingId: cafe.id, rating: 5, name: 'سارة', text: 'مكان هادي وقهوته حلوة' } });
  assert.equal(r.body.ok, true);
  await call('/api/public/review', { method: 'POST', auth: false, body: { listingId: cafe.id, rating: 1, name: 'bot', text: 'spam', website: 'http://spam' } });
  assert.equal(app.data.reviews.length, 1, 'honeypot filled = dropped');
  r = await call('/l/' + encodeURIComponent(cafe.slug), { auth: false });
  assert.doesNotMatch(r.text, /قهوته حلوة/, 'pending reviews are hidden');
  const id = app.data.reviews[0].id;
  await call('/api/reviews/' + id, { method: 'PUT', body: { status: 'approved' } });
  r = await call('/l/' + encodeURIComponent(cafe.slug), { auth: false });
  assert.match(r.text, /قهوته حلوة/);
  assert.match(r.text, /"ratingValue":"5.0"/);
});

test('visitor submissions wait for approval', async () => {
  let r = await call('/api/public/submit', { method: 'POST', auth: false, body: { name: 'مخبز الحارة', contactName: 'عم سيد', contactPhone: '0111', phone: '0111' } });
  assert.equal(r.body.ok, true);
  const sub = app.data.listings.find((l) => l.name === 'مخبز الحارة');
  assert.equal(sub.status, 'pending');
  r = await call('/l/' + encodeURIComponent(sub.slug), { auth: false });
  assert.equal(r.status, 404);
  r = await call('/api/overview');
  assert.equal(r.body.pending, 1);
  await call('/api/listings/' + sub.id, { method: 'PUT', body: { status: 'published' } });
  r = await call('/l/' + encodeURIComponent(sub.slug), { auth: false });
  assert.equal(r.status, 200);
});

test('featured listings come first; CSV import creates missing categories and areas', async () => {
  const csv = 'name,category,area,phone,lat,lng\n"Sushi Bar",سوشي,زهراء المعادي,0122,29.95,31.27\nكشري التحرير,مطاعم,المعادي,0100,,';
  let r = await call('/api/listings/import', { method: 'POST', body: { csv } });
  assert.equal(r.body.added, 2);
  r = await call('/api/taxonomy');
  assert.ok(r.body.categories.some((c) => c.name === 'سوشي'));
  assert.ok(r.body.areas.some((a) => a.name === 'زهراء المعادي'));
  const sushi = app.data.listings.find((l) => l.name === 'Sushi Bar');
  await call('/api/listings/' + sushi.id, { method: 'PUT', body: { featuredUntil: '2099-01-01' } });
  r = await call('/', { auth: false });
  assert.ok(r.text.indexOf('Sushi Bar') < r.text.indexOf('كافيه النيل'), 'featured shows before others');
  r = await call('/api/categories/' + app.data.categories.find((c) => c.name === 'سوشي').id, { method: 'DELETE', body: {} });
  assert.equal(r.status, 409, 'cannot delete a category that has listings');
});

test('admin API needs a session', async () => {
  assert.equal((await call('/api/listings', { auth: false })).status, 401);
});
