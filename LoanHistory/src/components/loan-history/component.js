import { renderTemplate } from '../../lib/template.js';

export default {
  id: 'loan-history',
  async getState() {
    return {};
  },
  async render(ctx) {
    return renderTemplate(ctx.template, ctx.state);
  }
};
