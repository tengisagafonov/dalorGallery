import type { Core } from '@strapi/strapi';

type Labels = Record<string, { label: string; description?: string }>;

const TEMPLATE_LABELS: Labels = {
  title: { label: 'Titel (Englisch)', description: 'Englisch ist die Hauptsprache.' },
  legacyId: { label: 'Alte Katalognummer', description: 'Wird nur für die einmalige Übernahme verwendet.' },
  slug: { label: 'Interne Kennung', description: 'Wird automatisch aus dem englischen Titel erstellt.' },
  description: { label: 'Beschreibung (Englisch)' },
  titleDe: { label: 'Titel (Deutsch)' },
  descriptionDe: { label: 'Beschreibung (Deutsch)' },
  titleRu: { label: 'Titel (Russisch)' },
  descriptionRu: { label: 'Beschreibung (Russisch)' },
  titleHi: { label: 'Titel (Hindi)' },
  descriptionHi: { label: 'Beschreibung (Hindi)' },
  titlePa: { label: 'Titel (Punjabi)' },
  descriptionPa: { label: 'Beschreibung (Punjabi)' },
  autoTranslate: { label: 'Jetzt automatisch übersetzen', description: 'Aktivieren und speichern. Leere Sprachfelder und Suchbegriffe werden automatisch ergänzt.' },
  parentCategory: { label: 'Übergeordnete Kategorie', description: 'Beispiel: Fashion. Bei einer Hauptkategorie leer lassen.' },
  parent: { label: 'Übergeordnete Kategorie' },
  children: { label: 'Unterkategorien' },
  prompt: { label: 'Bild-Prompt', description: 'Variablen werden so geschrieben: {{brand}}.' },
  image: { label: 'Vorschaubild' },
  category: { label: 'Kategorie' },
  subcategory: { label: 'Unterkategorie' },
  eyebrow: { label: 'Kleine Überschrift im Motiv' },
  headline: { label: 'Große Überschrift im Motiv' },
  subline: { label: 'Unterzeile im Motiv' },
  style: { label: 'Darstellungsstil' },
  coverFit: { label: 'Bildanpassung' },
  inputFields: { label: 'Anpassbare Eingabefelder' },
  searchKeywords: { label: 'Suchbegriffe in allen Sprachen', description: 'Als Liste eintragen, zum Beispiel ["Schuhe", "shoes", "обувь", "जूते", "ਜੁੱਤੇ"].' },
  isPopular: { label: 'Unter „Beliebt“ anzeigen' },
  isTrending: { label: 'Unter „Trending“ anzeigen' },
  sortOrder: { label: 'Reihenfolge' },
};

const CATEGORY_LABELS: Labels = {
  name: { label: 'Name (Englisch)', description: 'Englisch ist die Hauptsprache.' },
  nameDe: { label: 'Name (Deutsch)' },
  nameRu: { label: 'Name (Russisch)' },
  nameHi: { label: 'Name (Hindi)' },
  namePa: { label: 'Name (Punjabi)' },
  autoTranslate: { label: 'Jetzt automatisch übersetzen', description: 'Aktivieren und speichern, um leere Übersetzungen automatisch zu ergänzen.' },
  slug: { label: 'Interne Kennung' },
  icon: { label: 'Symbol' },
  description: { label: 'Beschreibung (Englisch)' },
  descriptionDe: { label: 'Beschreibung (Deutsch)' },
  descriptionRu: { label: 'Beschreibung (Russisch)' },
  descriptionHi: { label: 'Beschreibung (Hindi)' },
  descriptionPa: { label: 'Beschreibung (Punjabi)' },
  sortOrder: { label: 'Reihenfolge' },
  templates: { label: 'Zugeordnete Vorlagen' },
  subcategoryTemplates: { label: 'Vorlagen dieser Unterkategorie' },
};

const FIELD_LABELS: Labels = {
  key: { label: 'Variablenname', description: 'Beispiel: brand gehört zu {{brand}} im Bild-Prompt.' },
  label: { label: 'Name auf der Website', description: 'Beispiel: Markenname.' },
  labelDe: { label: 'Name (Deutsch)' },
  labelRu: { label: 'Name (Russisch)' },
  labelHi: { label: 'Name (Hindi)' },
  labelPa: { label: 'Name (Punjabi)' },
  inputType: { label: 'Art des Feldes', description: 'Meistens ist „text“ richtig.' },
  placeholder: { label: 'Vorausgefüllter Beispielwert' },
  placeholderDe: { label: 'Beispielwert (Deutsch)' },
  placeholderRu: { label: 'Beispielwert (Russisch)' },
  placeholderHi: { label: 'Beispielwert (Hindi)' },
  placeholderPa: { label: 'Beispielwert (Punjabi)' },
  required: { label: 'Pflichtfeld' },
  autoTranslate: { label: 'Automatisch übersetzen', description: 'Bei neuen Variablen automatisch aktiv. Übersetzt Name und Beispielwert beim Speichern und schaltet sich danach wieder aus.' },
};

function applyLabels(configuration: any, labels: Labels) {
  const metadatas = { ...configuration.metadatas };

  for (const [field, text] of Object.entries(labels)) {
    if (!metadatas[field]) continue;
    metadatas[field] = {
      ...metadatas[field],
      edit: { ...metadatas[field].edit, ...text },
      list: { ...metadatas[field].list, label: text.label },
    };
  }

  return { ...configuration, metadatas };
}

export async function configureGermanAdmin(strapi: Core.Strapi) {
  await strapi.db.query('admin::user').updateMany({
    where: {},
    data: { preferedLanguage: 'de' },
  });

  const plugin = strapi.plugin('content-manager');
  const contentTypes = plugin.service('content-types');
  const components = plugin.service('components');

  for (const [uid, labels] of [
    ['api::template.template', TEMPLATE_LABELS],
    ['api::category.category', CATEGORY_LABELS],
  ] as const) {
    const model = contentTypes.findContentType(uid);
    const configuration = await contentTypes.findConfiguration(model);
    await contentTypes.updateConfiguration(model, applyLabels(configuration, labels));
  }

  const component = components.findComponent('template.input-field');
  const configuration = await components.findConfiguration(component);
  await components.updateConfiguration(component, applyLabels(configuration, FIELD_LABELS));
}
