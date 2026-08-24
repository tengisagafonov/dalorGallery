/**
 * Einleitungen, an denen ein Platzhalter als *Beispiel* erkennbar ist.
 *
 * Wichtig: Platzhaltertexte werden im Frontend als Vorbelegung des Feldes verwendet.
 * Ein Beispieltext darf deshalb niemals in den fertigen Prompt wandern – sonst steht
 * z. B. „For example: A red sports car…" in einer Uhrenwerbung.
 * Das Gegenstück dieser Erkennung liegt in app/gallery/utils.ts (isExamplePlaceholder).
 */
const EXAMPLE_OPENERS = ['for example:', 'zum beispiel:', 'например:', 'उदाहरण:', 'ਉਦਾਹਰਨ:'];

export function isExamplePlaceholder(value: unknown) {
  const text = String(value ?? '').trim().toLowerCase();
  return EXAMPLE_OPENERS.some((opener) => text.startsWith(opener));
}

/** Beschriftungen der ersten Fassung – werden beim Start auf die neue Formulierung gehoben. */
const LEGACY_LABELS = new Set([
  'Describe your desired image',
  'Beschreibe dein gewünschtes Bild',
  'Опишите желаемое изображение',
  'अपनी मनचाही तस्वीर का वर्णन करें',
  'ਆਪਣੀ ਮਨਚਾਹੀ ਤਸਵੀਰ ਦਾ ਵਰਣਨ ਕਰੋ',
]);

/**
 * Das Feld benennt bewusst das Motiv und nicht „das Bild": Hintergrund, Layout, Licht und
 * Stil kommen aus dem Template. Auch der Beispieltext zeigt jetzt eine Motivbeschreibung
 * statt einer ganzen Szene, damit selbst getippte Eingaben die richtige Form haben.
 */
export const IMAGE_DESCRIPTION_FIELD = {
  key: 'image_description',
  label: 'What should be the main subject?',
  labelDe: 'Was soll im Mittelpunkt stehen?',
  labelRu: 'Что должно быть в центре внимания?',
  labelHi: 'मुख्य विषय क्या होना चाहिए?',
  labelPa: 'ਮੁੱਖ ਵਿਸ਼ਾ ਕੀ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ?',
  inputType: 'textarea',
  placeholder: 'For example: white chunky sneaker, blue accents, mesh and leather upper',
  placeholderDe: 'Zum Beispiel: weißer klobiger Sneaker, blaue Akzente, Mesh und Leder',
  placeholderRu: 'Например: белые массивные кроссовки, синие акценты, сетка и кожа',
  placeholderHi: 'उदाहरण: सफ़ेद चंकी स्नीकर, नीले एक्सेंट, मेश और चमड़ा',
  placeholderPa: 'ਉਦਾਹਰਨ: ਚਿੱਟਾ ਚੰਕੀ ਸਨੀਕਰ, ਨੀਲੇ ਐਕਸੈਂਟ, ਮੈਸ਼ ਅਤੇ ਚਮੜਾ',
  required: false,
  autoTranslate: false,
};

const LABEL_KEYS = ['label', 'labelDe', 'labelRu', 'labelHi', 'labelPa'] as const;
const PLACEHOLDER_KEYS = [
  'placeholder',
  'placeholderDe',
  'placeholderRu',
  'placeholderHi',
  'placeholderPa',
] as const;

/**
 * Hebt ein bestehendes Feld auf die aktuelle Formulierung.
 *
 * Beschriftungen werden nur ersetzt, solange sie noch die alte Standardfassung sind.
 * Beim Beispieltext gilt dasselbe: individuell gepflegte Vorgaben wie
 * „white chunky sneaker, blue accents…" bleiben unangetastet – sie sind echte
 * Standardwerte und keine Beispiele.
 */
function refreshWording(field: Record<string, any>) {
  let changed = false;

  if (LEGACY_LABELS.has(String(field.label ?? '').trim())) {
    for (const key of LABEL_KEYS) {
      if (field[key] !== IMAGE_DESCRIPTION_FIELD[key]) {
        field[key] = IMAGE_DESCRIPTION_FIELD[key];
        changed = true;
      }
    }
  }

  if (isExamplePlaceholder(field.placeholder)) {
    for (const key of PLACEHOLDER_KEYS) {
      if (field[key] !== IMAGE_DESCRIPTION_FIELD[key]) {
        field[key] = IMAGE_DESCRIPTION_FIELD[key];
        changed = true;
      }
    }
  }

  return changed;
}

export function ensureImageDescriptionInput(
  data: Record<string, any>,
  createWhenMissing = false,
) {
  if (!Array.isArray(data.inputFields)) {
    if (!createWhenMissing) return false;
    data.inputFields = [{ ...IMAGE_DESCRIPTION_FIELD }];
    return true;
  }

  const fields = data.inputFields as Record<string, any>[];
  const index = fields.findIndex(({ key }) => key === IMAGE_DESCRIPTION_FIELD.key);
  if (index < 0) {
    data.inputFields = [{ ...IMAGE_DESCRIPTION_FIELD }, ...fields];
    return true;
  }

  const field = { ...fields[index] };
  const wordingChanged = refreshWording(field);
  const alreadyInPlace = index === 0 && field.inputType === 'textarea';

  if (alreadyInPlace && !wordingChanged) return false;

  data.inputFields = [
    { ...field, inputType: 'textarea' },
    ...fields.filter((_, fieldIndex) => fieldIndex !== index),
  ];
  return true;
}
