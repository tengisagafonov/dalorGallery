import { translateTemplate } from '../../../../services/auto-translate';

export default {
  async beforeCreate(event: any) {
    await translateTemplate(event.params.data);
  },
  async beforeUpdate(event: any) {
    await translateTemplate(event.params.data);
  },
};
