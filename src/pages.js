// Server-rendered public pages: fast, indexable, and readable without JavaScript.
import { isOpenNow, waNumber } from './util.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const T = {
  ar: {
    search: 'دوّر على مكان أو خدمة…', searchBtn: 'بحث', categories: 'الأقسام', featured: 'أماكن مميزة', newest: 'أُضيف حديثاً', all: 'كل المناطق', results: 'نتيجة', noResults: 'مفيش نتايج. جرّب كلمة تانية.', add: '+ أضف مكانك', home: 'الرئيسية',
    open: 'مفتوح دلوقتي', closed: 'مقفول دلوقتي', call: 'اتصل', whatsapp: 'واتساب', directions: 'الاتجاهات', website: 'الموقع', hours: 'مواعيد العمل', closedDay: 'إجازة', about: 'عن المكان', reviews: 'التقييمات', noReviews: 'لسه مفيش تقييمات. كن أول واحد!',
    writeReview: 'اكتب تقييمك', yourName: 'اسمك', yourReview: 'رأيك', send: 'ابعت', reviewThanks: 'شكراً! تقييمك هيظهر بعد المراجعة.', address: 'العنوان', area: 'المنطقة', featuredBadge: 'مميز', price: 'الأسعار',
    addTitle: 'أضف مكانك للدليل', addLead: 'املا البيانات وهنراجعها وننشرها في أقرب وقت. الإضافة مجانية.', name: 'اسم المكان', category: 'القسم', phone: 'التليفون', desc: 'وصف قصير', mapLink: 'لينك المكان على جوجل ماب (اختياري)', contactName: 'اسمك', contactPhone: 'رقمك للتواصل', submitThanks: 'استلمنا طلبك! هنراجعه وننشره قريباً.', featuredInfo: 'عايز مكانك يظهر في المميزين؟',
    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], notFound: 'الصفحة دي مش موجودة.', places: 'مكان', views: 'مشاهدة', poweredBy: 'مدعوم بـ',
  },
  en: {
    search: 'Search places and services…', searchBtn: 'Search', categories: 'Categories', featured: 'Featured places', newest: 'Recently added', all: 'All areas', results: 'results', noResults: 'No results. Try another word.', add: '+ Add your place', home: 'Home',
    open: 'Open now', closed: 'Closed now', call: 'Call', whatsapp: 'WhatsApp', directions: 'Directions', website: 'Website', hours: 'Opening hours', closedDay: 'Closed', about: 'About', reviews: 'Reviews', noReviews: 'No reviews yet. Be the first!',
    writeReview: 'Write a review', yourName: 'Your name', yourReview: 'Your review', send: 'Send', reviewThanks: 'Thank you! Your review will appear after moderation.', address: 'Address', area: 'Area', featuredBadge: 'Featured', price: 'Prices',
    addTitle: 'Add your place', addLead: 'Fill in the details. We review and publish it soon. Listing is free.', name: 'Place name', category: 'Category', phone: 'Phone', desc: 'Short description', mapLink: 'Google Maps link (optional)', contactName: 'Your name', contactPhone: 'Your phone', submitThanks: 'Received! We will review and publish it soon.', featuredInfo: 'Want your place featured?',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], notFound: 'This page does not exist.', places: 'places', views: 'views', poweredBy: 'Powered by',
  },
};

export function strings(lang) {
  return T[lang] || T.ar;
}

function stars(n) {
  const r = Math.round(n * 2) / 2;
  return `<span class="stars" aria-label="${r} / 5">${'★'.repeat(Math.floor(r))}${r % 1 ? '½' : ''}<span class="off">${'★'.repeat(5 - Math.ceil(r))}</span></span>`;
}

