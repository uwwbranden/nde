import { componentDefinitions } from './component-map.js';
import { createElementClass } from './lib/base-element.js';
import { getBootstrapParameters, getModuleParameters, hasSettings, loadFallbackSettings } from './lib/settings.js';

export async function bootstrapRemoteApp(bootstrapOptions = {}) {
  const providerSettings = getModuleParameters(bootstrapOptions.providers ?? []);
  const optionSettings = getBootstrapParameters(bootstrapOptions);
  const almaSettings = hasSettings(providerSettings) ? providerSettings : optionSettings;
  const settings = hasSettings(almaSettings) ? almaSettings : await loadFallbackSettings(import.meta.url);

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

  console.log('HidePeriodicalItems static add-on bootstrap success');

  return {
    instance,
    getComponentRef: instance.getComponentRef
  };
}
