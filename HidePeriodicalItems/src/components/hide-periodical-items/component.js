import { collectPrimitivePaths, normalizeText, parseBoolean, toList } from '../../lib/record-utils.js';
import { getSettingValue } from '../../lib/settings.js';

export { getSettingValue } from '../../lib/settings.js';
export { parseBoolean } from '../../lib/record-utils.js';

const DEFAULT_MATCHERS = ['current periodicals'];
const LOCATION_KEY_PATTERN = /(location|library|collection|sublocation|callnumber|call_number|holding|availability|label|name|code|display)/i;

export function isDebugEnabled(settings) {
  return parseBoolean(getSettingValue(settings, ['debug', 'debugHidePeriodicalItems', 'hidePeriodicalItemsDebug'], false));
}

export function getMatchers(settings) {
  const configured = toList(
    getSettingValue(settings, ['locationMatchers', 'matchers', 'periodicalLocationMatchers', 'periodicalLocations'], [])
  );

  return (configured.length > 0 ? configured : DEFAULT_MATCHERS).map(normalizeText).filter(Boolean);
}

export function getLocationCandidates(ctx) {
  const includeKey = (key) => LOCATION_KEY_PATTERN.test(key);
  return [
    ...collectPrimitivePaths(ctx.record, { rootPath: 'record', includeKey }),
    ...collectPrimitivePaths(ctx.hostComponent, { rootPath: 'hostComponent', includeKey })
  ].filter((entry) => typeof entry.value === 'string' || typeof entry.value === 'number');
}

export function matchesCurrentPeriodicals(candidates, matchers) {
  return candidates.some((candidate) => {
    const value = normalizeText(candidate.value);
    return matchers.some((matcher) => value === matcher || value.includes(matcher));
  });
}

export function findLocationItemsElement(element) {
  const previousElement = element.previousElementSibling;
  const location = findLocationElement(element);

  return (
    element.matches?.('nde-location-items-container')
      ? element
      : previousElement?.matches?.('nde-location-items-container')
        ? previousElement
        : element.querySelector?.('nde-location-items-container') ??
        element.closest?.('nde-location-items-container') ??
        element.parentElement?.closest('nde-location-items-container') ??
        location?.querySelector?.('nde-location-items-container') ??
        element.parentElement?.querySelector?.('nde-location-items-container') ??
        null
  );
}

export function findLocationElement(element) {
  return element.closest('nde-location') ?? element.parentElement?.closest('nde-location') ?? null;
}

export function findExpandArrow(element) {
  const location = findLocationElement(element);
  return (
    location?.querySelector('mat-icon[data-mat-icon-name="Arrow-down"]') ??
    location?.querySelector('.accordion-header button mat-icon') ??
    null
  );
}

export function setHidden(container, shouldHide) {
  if (!container) {
    return;
  }

  if (shouldHide) {
    container.dataset.hidePeriodicalItemsOriginalDisplay ??= container.style.display ?? '';
    container.style.display = 'none';
    container.setAttribute('data-hide-periodical-items-hidden', 'true');
    return;
  }

  if (container.getAttribute('data-hide-periodical-items-hidden') === 'true') {
    container.style.display = container.dataset.hidePeriodicalItemsOriginalDisplay ?? '';
    delete container.dataset.hidePeriodicalItemsOriginalDisplay;
    container.removeAttribute('data-hide-periodical-items-hidden');
  }
}

export function setArrowHidden(element, shouldHide) {
  const arrow = findExpandArrow(element);
  if (!arrow) {
    return;
  }

  if (shouldHide) {
    arrow.dataset.hidePeriodicalItemsOriginalDisplay ??= arrow.style.display ?? '';
    arrow.style.display = 'none';
    arrow.setAttribute('data-hide-periodical-items-arrow-hidden', 'true');
    return;
  }

  if (arrow.getAttribute('data-hide-periodical-items-arrow-hidden') === 'true') {
    arrow.style.display = arrow.dataset.hidePeriodicalItemsOriginalDisplay ?? '';
    delete arrow.dataset.hidePeriodicalItemsOriginalDisplay;
    arrow.removeAttribute('data-hide-periodical-items-arrow-hidden');
  }
}

export function cleanupObserver(element) {
  if (element.__hidePeriodicalItemsObserver?.disconnect) {
    element.__hidePeriodicalItemsObserver.disconnect();
  }
  element.__hidePeriodicalItemsObserver = null;
}

export function ensureItemsObserver(element, shouldHide) {
  if (!shouldHide || element.__hidePeriodicalItemsObserver || typeof MutationObserver === 'undefined') {
    return;
  }

  const location = findLocationElement(element) ?? element;
  element.__hidePeriodicalItemsObserver = new MutationObserver(() => {
    setHidden(findLocationItemsElement(element), true);
    setArrowHidden(element, true);
  });
  element.__hidePeriodicalItemsObserver.observe(location, {
    childList: true,
    subtree: true
  });
}

export const internals = {
  getMatchers,
  getLocationCandidates,
  matchesCurrentPeriodicals
};

export default {
  id: 'hide-periodical-items',
  async update(ctx) {
    const candidates = getLocationCandidates(ctx);
    const matchers = getMatchers(ctx.settings);
    const shouldHide = matchesCurrentPeriodicals(candidates, matchers);
    const container = findLocationItemsElement(ctx.element);

    setHidden(container, shouldHide);
    if (ctx.element.style) {
      ctx.element.style.display = 'none';
    }

    if (isDebugEnabled(ctx.settings)) {
      console.log('hide-periodical-items container debug context', {
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
    setHidden(findLocationItemsElement(element), false);
  }
};
