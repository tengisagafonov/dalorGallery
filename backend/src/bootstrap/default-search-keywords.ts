import type { Core } from '@strapi/strapi';

const SEARCH_KEYWORDS: Record<string, string[]> = {
  'Logo': [
    'logo', 'branding', 'brand mark', 'emblem', 'firmenlogo', 'marke',
    'логотип', 'бренд', 'लोगो', 'ब्रांड', 'ਲੋਗੋ', 'ਬ੍ਰਾਂਡ',
  ],
  'Sneaker Sale Poster': [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'footwear', 'schuh', 'schuhe',
    'turnschuhe', 'обувь', 'кроссовки', 'जूता', 'जूते', 'ਜੁੱਤਾ', 'ਜੁੱਤੇ',
  ],
  'Perfume Promotion': [
    'perfume', 'fragrance', 'scent', 'parfum', 'duft', 'parfüm',
    'парфюм', 'духи', 'इत्र', 'परफ्यूम', 'ਅਤਰ', 'ਪਰਫਿਊਮ',
  ],
  'Food Ad Poster': [
    'burger', 'food', 'fast food', 'fries', 'essen', 'pommes',
    'бургер', 'еда', 'बर्गर', 'खाना', 'ਬਰਗਰ', 'ਖਾਣਾ',
  ],
  'Skincare Social Post': [
    'skincare', 'serum', 'vitamin c', 'beauty', 'hautpflege', 'kosmetik',
    'уход', 'сыворотка', 'त्वचा', 'सीरम', 'ਸਕਿਨਕੇਅਰ', 'ਸੀਰਮ',
  ],
  'Tech Product Ad': [
    'headphones', 'audio', 'technology', 'electronics', 'kopfhörer', 'technik',
    'наушники', 'аудио', 'हेडफोन', 'तकनीक', 'ਹੈੱਡਫੋਨ', 'ਤਕਨਾਲੋਜੀ',
  ],
  'Event Promotion': [
    'festival', 'event', 'concert', 'summer', 'fest', 'veranstaltung',
    'фестиваль', 'концерт', 'त्योहार', 'उत्सव', 'ਤਿਉਹਾਰ', 'ਸਮਾਗਮ',
  ],
  'Watch Collection': [
    'watch', 'watches', 'luxury watch', 'uhr', 'armbanduhr',
    'часы', 'наручные часы', 'घड़ी', 'ਕਲਾਈ ਘੜੀ', 'ਘੜੀ',
  ],
  'Shoes Promotion': [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'footwear', 'schuh', 'schuhe',
    'turnschuhe', 'обувь', 'кроссовки', 'जूता', 'जूते', 'ਜੁੱਤਾ', 'ਜੁੱਤੇ',
  ],
  'Accessories Promo': [
    'handbag', 'bag', 'purse', 'accessories', 'tasche', 'handtasche',
    'сумка', 'аксессуары', 'बैग', 'पर्स', 'ਬੈਗ', 'ਪਰਸ',
  ],
};

export async function seedDefaultSearchKeywords(strapi: Core.Strapi) {
  const documents = strapi.documents('api::template.template');
  const templates = await documents.findMany({
    fields: ['title', 'searchKeywords'],
    status: 'draft',
  });

  for (const template of templates) {
    if (typeof template.title !== 'string') continue;
    const keywords = SEARCH_KEYWORDS[template.title];
    const current = template.searchKeywords;
    const isPlaceholder = Array.isArray(current) && current.length === 1 && current[0] === 'test';
    if (!keywords || (Array.isArray(current) && current.length > 0 && !isPlaceholder)) continue;

    await documents.update({
      documentId: template.documentId,
      data: { searchKeywords: keywords },
      status: 'published',
    });
  }
}
