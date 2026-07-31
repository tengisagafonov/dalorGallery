import { translateCategory } from '../../../../services/auto-translate';

export default {
  async beforeCreate(event: any) {
    await translateCategory(event.params.data);
  },
  async beforeUpdate(event: any) {
    await translateCategory(event.params.data);
  },
};
