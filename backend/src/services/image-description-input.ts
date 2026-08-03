export const IMAGE_DESCRIPTION_FIELD = {
  key: 'image_description',
  label: 'Describe your desired image',
  labelDe: 'Beschreibe dein gewünschtes Bild',
  labelRu: 'Опишите желаемое изображение',
  labelHi: 'अपनी मनचाही तस्वीर का वर्णन करें',
  labelPa: 'ਆਪਣੀ ਮਨਚਾਹੀ ਤਸਵੀਰ ਦਾ ਵਰਣਨ ਕਰੋ',
  inputType: 'textarea',
  placeholder: 'For example: A red sports car driving through Vienna at sunset...',
  placeholderDe: 'Zum Beispiel: Ein roter Sportwagen fährt bei Sonnenuntergang durch Wien...',
  placeholderRu: 'Например: Красный спортивный автомобиль едет по Вене на закате...',
  placeholderHi: 'उदाहरण: सूर्यास्त के समय वियना में चलती हुई लाल स्पोर्ट्स कार...',
  placeholderPa: 'ਉਦਾਹਰਨ: ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਵੀਅਨਾ ਵਿੱਚ ਚੱਲਦੀ ਲਾਲ ਸਪੋਰਟਸ ਕਾਰ...',
  required: false,
  autoTranslate: false,
};

export function ensureImageDescriptionInput(data: Record<string, any>) {
  const fields = Array.isArray(data.inputFields) ? data.inputFields : [];
  if (!fields.some((field) => field?.key === IMAGE_DESCRIPTION_FIELD.key)) {
    data.inputFields = [IMAGE_DESCRIPTION_FIELD, ...fields];
  }
}
