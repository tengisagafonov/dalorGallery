import { localize, localizedField, TARGETS } from './openai-translate';

type Data = Record<string, any>;

export async function translateCategory(data: Data) {
  if (data.autoTranslate !== true) return;
  const sources = [data.name, data.description].filter((value): value is string => Boolean(value));
  const localized = await localize(sources, []);

  for (const target of TARGETS) {
    let index = 0;
    for (const field of ['name', 'description']) {
      if (!data[field]) continue;
      data[localizedField(field, target)] ||= localized[target].translations[index++];
    }
  }
  data.autoTranslate = false;
}

export async function translateTemplate(data: Data) {
  const translateTemplateFields = data.autoTranslate === true;
  const textFields = ['title', 'description'];
  const fields = data.inputFields ?? [];
  const fieldsToTranslate = fields.filter((field: Data) =>
    field.autoTranslate === true || field.id == null,
  );
  if (!translateTemplateFields && fieldsToTranslate.length === 0) return;
  const sources = [
    ...(translateTemplateFields
      ? textFields.flatMap((field) => data[field] ? [String(data[field])] : [])
      : []),
    ...fieldsToTranslate.flatMap((field: Data) =>
      [field.label, field.placeholder].filter(Boolean).map(String),
    ),
  ];
  const englishKeywords = Array.isArray(data.searchKeywords)
    ? data.searchKeywords.filter((value: unknown): value is string => typeof value === 'string')
    : [];
  const localized = await localize(sources, englishKeywords);

  for (const target of TARGETS) {
    let index = 0;
    if (translateTemplateFields) {
      for (const field of textFields) {
        if (!data[field]) continue;
        data[localizedField(field, target)] ||= localized[target].translations[index++];
      }
    }
    for (const inputField of fieldsToTranslate) {
      for (const name of ['label', 'placeholder']) {
        if (!inputField[name]) continue;
        inputField[localizedField(name, target)] ||= localized[target].translations[index++];
      }
    }
  }
  for (const inputField of fieldsToTranslate) inputField.autoTranslate = false;
  if (translateTemplateFields) {
    data.searchKeywords = [...new Set([
      ...englishKeywords,
      ...TARGETS.flatMap((target) => localized[target].keywords),
    ])];
    data.autoTranslate = false;
  }
}
