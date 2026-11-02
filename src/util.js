// Helpers: Arabic-aware search, slugs, opening hours, map links.

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export const tokens = (text) => (normalize(text).match(/[\p{L}\p{N}]+/gu) || []).map((w) => w.replace(/^(وال|بال|لل|ال)(?=\p{L}{2,})/u, ''));

export function slugify(text) {
  const s = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return s || 'item';
}

export function uniqueSlug(base, taken) {
  let slug = slugify(base);
  let i = 2;
  while (taken.has(slug)) slug = `${slugify(base)}-${i++}`;
  return slug;
}

/** Score a listing for a query: every query word must match somewhere. */
export function matchScore(listing, query, extra = '') {
  const q = tokens(query);
  if (!q.length) return 1;
  const fields = [
    [tokens(listing.name), 5],
    [tokens(`${listing.tags || ''} ${extra}`), 3],
    [tokens(listing.description), 1],
    [tokens(listing.address), 1],
  ];
  let score = 0;
  for (const w of q) {
    let hit = 0;
    for (const [list, weight] of fields) if (list.some((t) => t === w || (w.length >= 3 && t.startsWith(w)))) hit = Math.max(hit, weight);
    if (!hit) return 0;
    score += hit;
  }
  return score;
}

// ---------- opening hours ----------
// hours: array of 7 (Sunday..Saturday), each null (closed) or [open, close] as "HH:MM"; close may be after midnight.
export function localNow(tz, ts = Date.now()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', weekday: 'short', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), minutes: Number(p.hour) * 60 + Number(p.minute) };
}
const toMin = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };

export function isOpenNow(hours, tz, ts = Date.now()) {
  if (!Array.isArray(hours) || hours.every((h) => !h)) return null; // unknown
  const { day, minutes } = localNow(tz, ts);
  const today = hours[day];
  if (today) {
    const o = toMin(today[0]);
    let c = toMin(today[1]);
    if (c <= o) c += 1440;
    if (minutes >= o && minutes < c) return true;
  }
  const y = hours[(day + 6) % 7]; // yesterday's shift running past midnight
  if (y) {
    const o = toMin(y[0]);
    const c = toMin(y[1]);
    if (c <= o && minutes < c) return true;
  }
  return false;
}

/** Parse coordinates from a pasted Google Maps / OpenStreetMap link or "lat, lng". */
export function parseLatLng(text) {
  const s = decodeURIComponent(String(text || ''));
  const pats = [/@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/, /[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/, /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/, /mlat=(-?\d{1,2}\.\d+)&mlon=(-?\d{1,3}\.\d+)/, /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/];
  for (const re of pats) {
    const m = s.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

export const waNumber = (p) => String(p || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d]/g, '').replace(/^00/, '');
