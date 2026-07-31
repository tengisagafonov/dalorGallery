import type { Schema, Struct } from '@strapi/strapi';

export interface TemplateInputField extends Struct.ComponentSchema {
  collectionName: 'components_template_input_fields';
  info: {
    description: 'Ein Feld, das Besucher im Prompt anpassen k\u00F6nnen';
    displayName: 'Eingabefeld';
  };
  attributes: {
    inputType: Schema.Attribute.Enumeration<
      ['text', 'textarea', 'number', 'color', 'select']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'text'>;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    labelDe: Schema.Attribute.String;
    labelHi: Schema.Attribute.String;
    labelPa: Schema.Attribute.String;
    labelRu: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
    placeholderDe: Schema.Attribute.String;
    placeholderHi: Schema.Attribute.String;
    placeholderPa: Schema.Attribute.String;
    placeholderRu: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'template.input-field': TemplateInputField;
    }
  }
}
