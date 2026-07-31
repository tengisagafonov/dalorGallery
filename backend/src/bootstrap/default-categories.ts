import type { Core } from '@strapi/strapi';

const DEFAULT_CATEGORIES = [
  { name: 'Popular', slug: 'popular', icon: 'crown' },
  { name: 'Trending', slug: 'trending', icon: 'flame' },
  { name: 'Advertising', slug: 'advertising', icon: 'megaphone' },
  { name: 'E-Commerce', slug: 'e-commerce', icon: 'bag' },
  { name: 'Social Media', slug: 'social-media', icon: 'share' },
  { name: 'Product Photography', slug: 'product-photography', icon: 'camera' },
  { name: 'Fashion', slug: 'fashion', icon: 'shirt' },
  { name: 'Beauty', slug: 'beauty', icon: 'spark' },
  { name: 'Food', slug: 'food', icon: 'utensils' },
  { name: 'Real Estate', slug: 'real-estate', icon: 'home' },
  { name: 'Electronics', slug: 'electronics', icon: 'monitor' },
  { name: 'Seasonal', slug: 'seasonal', icon: 'calendar' },
  { name: 'Home & furniture', slug: 'home-furniture', icon: 'furniture' },
  { name: 'Food & drinks', slug: 'food-drinks', icon: 'drinks' },
  { name: 'Gadgets', slug: 'gadgets', icon: 'smartphone' },
  { name: 'Accessories', slug: 'accessories', icon: 'gem' },
  { name: 'Clothing & apparel', slug: 'clothing-apparel', icon: 'shirt' },
  { name: 'Apartment / interior', slug: 'apartment-interior', icon: 'interior' },
  { name: 'Car / vehicle', slug: 'car-vehicle', icon: 'car' },
  { name: 'Other', slug: 'other', icon: 'other' },
] as const;

export async function seedDefaultCategories(strapi: Core.Strapi) {
  const documents = strapi.documents('api::category.category');
  const existing = await documents.findMany({
    fields: ['name'],
    status: 'draft',
  });
  for (const [sortOrder, category] of DEFAULT_CATEGORIES.entries()) {
    const current = existing.find(({ name }) => name === category.name);
    if (current) {
      await documents.update({
        documentId: current.documentId,
        data: { ...category, sortOrder },
        status: 'published',
      });
    } else {
      await documents.create({
        data: { ...category, sortOrder },
        status: 'published',
      });
    }
  }
}
