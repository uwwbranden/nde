import { parseBoolean } from '../../lib/record-utils.js';
import { renderTemplate } from '../../lib/template.js';

const TARGET_LDS08 =
  'Use the Request to view in Reading Room option above to arrange for viewing at your campus archives.';
let debugModulePromise = null;

function getRecordData(record) {
  if (record?.pnx?.display) {
    return record;
  }

  if (record?.searchResult?.pnx?.display) {
    return record.searchResult;
  }

  return record ?? null;
}

function shouldDebugLocally() {
  const hostname = globalThis?.location?.hostname ?? '';
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function debugEvaluation(payload) {
  if (!shouldDebugLocally()) {
    return;
  }

  debugModulePromise ??= import('../../local/debug-reading-room.js').catch(() => null);
  const debugModule = await debugModulePromise;
  debugModule?.logReadingRoomEvaluation(payload);
}

function getHref(record) {
  const recordData = getRecordData(record);

  if (!recordData?.pnx?.display) {
    return null;
  }

  const titleVal = recordData?.pnx?.display?.title?.[0];
  const creatorVal = recordData?.pnx?.display?.creator?.[0];
  const identifierVal = recordData?.pnx?.display?.identifier?.[0];
  const callNumberVal = recordData?.delivery?.bestlocation?.callNumber;

  const title = encodeURIComponent(titleVal || '');
  const au = encodeURIComponent(creatorVal || '');
  const oclc = encodeURIComponent(identifierVal || '');
  const call = encodeURIComponent(callNumberVal || '');

  return `https://forms.library.wisconsin.edu/request-material?title=${title}&author=${au}&oclc=${oclc}&call_number=${call}`;
}

function isVisible(record, settings) {
  const recordData = getRecordData(record);
  const showInBriefResults = parseBoolean(settings?.showInBriefResults, false);
  const isBriefResultsPath = (globalThis?.location?.pathname ?? '').startsWith('/nde/search');
  if (isBriefResultsPath && !showInBriefResults) {
    return false;
  }

  const lds08Values = recordData?.pnx?.display?.lds08;
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

    await debugEvaluation({
      href,
      visible,
      hostComponent: ctx.hostComponent,
      resolvedRecord: getRecordData(ctx.record),
      settings: ctx.settings ?? {},
      record: ctx.record
    });

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