export function layout(ctx, { title, description, canonical, body, ld, image }) {
  const s = ctx.settings;
  const t = strings(s.lang);
  const full = title ? `${title} · ${s.siteName}` : `${s.siteName}${s.tagline ? ' · ' + s.tagline : ''}`;
  return `<!DOCTYPE html>
<html lang="${s.lang}" dir="${s.lang === 'en' ? 'ltr' : 'rtl'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description || s.tagline || '')}">
${canonical ? `<link rel="canonical" href="${esc(ctx.origin + canonical)}">` : ''}
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description || s.tagline || '')}">
<meta property="og:type" content="website">
${image ? `<meta property="og:image" content="${esc(ctx.origin + image)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site.css">
<style>:root{--c:${esc(s.color)}}</style>
${ld ? `<script type="application/ld+json">${jsonLd(ld)}</script>` : ''}
</head>
<body>
<header class="top"><div class="wrap row">
  <a class="logo" href="/">${esc(s.logoEmoji || '📍')} <b>${esc(s.siteName)}</b></a>
  <form class="q" action="/search" method="get" role="search"><input type="search" name="q" placeholder="${esc(t.search)}" aria-label="${esc(t.search)}" value="${esc(ctx.q || '')}"><button type="submit">${esc(t.searchBtn)}</button></form>
  ${s.submissionsOpen ? `<a class="add" href="/add">${esc(t.add)}</a>` : ''}
</div></header>
<main class="wrap">${body}</main>
<footer class="foot"><div class="wrap">${s.footer ? `<p>${esc(s.footer)}</p>` : ''}<p class="muted">${esc(t.poweredBy)} <a href="https://github.com/mashraf1997/daleel" rel="noopener">Daleel</a></p></div></footer>
</body>
</html>`;
}

export function card(ctx, l) {
  const t = strings(ctx.settings.lang);
  const cat = ctx.catById(l.categoryId);
  const area = ctx.areaById(l.areaId);
  const open = isOpenNow(l.hours, ctx.tz);
  const r = ctx.ratingOf(l.id);
  return `<a class="card" href="/l/${encodeURIComponent(l.slug)}">
    <div class="ph">${l.photos?.[0] ? `<img src="/media/${esc(l.photos[0])}" alt="" loading="lazy">` : `<span>${esc(cat?.icon || '📍')}</span>`}${ctx.isFeatured(l) ? `<em class="feat">${esc(t.featuredBadge)}</em>` : ''}</div>
    <div class="bd"><b>${esc(l.name)}</b>
      <span class="meta">${esc([cat?.name, area?.name].filter(Boolean).join(' · '))}</span>
      <span class="meta">${r.count ? `${stars(r.avg)} <small>(${r.count})</small>` : ''}${open === true ? `<i class="open">${esc(t.open)}</i>` : open === false ? `<i class="closed">${esc(t.closed)}</i>` : ''}</span></div></a>`;
}

export function homePage(ctx) {
  const t = strings(ctx.settings.lang);
  const cats = ctx.categories.map((c) => `<a class="cat" href="/c/${encodeURIComponent(c.slug)}"><span>${esc(c.icon)}</span><b>${esc(c.name)}</b><small>${ctx.countIn(c.id)} ${esc(t.places)}</small></a>`).join('');
  const featured = ctx.featured();
  const newest = ctx.newest(8);
  return layout(ctx, {
    canonical: '/',
    body: `<section class="hero"><h1>${esc(ctx.settings.siteName)}</h1>${ctx.settings.tagline ? `<p>${esc(ctx.settings.tagline)}</p>` : ''}</section>
      <section><h2>${esc(t.categories)}</h2><div class="cats">${cats}</div></section>
      ${featured.length ? `<section><h2>${esc(t.featured)}</h2><div class="grid">${featured.map((l) => card(ctx, l)).join('')}</div></section>` : ''}
      ${newest.length ? `<section><h2>${esc(t.newest)}</h2><div class="grid">${newest.map((l) => card(ctx, l)).join('')}</div></section>` : ''}`,
    ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: ctx.settings.siteName, url: ctx.origin + '/', potentialAction: { '@type': 'SearchAction', target: `${ctx.origin}/search?q={q}`, 'query-input': 'required name=q' } },
  });
}

export function listPage(ctx, { title, description, canonical, items, areaFilter, total }) {
  const t = strings(ctx.settings.lang);
  const areas = ctx.areas.length ? `<nav class="chips">${[{ slug: '', name: t.all }, ...ctx.areas].map((a) => `<a href="${esc(areaFilter.base)}${a.slug ? `${areaFilter.base.includes('?') ? '&' : '?'}area=${encodeURIComponent(a.slug)}` : ''}" ${areaFilter.current === a.slug ? 'aria-current="true"' : ''}>${esc(a.name)}</a>`).join('')}</nav>` : '';
  return layout(ctx, {
    title, description, canonical,
    body: `<nav class="crumbs"><a href="/">${esc(t.home)}</a> › <span>${esc(title)}</span></nav>
      <h1>${esc(title)} <small>${total} ${esc(t.results)}</small></h1>${areas}
      ${items.length ? `<div class="grid">${items.map((l) => card(ctx, l)).join('')}</div>` : `<p class="empty">${esc(t.noResults)}</p>`}`,
  });
}

export function listingPage(ctx, l, reviews) {
  const s = ctx.settings;
  const t = strings(s.lang);
  const cat = ctx.catById(l.categoryId);
  const area = ctx.areaById(l.areaId);
  const open = isOpenNow(l.hours, ctx.tz);
  const r = ctx.ratingOf(l.id);
  const hasHours = Array.isArray(l.hours) && l.hours.some(Boolean);
  const map = l.lat != null && l.lng != null
    ? `<iframe class="map" title="map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - 0.006},${l.lat - 0.004},${l.lng + 0.006},${l.lat + 0.004}&layer=mapnik&marker=${l.lat},${l.lng}"></iframe>`
    : '';
  const act = (type, cls, label) => `<a class="btn ${cls}" href="${esc(actionUrl(l, type))}" data-track="${type}" rel="nofollow noopener"${type === 'call' ? '' : ' target="_blank"'}>${label}</a>`;
  const actions = [
    l.phone && act('call', '', `📞 ${esc(t.call)}`),
    l.whatsapp && act('whatsapp', 'wa', `💬 ${esc(t.whatsapp)}`),
    (l.lat != null || l.address) && act('directions', '', `🧭 ${esc(t.directions)}`),
    l.website && act('website', '', `🌐 ${esc(t.website)}`),
  ].filter(Boolean).join('');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ld = {
    '@context': 'https://schema.org',
    '@type': cat?.schemaType || 'LocalBusiness',
    name: l.name,
    description: l.description || undefined,
    url: `${ctx.origin}/l/${encodeURIComponent(l.slug)}`,
    telephone: l.phone || undefined,
    image: l.photos?.length ? l.photos.map((p) => `${ctx.origin}/media/${p}`) : undefined,
    address: l.address ? { '@type': 'PostalAddress', streetAddress: l.address, addressLocality: area?.name } : undefined,
    geo: l.lat != null ? { '@type': 'GeoCoordinates', latitude: l.lat, longitude: l.lng } : undefined,
    openingHoursSpecification: hasHours ? l.hours.map((h, i) => (h ? { '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[i], opens: h[0], closes: h[1] } : null)).filter(Boolean) : undefined,
    aggregateRating: r.count ? { '@type': 'AggregateRating', ratingValue: r.avg.toFixed(1), reviewCount: r.count } : undefined,
  };
  return layout(ctx, {
    title: `${l.name}${area ? ' - ' + area.name : ''}`,
    description: (l.description || `${cat?.name || ''} ${area?.name || ''}`).slice(0, 160),
    canonical: `/l/${encodeURIComponent(l.slug)}`,
    image: l.photos?.[0] ? `/media/${l.photos[0]}` : null,
    ld,
    body: `<nav class="crumbs"><a href="/">${esc(t.home)}</a> › ${cat ? `<a href="/c/${encodeURIComponent(cat.slug)}">${esc(cat.name)}</a> › ` : ''}<span>${esc(l.name)}</span></nav>
      <article class="listing">
        ${l.photos?.length ? `<div class="gallery">${l.photos.map((p, i) => `<img src="/media/${esc(p)}" alt="${esc(l.name)}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>` : ''}
        <div class="head"><div><h1>${esc(l.name)} ${ctx.isFeatured(l) ? `<em class="feat">${esc(t.featuredBadge)}</em>` : ''}</h1>
          <p class="meta">${esc([cat?.name, area?.name].filter(Boolean).join(' · '))}${l.priceLevel ? ` · ${'$'.repeat(l.priceLevel)}` : ''}</p>
          <p class="meta">${r.count ? `${stars(r.avg)} ${r.avg.toFixed(1)} (${r.count})` : ''} ${open === true ? `<i class="open">${esc(t.open)}</i>` : open === false ? `<i class="closed">${esc(t.closed)}</i>` : ''}</p></div></div>
        ${actions ? `<div class="actions" data-id="${l.id}">${actions}</div>` : ''}
        <div class="cols">
          <div class="main">
            ${l.description ? `<section><h2>${esc(t.about)}</h2><p class="desc">${esc(l.description)}</p></section>` : ''}
            ${l.tags ? `<p class="tags">${String(l.tags).split(/[,،]/).map((x) => x.trim()).filter(Boolean).map((x) => `<a href="/search?q=${encodeURIComponent(x)}">#${esc(x)}</a>`).join(' ')}</p>` : ''}
            <section id="reviews"><h2>${esc(t.reviews)}</h2>
              ${reviews.length ? reviews.map((v) => `<div class="review"><b>${esc(v.name)}</b> ${stars(v.rating)}<p>${esc(v.text)}</p><small>${esc(v.at.slice(0, 10))}</small></div>`).join('') : `<p class="muted">${esc(t.noReviews)}</p>`}
              ${s.reviewsOpen ? `<form class="rv" id="rv" data-id="${l.id}"><h3>${esc(t.writeReview)}</h3>
                <div class="rate" role="radiogroup">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="r${n}" value="${n}" ${n === 5 ? 'checked' : ''}><label for="r${n}" title="${n}">★</label>`).join('')}</div>
                <input name="name" placeholder="${esc(t.yourName)}" required maxlength="60" aria-label="${esc(t.yourName)}">
                <textarea name="text" placeholder="${esc(t.yourReview)}" required maxlength="1000" aria-label="${esc(t.yourReview)}"></textarea>
                <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
                <button type="submit">${esc(t.send)}</button><p class="ok" hidden>${esc(t.reviewThanks)}</p></form>` : ''}
            </section>
          </div>
          <aside>
            ${l.address ? `<section><h3>${esc(t.address)}</h3><p>${esc(l.address)}</p></section>` : ''}
            ${map}
            ${hasHours ? `<section><h3>${esc(t.hours)}</h3><table class="hours">${t.days.map((d, i) => `<tr${i === new Date().getDay() ? ' class="today"' : ''}><td>${esc(d)}</td><td dir="ltr">${l.hours[i] ? `${esc(l.hours[i][0])} – ${esc(l.hours[i][1])}` : esc(t.closedDay)}</td></tr>`).join('')}</table></section>` : ''}
            ${l.phone ? `<p dir="ltr" class="phone">${esc(l.phone)}</p>` : ''}
          </aside>
        </div>
      </article>
      <script src="/review.js" defer></script>`,
  });
}

