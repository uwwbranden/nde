import {
  getLocationCandidates,
  getMatchers,
  getSettingValue,
  isDebugEnabled,
  matchesCurrentPeriodicals,
  parseBoolean,
  setArrowHidden
} from './component.js';

function isArrowHidingEnabled(settings) {
  return parseBoolean(getSettingValue(settings, ['hideArrow'], false));
}

export default {
  id: 'hide-periodical-arrow',
  async update(ctx) {
    const hideArrow = isArrowHidingEnabled(ctx.settings);
    const candidates = getLocationCandidates(ctx);
    const matchers = getMatchers(ctx.settings);
    const shouldHide = hideArrow && matchesCurrentPeriodicals(candidates, matchers);

    setArrowHidden(ctx.element, shouldHide);

    if (ctx.element.style) {
      ctx.element.style.display = 'none';
    }

    if (isDebugEnabled(ctx.settings)) {
      console.log('hide-periodical-arrow location-top debug context', {
        currentUrl: ctx.currentUrl,
        hideArrow,
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
