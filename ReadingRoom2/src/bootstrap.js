import { componentDefinitions } from './component-map.js';
import { createElementClass } from './lib/base-element.js';
import { getModuleParameters, loadFallbackSettings } from './lib/settings.js';

// Builds the selector-to-element map that NDE uses to place custom elements.
export async function bootstrapRemoteApp(bootstrapOptions = {}) {
  const almaSettings = getModuleParameters(bootstrapOptions.providers ?? []);
  const settings = almaSettings ?? (await loadFallbackSettings(import.meta.url));

  const webComponentSelectorMap = new Map();

  for (const definition of componentDefinitions) {
    webComponentSelectorMap.set(
      definition.selector,
      createElementClass(definition, {
        settings,
        shellRouter: bootstrapOptions.shellRouter ?? null
      })
    );
  }

  const instance = {
    webComponentSelectorMap,
    getComponentRef(componentName) {
      return webComponentSelectorMap.get(componentName);
    }
  };

  console.log('minimal static add-on bootstrap success');

  return {
    instance,
    getComponentRef: instance.getComponentRef
  };
}
