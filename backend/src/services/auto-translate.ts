import { capToStringField } from './field-length';
import { localize, localizedField, TARGETS } from './openai-translate';

type Data = Record<string, any>;

/**
 * Felder, die im Schema als `string` liegen und deshalb bei 255 Zeichen enden.
 *
 * `description` fehlt hier bewusst: das ist ein `text` und darf lang sein. Eine Übersetzung
 * dort zu kürzen würde echten Inhalt abschneiden, statt einen Fehler zu verhindern.
 */
const STRING_FIELDS = new Set(['name', 'title', 'label', 'placeholder']);

/**
 * Setzt eine Übersetzung, ohne die Zählung zu verlieren.
 *
 * `ziel[feld] ||= liste[index++]` sieht harmlos aus, ist es aber nicht: bei `||=` wird die
 * rechte Seite gar nicht ausgewertet, wenn links schon ein Wert steht – `index` bleibt dann
 * stehen. Ist eine Sprachfassung vorbelegt und eine andere nicht, laufen die Durchgänge
 * auseinander und jede folgende Sprache bekommt die Übersetzung des falschen Feldes.
 * Deshalb wird der Wert immer entnommen und erst danach bedingt gesetzt.
 *
 * `source` ist der unlokalisierte Feldname – aus ihm ergibt sich, ob gekappt werden muss.
 * Russisch, Hindi und Panjabi geraten regelmäßig länger als das englische Original, eine
 * Begrenzung der Quelle allein reicht deshalb nicht.
 */
function assignTranslation(
  target: Data, source: string, localizedName: string, translations: string[], index: number,
) {
  const translation = translations[index];
  if (typeof translation === 'string') {
    target[localizedName] ||= STRING_FIELDS.has(source)
      ? capToStringField(translation)
      : translation;
  }
  return index + 1;
}

export async function translateCategory(data: Data) {
  if (data.autoTranslate !== true) return;
  const sources = [data.name, data.description].filter((value): value is string => Boolean(value));
  const localized = await localize(sources, []);

  for (const target of TARGETS) {
    let index = 0;
    for (const field of ['name', 'description']) {
      if (!data[field]) continue;
      index = assignTranslation(
        data, field, localizedField(field, target), localized[target].translations, index,
      );
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
        index = assignTranslation(
          data, field, localizedField(field, target), localized[target].translations, index,
        );
      }
    }
    for (const inputField of fieldsToTranslate) {
      for (const name of ['label', 'placeholder']) {
        if (!inputField[name]) continue;
        index = assignTranslation(
          inputField, name, localizedField(name, target), localized[target].translations, index,
        );
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
