export function getModuleParameters(providers = []) {
  if (!Array.isArray(providers)) {
    return {};
  }

  const moduleParamsProvider = providers.find((provider) => {
    const token = provider?.provide;
    const tokenName = token?.toString?.();
    return token === 'MODULE_PARAMETERS' || tokenName === 'MODULE_PARAMETERS' || tokenName === 'Symbol(MODULE_PARAMETERS)';
  });

  return normalizeSettings(moduleParamsProvider?.useValue);
}

export function getBootstrapParameters(bootstrapOptions = {}) {
  return normalizeSettings(
    bootstrapOptions.parameters ??
      bootstrapOptions.settings ??
      bootstrapOptions.moduleParameters ??
      bootstrapOptions.moduleParams ??
      bootstrapOptions.params ??
      bootstrapOptions.config
  );
}

export async function loadFallbackSettings(importMetaUrl) {
  const settingsUrl = new URL('../settings.json', importMetaUrl);

  try {
    const response = await fetch(settingsUrl);
    if (!response.ok) {
      return {};
    }

    return await response.json();
  } catch {
    return {};
  }
}

export function normalizeSettings(value) {
  if (typeof value === 'string') {
    try {
      return normalizeSettings(JSON.parse(value));
    } catch {
      return {};
    }
  }

  if (Array.isArray(value)) {
    return value.reduce((settings, entry) => {
      if (entry && typeof entry === 'object') {
        const key = entry.key ?? entry.name;
        const entryValue = entry.value ?? entry.useValue;

        if (typeof key === 'string') {
          settings[key] = entryValue;
          return settings;
        }
      }

      return {
        ...settings,
        ...normalizeSettings(entry)
      };
    }, {});
  }

  if (value && typeof value === 'object') {
    const wrappedValue =
      value.settings ??
      value.moduleParameters ??
      value.moduleParams ??
      value.parameters ??
      value.params ??
      value.config ??
      null;

    if (wrappedValue != null) {
      return normalizeSettings(wrappedValue);
    }

    return value;
  }

  return {};
}

export function hasSettings(value) {
  return Object.keys(normalizeSettings(value)).length > 0;
}

export function getSettingValue(settings, keys, fallbackValue = undefined) {
  for (const key of keys) {
    if (settings?.[key] !== undefined) {
      return settings[key];
    }
  }

  return fallbackValue;
}
