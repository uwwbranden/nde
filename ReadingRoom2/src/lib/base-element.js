import { getRecordSource, isObservableLike } from './record-utils.js';

const textCache = new Map();

async function loadText(url) {
  const cacheKey = String(url);
  if (!textCache.has(cacheKey)) {
    textCache.set(
      cacheKey,
      fetch(url).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${cacheKey}`);
        }
        return response.text();
      })
    );
  }

  return textCache.get(cacheKey);
}

export function createElementClass(definition, runtimeContext) {
  return class StaticAddonElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hostComponent = null;
      this._record = null;
      this._subscription = null;
      this._template = '';
      this._style = '';
      this._assetsLoaded = false;
    }

    connectedCallback() {
      this.refresh();
    }

    disconnectedCallback() {
      this.cleanupSubscription();
    }

    set hostComponent(value) {
      this._hostComponent = value;
      this.refresh();
    }

    get hostComponent() {
      return this._hostComponent;
    }

    cleanupSubscription() {
      if (this._subscription?.unsubscribe) {
        this._subscription.unsubscribe();
      }
      this._subscription = null;
    }

    async ensureAssets() {
      if (this._assetsLoaded) {
        return;
      }

      const [template, style] = await Promise.all([
        loadText(definition.templateUrl),
        loadText(definition.styleUrl)
      ]);

      this._template = template;
      this._style = style;
      this._assetsLoaded = true;
    }

    async refresh() {
      await this.ensureAssets();
      this.cleanupSubscription();

      const source = getRecordSource(this._hostComponent);

      if (isObservableLike(source)) {
        this._subscription = source.subscribe({
          next: async (record) => {
            this._record = record;
            await this.render();
          },
          error: (error) => console.error(`${definition.id} subscription error`, error)
        });
        return;
      }

      this._record = source;
      await this.render();
    }

    async render() {
      const ctx = {
        hostComponent: this._hostComponent,
        record: this._record,
        settings: runtimeContext.settings ?? {},
        shellRouter: runtimeContext.shellRouter ?? null,
        template: this._template,
        getSetting(key, fallbackValue = null) {
          return runtimeContext.settings?.[key] ?? fallbackValue;
        }
      };

      const state = await definition.getState(ctx);
      const html = await definition.render({
        ...ctx,
        state
      });

      this.shadowRoot.innerHTML = `<style>${this._style}</style>${html}`;
    }
  };
}
