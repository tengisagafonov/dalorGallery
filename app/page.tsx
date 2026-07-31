import { GalleryClient } from "./gallery/gallery-app";
import { getStrapiCategories } from "./gallery/data/strapi-category-repository";
import { getStrapiTemplates } from "./gallery/data/strapi-template-repository";

export default async function Home() {
  const [strapiCategories, strapiTemplates] = await Promise.all([
    getStrapiCategories(),
    getStrapiTemplates(),
  ]);

  return <GalleryClient strapiCategories={strapiCategories} strapiTemplates={strapiTemplates} />;
}
