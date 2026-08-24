import type { Core } from '@strapi/strapi';
import { ensureImageDescriptionInput } from '../services/image-description-input';

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
    const data = { inputFields: template.inputFields ?? [] };
    if (!ensureImageDescriptionInput(data, true)) continue;

    await manager.update(template.documentId, UID, {
      data: { inputFields: data.inputFields },
      populate: {},
    });
    if (publishedIds.has(template.documentId)) {
      await manager.publish(template.documentId, UID, { populate: {} });
    }
  }
}
