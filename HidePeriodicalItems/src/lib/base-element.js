import { getRecordSource, isObservableLike } from './record-utils.js';

function getCurrentUrl(shellRouter) {
  const routerUrl = shellRouter?.url;
  if (routerUrl) {
    return String(routerUrl);
  }

  if (typeof window !== 'undefined') {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  return '';
}

function getEventUrl(event, fallbackUrl) {
  return event?.urlAfterRedirects ?? event?.url ?? fallbackUrl;
}

export function createElementClass(definition, runtimeContext) {
  return class StaticAddonElement extends HTMLElement {
    constructor() {
      super();
      this._hostComponent = null;
      this._record = null;
      this._subscription = null;
      this._routerSubscription = null;
      this._currentUrl = getCurrentUrl(runtimeContext.shellRouter);
    }

    connectedCallback() {
      this.refresh();
    }

    disconnectedCallback() {
      this.cleanupSubscription();
      this.cleanupRouterSubscription();
      definition.cleanup?.(this);
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

    cleanupRouterSubscription() {
      if (this._routerSubscription?.unsubscribe) {
        this._routerSubscription.unsubscribe();
      }
      this._routerSubscription = null;
    }

    ensureRouterSubscription() {
      if (this._routerSubscription || !isObservableLike(runtimeContext.shellRouter?.events)) {
        return;
      }

      this._routerSubscription = runtimeContext.shellRouter.events.subscribe({
        next: async (event) => {
          this._currentUrl = getEventUrl(event, getCurrentUrl(runtimeContext.shellRouter));
          await this.render();
        },
        error: (error) => console.error(`${definition.id} router subscription error`, error)
      });
    }

    async refresh() {
      this.ensureRouterSubscription();
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
      const settings = runtimeContext.settings ?? {};
      this._currentUrl = this._currentUrl || getCurrentUrl(runtimeContext.shellRouter);

      await definition.update({
        element: this,
        hostComponent: this._hostComponent,
        record: this._record,
        settings,
        shellRouter: runtimeContext.shellRouter ?? null,
        currentUrl: this._currentUrl,
        getSetting(key, fallbackValue = null) {
          return settings?.[key] ?? fallbackValue;
        }
      });
    }
  };
}
