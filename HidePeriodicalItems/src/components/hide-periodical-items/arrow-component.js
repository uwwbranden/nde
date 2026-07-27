import {
  getLocationCandidates,
  getMatchers,
  isDebugEnabled,
  matchesCurrentPeriodicals,
  setArrowHidden
} from './component.js';

export default {
  id: 'hide-periodical-arrow',
  async update(ctx) {
    const candidates = getLocationCandidates(ctx);
    const matchers = getMatchers(ctx.settings);
    const shouldHide = matchesCurrentPeriodicals(candidates, matchers);

    setArrowHidden(ctx.element, shouldHide);

    if (ctx.element.style) {
      ctx.element.style.display = 'none';
    }

    if (isDebugEnabled(ctx.settings)) {
      console.log('hide-periodical-arrow location-top debug context', {
        currentUrl: ctx.currentUrl,
        shouldHide,
        matchers,
        candidates,
        hostComponent: ctx.hostComponent,
        record: ctx.record
      });
    }
  },
  cleanup(element) {
    setArrowHidden(element, false);
  }
};
