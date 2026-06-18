import { renderTemplate } from '../../lib/template.js';

export default {
  id: 'loan-history',
  templateUrl: new URL('./template.html', import.meta.url),
  styleUrl: new URL('./style.css', import.meta.url),
  async getState() {
    return {};
  },
  async render(ctx) {
    return renderTemplate(ctx.template, ctx.state);
  }
};