export function addPage(ctx) {
  const s = ctx.settings;
  const t = strings(s.lang);
  return layout(ctx, {
    title: t.addTitle,
    canonical: '/add',
    body: `<form class="addform" id="addf"><h1>${esc(t.addTitle)}</h1><p class="muted">${esc(t.addLead)}</p>
      <label>${esc(t.name)}<input name="name" required maxlength="100"></label>
      <div class="two"><label>${esc(t.category)}<select name="categoryId">${ctx.categories.map((c) => `<option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select></label>
      <label>${esc(t.area)}<select name="areaId"><option value=""></option>${ctx.areas.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label></div>
      <div class="two"><label>${esc(t.phone)}<input name="phone" type="tel" dir="ltr"></label><label>${esc(t.whatsapp)}<input name="whatsapp" type="tel" dir="ltr"></label></div>
      <label>${esc(t.address)}<input name="address" maxlength="200"></label>
      <label>${esc(t.mapLink)}<input name="mapLink" dir="ltr"></label>
      <label>${esc(t.desc)}<textarea name="description" maxlength="1500"></textarea></label>
      <div class="two"><label>${esc(t.contactName)}<input name="contactName" required maxlength="60"></label><label>${esc(t.contactPhone)}<input name="contactPhone" type="tel" dir="ltr" required></label></div>
      <input name="website2" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit">${esc(t.send)}</button><p class="ok" hidden>${esc(t.submitThanks)}</p><p class="err" hidden></p>
      ${s.featuredInfo ? `<aside class="note"><b>${esc(t.featuredInfo)}</b><p>${esc(s.featuredInfo)}</p></aside>` : ''}
    </form><script src="/add.js" defer></script>`,
  });
}

export function notFoundPage(ctx) {
  const t = strings(ctx.settings.lang);
  return layout(ctx, { title: '404', body: `<p class="empty">${esc(t.notFound)} <a href="/">${esc(t.home)}</a></p>` });
}

export function actionUrl(l, type) {
  if (type === 'call') return `tel:${String(l.phone || '').replace(/[^\d+]/g, '')}`;
  if (type === 'whatsapp') return `https://wa.me/${waNumber(l.whatsapp)}`;
  if (type === 'website') return /^https?:\/\//i.test(l.website || '') ? l.website : `https://${l.website}`;
  if (type === 'directions') return l.lat != null ? `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address || l.name)}`;
  return null;
}
