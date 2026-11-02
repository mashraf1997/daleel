import crypto from 'node:crypto';
import { defaultData, TEMPLATES } from './app.js';
import { uniqueSlug } from './util.js';

export function buildDemo(demo) {
  const d = defaultData();
  const ar = demo.lang === 'ar';
  Object.assign(d.settings, { siteName: ar ? 'دليل المعادي' : 'Downtown Eats', tagline: ar ? 'كل مطاعم وكافيهات المعادي في مكان واحد' : 'Every restaurant and café downtown', lang: demo.lang, featuredInfo: ar ? 'الظهور في المميزين بـ 500 جنيه في الشهر. كلمنا على واتساب.' : 'Featured placement is $25/month. Message us on WhatsApp.' });
  const taken = new Set();
  TEMPLATES.food[ar ? 'ar' : 'en'].forEach(([icon, name, schemaType], i) => { const slug = uniqueSlug(name, taken); taken.add(slug); d.categories.push({ id: crypto.randomUUID(), slug, name, icon, schemaType, order: i }); });
  const areaNames = ar ? ['المعادي', 'زهراء المعادي', 'دجلة', 'المعادي الجديدة'] : ['Downtown', 'Old Town', 'Riverside', 'Uptown'];
  const at = new Set();
  for (const name of areaNames) { const slug = uniqueSlug(name, at); at.add(slug); d.areas.push({ id: crypto.randomUUID(), slug, name }); }
  const H = (o, c) => Array(7).fill([o, c]);
  const items = ar
    ? [['كافيه النيل', 1, 0, 'قهوة مختصة وإطلالة على النيل، واي فاي سريع ومكان هادي للشغل.', true, H('08:00', '01:00'), 'قهوة, واي فاي'], ['كشري أبو طارق', 0, 0, 'أشهر كشري في المعادي من 1985.', false, H('11:00', '02:00'), 'كشري, عائلي'], ['حلواني العبد', 2, 1, 'حلويات شرقي وغربي وتورت مناسبات.', true, H('10:00', '23:00'), 'تورت, حلويات'], ['بيتزا روما', 0, 2, 'بيتزا نابولي في فرن حطب.', false, H('13:00', '00:00'), 'بيتزا'], ['مخبز الحارة', 3, 0, 'عيش بلدي وفينو طازة كل ساعة.', false, H('06:00', '22:00'), 'عيش'], ['مطبخ ماما', 4, 3, 'أكل بيتي يومي بالطلب.', false, null, 'أكل بيتي']]
    : [['Nile Café', 1, 0, 'Specialty coffee with a river view, fast Wi-Fi.', true, H('08:00', '01:00'), 'coffee, wifi'], ['Koshary House', 0, 0, 'The classic since 1985.', false, H('11:00', '02:00'), 'koshary'], ['Sweet Corner', 2, 1, 'Cakes and pastries for every occasion.', true, H('10:00', '23:00'), 'cakes'], ['Roma Pizza', 0, 2, 'Neapolitan pizza from a wood oven.', false, H('13:00', '00:00'), 'pizza'], ['Corner Bakery', 3, 0, 'Fresh bread every hour.', false, H('06:00', '22:00'), 'bread'], ["Mama's Kitchen", 4, 3, 'Home-cooked meals to order.', false, null, 'home food']];
  const ls = new Set();
  items.forEach(([name, ci, ai, description, feat, hours, tags], i) => {
    const slug = uniqueSlug(name, ls);
    ls.add(slug);
    d.listings.push({ id: crypto.randomUUID(), slug, name, categoryId: d.categories[ci].id, areaId: d.areas[ai].id, description, address: (ar ? 'شارع 9، ' : '9 Main St, ') + areaNames[ai], phone: '+20 100 123 45' + i + i, whatsapp: '+2010012345' + i + i, website: '', facebook: '', instagram: '', tags, lat: 29.96 + i * 0.003, lng: 31.25 + i * 0.002, hours, photos: [], priceLevel: (i % 3) + 1, featuredUntil: feat ? '2099-12-31' : '', status: 'published', views: 40 + i * 13, clicks: { call: 3 + i, whatsapp: 5 + i * 2, directions: 2 + i, website: 0 }, createdAt: new Date(Date.now() - i * 864e5).toISOString(), updatedAt: new Date().toISOString() });
  });
  const reviews = ar ? [['سارة', 5, 'مكان جميل وخدمة ممتازة'], ['أحمد', 4, 'الأسعار مناسبة والأكل حلو']] : [['Sara', 5, 'Lovely place, great service'], ['Ahmed', 4, 'Good food, fair prices']];
  for (const l of d.listings.slice(0, 4)) for (const [name, rating, text] of reviews) d.reviews.push({ id: crypto.randomUUID(), listingId: l.id, name, rating, text, status: 'approved', at: new Date(Date.now() - 2 * 864e5).toISOString(), ip: '' });
  d.reviews.push({ id: crypto.randomUUID(), listingId: d.listings[0].id, name: ar ? 'زائر' : 'Visitor', rating: 3, text: ar ? 'كان زحمة شوية' : 'A bit crowded', status: 'pending', at: new Date().toISOString(), ip: '' });
  return d;
}
