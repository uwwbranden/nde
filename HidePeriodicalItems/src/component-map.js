import hidePeriodicalItems from './components/hide-periodical-items/component.js';
import hidePeriodicalArrow from './components/hide-periodical-items/arrow-component.js';

export const componentDefinitions = [
  {
    ...hidePeriodicalItems,
    selector: 'nde-location-items-container-after'
  },
  {
    ...hidePeriodicalArrow,
    selector: 'nde-location-top'
  }
];
