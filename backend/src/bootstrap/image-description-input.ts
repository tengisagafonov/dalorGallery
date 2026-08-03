import type { Core } from '@strapi/strapi';
import { IMAGE_DESCRIPTION_FIELD } from '../services/image-description-input';

const UID = 'api::template.template' as const;

type InputField = Record<string, unknown> & { key?: string };
type TemplateDocument = {
  documentId: string;
  inputFields?: InputField[];
};

export async function seedImageDescriptionInput(strapi: Core.Strapi) {
  const documents = strapi.documents(UID);
  const [drafts, published] = await Promise.all([
    documents.findMany({ status: 'draft', populate: { inputFields: true } }),
    documents.findMany({ status: 'published', fields: ['documentId'] }),
  ]) as [TemplateDocument[], TemplateDocument[]];
  const publishedIds = new Set(published.map(({ documentId }) => documentId));
  const manager = strapi.plugin('content-manager').service('document-manager');

  for (const template of drafts) {
    const fields = template.inputFields ?? [];
    if (fields.some(({ key }) => key === IMAGE_DESCRIPTION_FIELD.key)) continue;

    await manager.update(template.documentId, UID, {
      data: { inputFields: [IMAGE_DESCRIPTION_FIELD, ...fields] },
      populate: {},
    });
    if (publishedIds.has(template.documentId)) {
      await manager.publish(template.documentId, UID, { populate: {} });
    }
  }
}
