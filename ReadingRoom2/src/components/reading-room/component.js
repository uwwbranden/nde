import { parseBoolean } from '../../lib/record-utils.js';
import { renderTemplate } from '../../lib/template.js';

const TARGET_LDS08 =
  'Use the Request to view in Reading Room option above to arrange for viewing at your campus archives.';

function getHref(record) {
  if (!record?.pnx?.display) {
    return null;
  }

  const titleVal = record?.pnx?.display?.title?.[0];
  const creatorVal = record?.pnx?.display?.creator?.[0];
  const identifierVal = record?.pnx?.display?.identifier?.[0];
  const callNumberVal = record?.delivery?.bestlocation?.callNumber;

  const title = encodeURIComponent(titleVal || '');
  const au = encodeURIComponent(creatorVal || '');
  const oclc = encodeURIComponent(identifierVal || '');
  const call = encodeURIComponent(callNumberVal || '');

  return `https://forms.library.wisconsin.edu/request-material?title=${title}&author=${au}&oclc=${oclc}&call_number=${call}`;
}

function isVisible(record, settings) {
  const showInBriefResults = parseBoolean(settings?.showInBriefResults, false);
  const isBriefResultsPath = (globalThis?.location?.pathname ?? '').startsWith('/nde/search');
  if (isBriefResultsPath && !showInBriefResults) {
    return false;
  }

  const lds08Values = record?.pnx?.display?.lds08;
  return Array.isArray(lds08Values) && lds08Values.some((value) =>
    typeof value === 'string' &&
    (value === TARGET_LDS08 || /request to view in reading room/i.test(value))
  );
}

export default {
  id: 'reading-room',
  templateUrl: new URL('./template.html', import.meta.url),
  styleUrl: new URL('./style.css', import.meta.url),
  async getState(ctx) {
    const href = getHref(ctx.record);
    const visible = isVisible(ctx.record, ctx.settings);

    return {
      visible,
      href
    };
  },
  async render(ctx) {
    if (!ctx.state.visible || !ctx.state.href) {
      return '';
    }

    return renderTemplate(ctx.template, ctx.state);
  }
};
