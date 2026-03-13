import readingRoom from './components/reading-room/component.js';

export const componentDefinitions = [
  {
    ...readingRoom,
    selector: 'nde-physical-availability-line-bottom'
  }
];

// Example additional hook points for the same component:
// export const componentDefinitions = [
//   { ...readingRoom, selector: 'nde-physical-availability-line-top' },
//   { ...readingRoom, selector: 'nde-physical-availability-line-bottom' },
//   { ...readingRoom, selector: 'nde-physical-availability-line-before' },
//   { ...readingRoom, selector: 'nde-physical-availability-line-after' }
// ];
